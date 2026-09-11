import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Rule } from '../shared.js';
import type { ResolvedConfig } from '../config.js';
import type { ScanResult, SourceFile } from './types.js';

interface CacheEnvelope {
  signature: string;
  result: ScanResult;
}

export function ruleEngineVersion(rules: Rule[]): string {
  const metadata = rules.map((rule) => ({
    id: rule.id,
    title: rule.title,
    description: rule.description,
    category: rule.category,
    severity: rule.severity,
    confidence: rule.confidence
  }));
  return crypto.createHash('sha256').update(JSON.stringify(metadata)).digest('hex');
}

export function projectSignature(input: {
  root: string;
  files: SourceFile[];
  config: ResolvedConfig;
  ruleVersion: string;
}): string {
  const payload = {
    root: input.root,
    ruleVersion: input.ruleVersion,
    config: input.config,
    files: input.files.map((file) => ({
      path: file.relativePath,
      size: file.size,
      mtimeMs: file.mtimeMs
    }))
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function loadCachedResult(signature: string): ScanResult | null {
  const file = cachePath(signature);
  try {
    const envelope = JSON.parse(fs.readFileSync(file, 'utf8')) as CacheEnvelope;
    if (envelope.signature !== signature || !isValidResult(envelope.result)) return null;
    return { ...envelope.result, cached: true };
  } catch {
    return null;
  }
}

export function saveCachedResult(signature: string, result: ScanResult): void {
  const file = cachePath(signature);
  const temporary = `${file}.${process.pid}.tmp`;
  const envelope: CacheEnvelope = { signature, result: { ...result, cached: false } };
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(temporary, JSON.stringify(envelope), { mode: 0o600 });
    fs.renameSync(temporary, file);
  } catch {
    try {
      fs.unlinkSync(temporary);
    } catch {
      // Cache writes are best-effort and must never fail a scan.
    }
  }
}

function cachePath(signature: string): string {
  return path.join(os.tmpdir(), 'production-check', `${signature}.json`);
}

function isValidResult(value: unknown): value is ScanResult {
  const result = value as ScanResult | undefined;
  return Boolean(
    result?.project &&
      Array.isArray(result?.findings) &&
      result?.score &&
      typeof result?.filesAnalyzed === 'number' &&
      typeof result?.dependenciesAnalyzed === 'number'
  );
}
