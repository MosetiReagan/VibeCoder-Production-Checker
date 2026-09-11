import crypto from 'node:crypto';
import fs from 'node:fs';
import { calculateScore } from './scoring.js';
import type { Finding } from '../shared.js';
import type { ScanResult } from './types.js';

export interface BaselineEntry {
  ruleId: string;
  file: string;
  line: number;
  evidenceHash: string;
}

export interface BaselineFile {
  version: 1;
  findings: BaselineEntry[];
}

export function findingSignature(finding: Finding): string {
  return crypto
    .createHash('sha256')
    .update(`${finding.ruleId}\n${finding.file}\n${finding.line}\n${finding.evidence}`)
    .digest('hex');
}

export function createBaseline(result: ScanResult): BaselineFile {
  return {
    version: 1,
    findings: result.findings.map((finding) => ({
      ruleId: finding.ruleId,
      file: finding.file,
      line: finding.line,
      evidenceHash: findingSignature(finding)
    }))
  };
}

export function applyBaseline(result: ScanResult, baselinePath: string): ScanResult {
  let baseline: BaselineFile;
  try {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as BaselineFile;
  } catch (error) {
    throw new Error(`Unable to read baseline ${baselinePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (baseline.version !== 1 || !Array.isArray(baseline.findings)) {
    throw new Error('Invalid baseline: expected version 1 with a findings array');
  }
  const signatures = new Set(baseline.findings.map((entry) => entry.evidenceHash));
  const findings = result.findings.filter((finding) => !signatures.has(findingSignature(finding)));
  return { ...result, findings, score: calculateScore(findings) };
}
