#!/usr/bin/env node
import fs from 'node:fs/promises';
import { Command, InvalidArgumentError } from 'commander';
import pc from 'picocolors';
import { scanProject } from './core/scanner.js';
import { explainScores, findingsMeetThreshold } from './core/scoring.js';
import { conciseReport, htmlReport, jsonReport, markdownReport, sarifReport, terminalReport } from './reporters/index.js';
import { getRule } from './rules/index.js';
import type { Severity } from './shared.js';
import { severityRank } from './shared.js';

const severities = ['critical', 'high', 'medium', 'low', 'info'];

function severity(value: string): Severity {
  if (!severities.includes(value)) throw new InvalidArgumentError('Must be critical, high, medium, low, or info');
  return value as Severity;
}

const program = new Command();
program
  .name('production-check')
  .description('AI writes the code. Production Checker tells you if it is ready to ship.')
  .version('0.1.0')
  .argument('[path]', 'project directory to scan', '.')
  .option('-f, --format <format>', 'output format: terminal, json, markdown, sarif', 'terminal')
  .option('-o, --output <file>', 'write report to a file')
  .option('--html <file>', 'write a self-contained HTML report')
  .option('--ci', 'use concise CI output and exit 1 when the fail-on threshold is violated')
  .option('--fail-on <severity>', 'minimum severity that causes CI failure', severity)
  .action(async (target: string, options: { format: string; output?: string; html?: string; ci?: boolean; failOn?: Severity }) => {
    try {
      const result = await scanProject({ path: target });
      if (options.html) await fs.writeFile(options.html, htmlReport(result), 'utf8');
      const format = options.format.toLowerCase();
      if (options.output) {
        const content = reportFor(format, result, options.ci === true);
        await fs.writeFile(options.output, content, 'utf8');
      }
      if (format !== 'terminal' && !options.output) {
        process.stdout.write(reportFor(format, result, options.ci === true));
      } else if (format === 'terminal' && !options.output) {
        process.stdout.write(options.ci ? conciseReport(result) + '\n' : `${terminalReport(result)}\n`);
      }
      const failOn = options.failOn ?? result.config.failOn;
      if (options.ci && failOn && findingsMeetThreshold(result.findings, failOn)) {
        process.stderr.write(`Failing because findings meet or exceed ${failOn}\n`);
        process.exitCode = 1;
      }
    } catch (error) {
      process.stderr.write(`${pc.red('Error:')} ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    }
  });

program
  .command('explain <rule-id>')
  .description('Show detailed rule guidance and any current findings')
  .action(async (ruleId: string) => {
    const rule = getRule(ruleId.toUpperCase());
    if (!rule) throw new Error(`Unknown rule: ${ruleId}`);
    const result = await scanProject({ path: '.' });
    const findings = result.findings.filter((finding) => finding.ruleId === rule.id);
    process.stdout.write([
      `Rule ${rule.id}`,
      rule.title,
      '',
      `Severity: ${rule.severity}`,
      `Default confidence: ${rule.confidence}`,
      '',
      'Why it matters:',
      rule.description,
      '',
      'Detected in:',
      ...(findings.length ? findings.map((finding) => `${finding.file}:${finding.line}\n${finding.evidence}`) : ['No current findings.']),
      '',
      'Recommended fix:',
      findings[0]?.recommendation ?? rule.description
    ].join('\n') + '\n');
  });

program
  .command('score')
  .description('Explain the current project production score')
  .action(async () => {
    const result = await scanProject({ path: '.' });
    process.stdout.write(explainScores(result.score) + '\n');
  });

program.parseAsync();

function reportFor(format: string, result: Awaited<ReturnType<typeof scanProject>>, concise: boolean): string {
  if (format === 'json') return jsonReport(result);
  if (format === 'markdown') return markdownReport(result);
  if (format === 'sarif') return sarifReport(result);
  if (format === 'terminal') return concise ? conciseReport(result) + '\n' : terminalReport(result);
  throw new Error(`Unsupported format: ${format}. Use terminal, json, markdown, or sarif.`);
}

export { severityRank };
