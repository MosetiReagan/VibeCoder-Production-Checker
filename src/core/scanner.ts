import fs from 'node:fs';
import path from 'node:path';
import { detectProject } from '../detectors/project.js';
import { discoverFiles } from './files.js';
import { calculateScore } from './scoring.js';
import { allRules } from '../rules/index.js';
import { loadConfig } from '../config.js';
import { detectWorkspaces } from '../detectors/workspaces.js';
import { loadCachedResult, projectSignature, ruleEngineVersion, saveCachedResult } from './cache.js';
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

export async function scanProject(input: { path: string; cache?: boolean; workspace?: string }): Promise<ScanResult> {
  const started = Date.now();
  const root = path.resolve(input.path);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`Project directory does not exist: ${root}`);
  }
  if (input.workspace) {
    const workspace = detectWorkspaces(root).find((candidate) => candidate.name === input.workspace);
    if (!workspace) throw new Error(`Workspace not found: ${input.workspace}`);
    const result = await scanProject({ path: workspace.path, cache: input.cache });
    return { ...result, workspace: workspace.name };
  }
  const config = loadConfig(root);
  const files = discoverFiles(root, config.excludes);
  const ruleVersion = ruleEngineVersion(allRules);
  const signature = projectSignature({ root, files, config, ruleVersion });
  const shouldCache = input.cache ?? config.cache;
  if (shouldCache) {
    const cached = loadCachedResult(signature);
    if (cached) return { ...cached, durationMs: Date.now() - started };
  }
  const project = detectProject(root, files);
  const gitignorePath = path.join(root, '.gitignore');
  const gitignore = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8').split(/\r?\n/).map((line) => line.trim())
    : [];
  const context: ScanContext = { root, files, project, gitignore, config };
  const ruleFindings = await Promise.all(
    allRules.filter((rule) => !config.disabled.includes(rule.id)).map(async (rule) => rule.run(context))
  );
  const findings = ruleFindings
    .flat()
    .filter((finding) => finding.file && finding.line >= 0)
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const applied = applyRulePolicy(findings, config);
  const result = {
    project,
    filesAnalyzed: files.length,
    dependenciesAnalyzed: countDependencies(project.manifest),
    findings: applied,
    score: calculateScore(applied, config.disabled),
    durationMs: Date.now() - started,
    config,
    cached: false
  };
  if (shouldCache) saveCachedResult(signature, result);
  return result;
}

export async function scanWorkspaces(input: { path: string; cache?: boolean }): Promise<ScanResult[]> {
  const root = path.resolve(input.path);
  const workspaces = detectWorkspaces(root);
  if (workspaces.length === 0) throw new Error(`No workspaces detected in ${root}`);
  return Promise.all(
    workspaces.map(async (workspace) => ({
      ...(await scanProject({ path: workspace.path, cache: input.cache })),
      workspace: workspace.name
    }))
  );
}

function countDependencies(manifest: Record<string, unknown> | null): number {
  if (!manifest) return 0;
  return Object.keys((manifest.dependencies as object) ?? {}).length +
    Object.keys((manifest.devDependencies as object) ?? {}).length;
}
