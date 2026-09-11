import fs from 'node:fs';
import path from 'node:path';
import { detectProject } from '../detectors/project.js';
import { discoverFiles } from './files.js';
import { calculateScore } from './scoring.js';
import { allRules } from '../rules/index.js';
import { loadConfig } from '../config.js';
import type { Finding, ScanContext, ScanResult } from './types.js';
import type { Severity } from '../shared.js';

function lineHasSuppression(line: string, ruleId: string): boolean {
  return line.includes(`production-check-ignore ${ruleId}`);
}

function applyRulePolicy(findings: Finding[], config: ReturnType<typeof loadConfig>): Finding[] {
  return findings
    .filter((finding) => !lineHasSuppression(finding.evidence, finding.ruleId))
    .filter((finding) => !config.ignore[finding.ruleId] && !config.disabled.includes(finding.ruleId))
    .map((finding) => ({
      ...finding,
      severity: (config.severityOverrides[finding.ruleId] ?? finding.severity) as Severity,
      confidence: config.confidenceOverrides[finding.ruleId] ?? finding.confidence
    }));
}

export async function scanProject(input: { path: string }): Promise<ScanResult> {
  const root = path.resolve(input.path);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`Project directory does not exist: ${root}`);
  }
  const config = loadConfig(root);
  const files = discoverFiles(root, config.excludes);
  const project = detectProject(root, files);
  const gitignorePath = path.join(root, '.gitignore');
  const gitignore = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8').split(/\r?\n/).map((line) => line.trim())
    : [];
  const context: ScanContext = { root, files, project, gitignore, config };
  const started = Date.now();
  const ruleFindings = await Promise.all(
    allRules.filter((rule) => !config.disabled.includes(rule.id)).map(async (rule) => rule.run(context))
  );
  const findings = ruleFindings
    .flat()
    .filter((finding) => finding.file && finding.line > 0)
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const applied = applyRulePolicy(findings, config);
  return {
    project,
    filesAnalyzed: files.length,
    dependenciesAnalyzed: countDependencies(project.manifest),
    findings: applied,
    score: calculateScore(applied),
    durationMs: Date.now() - started,
    config
  };
}

function countDependencies(manifest: Record<string, unknown> | null): number {
  if (!manifest) return 0;
  return Object.keys((manifest.dependencies as object) ?? {}).length +
    Object.keys((manifest.devDependencies as object) ?? {}).length;
}
