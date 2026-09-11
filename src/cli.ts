#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { Command, InvalidArgumentError } from 'commander';
import pc from 'picocolors';
import { scanProject, scanWorkspaces } from './core/scanner.js';
import { explainScores, findingsMeetThreshold } from './core/scoring.js';
import { applyBaseline, createBaseline } from './core/baseline.js';
import { conciseReport, htmlReport, jsonReport, markdownReport, sarifReport, terminalReport } from './reporters/index.js';
import { getRule } from './rules/index.js';
import type { Severity } from './shared.js';
import { severityRank } from './shared.js';
import type { ScanResult } from './core/types.js';

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
  .option('--baseline <file>', 'suppress findings recorded in a baseline file')
  .option('--workspace <name>', 'scan one workspace inside the target repository')
  .option('--workspaces', 'scan every detected workspace separately')
  .option('-q, --quiet', 'print findings only')
  .option('--no-color', 'disable colored terminal output')
  .action(async (target: string, options: { format: string; output?: string; html?: string; ci?: boolean; failOn?: Severity; baseline?: string; workspace?: string; workspaces?: boolean; quiet?: boolean; noColor?: boolean }) => {
    try {
      if (options.workspaces) {
        const results = await scanWorkspaces({ path: target });
        const combined = combineWorkspaceResults(results);
        const reportedResults = options.baseline
          ? results.map((result) => applyBaseline(result, options.baseline as string))
          : results;
        const reportedCombined = options.baseline ? combineWorkspaceResults(reportedResults) : combined;
        await writeWorkspaceOutput(options, reportedCombined, reportedResults);
        const failOn = options.failOn ?? combined.config.failOn;
        if (options.ci && failOn && findingsMeetThreshold(reportedCombined.findings, failOn)) {
          process.stderr.write(`Failing because findings meet or exceed ${failOn}\n`);
          process.exitCode = 1;
        }
        return;
      }
      const result = await scanProject({ path: target, workspace: options.workspace });
      const reportedResult = options.baseline ? applyBaseline(result, options.baseline) : result;
      if (options.html) await fs.writeFile(options.html, htmlReport(reportedResult), 'utf8');
      const format = options.format.toLowerCase();
      if (options.output) {
        const content = reportFor(format, reportedResult, options.ci === true);
        await fs.writeFile(options.output, content, 'utf8');
      }
      if (format !== 'terminal' && !options.output) {
        process.stdout.write(reportFor(format, reportedResult, options.ci === true));
      } else if (format === 'terminal' && !options.output) {
        process.stdout.write(
          options.ci || options.quiet
            ? `${conciseReport(reportedResult)}\n`
            : `${terminalReport(reportedResult, options.noColor === true)}\n`
        );
      }
      const failOn = options.failOn ?? result.config.failOn;
      if (options.ci && failOn && findingsMeetThreshold(reportedResult.findings, failOn)) {
        process.stderr.write(`Failing because findings meet or exceed ${failOn}\n`);
        process.exitCode = 1;
      }
    } catch (error) {
      process.stderr.write(`${pc.red('Error:')} ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    }
  });

program
  .command('baseline')
  .description('Record current findings for incremental adoption')
  .argument('[path]', 'project directory to scan', '.')
  .option('-o, --output <file>', 'baseline output file; defaults to stdout')
  .action(async (target: string, options: { output?: string }) => {
    const result = await scanProject({ path: target });
    const baseline = `${JSON.stringify(createBaseline(result), null, 2)}\n`;
    if (options.output) await fs.writeFile(options.output, baseline, 'utf8');
    else process.stdout.write(baseline);
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

function combineWorkspaceResults(results: ScanResult[]): ScanResult {
  const findings = results.flatMap((result) =>
    result.findings.map((finding) => ({
      ...finding,
      file: `${result.workspace}/${finding.file}`
    }))
  );
  const overall = Math.round(results.reduce((sum, result) => sum + result.score.overall, 0) / results.length);
  return {
    ...results[0],
    project: { ...results[0].project, root: path.dirname(results[0].project.root) },
    filesAnalyzed: results.reduce((sum, result) => sum + result.filesAnalyzed, 0),
    dependenciesAnalyzed: results.reduce((sum, result) => sum + result.dependenciesAnalyzed, 0),
    findings,
    score: { ...results[0].score, overall },
    durationMs: results.reduce((sum, result) => sum + result.durationMs, 0),
    cached: results.every((result) => result.cached),
    workspace: undefined
  };
}

async function writeWorkspaceOutput(
  options: { format: string; output?: string; html?: string; ci?: boolean },
  combined: ScanResult,
  results: ScanResult[]
): Promise<void> {
  if (options.html) await fs.writeFile(options.html, htmlReport(combined), 'utf8');
  const content = workspaceContent(options, combined, results);
  if (options.output) {
    await fs.writeFile(options.output, content, 'utf8');
    return;
  }
  process.stdout.write(content);
}

function workspaceContent(
  options: { format: string; ci?: boolean; noColor?: boolean },
  combined: ScanResult,
  results: ScanResult[]
): string {
  if (options.format === 'json') return `${JSON.stringify(results, null, 2)}\n`;
  if (options.format === 'sarif') return sarifReport(combined);
  if (options.format === 'markdown') {
    return results.map((result) => `## Workspace: ${result.workspace}\n\n${markdownReport(result)}`).join('\n');
  }
  if (options.ci) {
    const lines = results.flatMap((result) =>
      result.findings.map(
        (finding) =>
          `[${result.workspace}] ${finding.severity.toUpperCase()} ${finding.ruleId} ${finding.file}:${finding.line} ${finding.title}`
      )
    );
    return `${lines.join('\n') || 'No findings'}\n`;
  }
  return results
    .map((result) => `Workspace: ${result.workspace}\n${terminalReport(result, options.noColor === true)}`)
    .join('\n\n');
}

export { severityRank };
