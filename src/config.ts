import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { Confidence, Severity } from './shared.js';

const severitySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
const confidenceSchema = z.enum(['high', 'medium', 'low']);

const ignoreSchema = z.union([
  z.array(z.string()),
  z.record(z.string(), z.string())
]);

export const configSchema = z.object({
  extends: z.literal('recommended').optional(),
  ignore: ignoreSchema.optional(),
  rules: z.record(z.string(), z.enum(['error', 'warn', 'off'])).optional(),
  severity: z.record(z.string(), severitySchema).optional(),
  confidence: z.record(z.string(), confidenceSchema).optional(),
  exclude: z.array(z.string()).default([]),
  failOn: severitySchema.optional(),
  cache: z.boolean().default(true)
});

export type UserConfig = z.infer<typeof configSchema>;

export interface ResolvedConfig {
  ignore: Record<string, string>;
  disabled: string[];
  severityOverrides: Record<string, Severity>;
  confidenceOverrides: Record<string, Confidence>;
  excludes: string[];
  failOn?: Severity;
  cache: boolean;
}

export const defaultExcludes = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.next',
  'vendor'
];

export function normalizeIgnores(ignore: UserConfig['ignore']): Record<string, string> {
  if (!ignore) return {};
  if (Array.isArray(ignore)) return Object.fromEntries(ignore.map((id) => [id, 'Configured suppression']));
  return { ...ignore };
}

export function loadConfig(root: string): ResolvedConfig {
  const file = path.join(root, '.production-check.json');
  let user: Partial<UserConfig> = {};
  if (fs.existsSync(file)) {
    const parsed = z.object({ config: configSchema }).safeParse({
      config: JSON.parse(fs.readFileSync(file, 'utf8'))
    });
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ');
      throw new Error(`Invalid .production-check.json: ${details}`);
    }
    user = parsed.data.config;
  }
  return resolveConfig(user);
}

export function resolveConfig(user: Partial<UserConfig>): ResolvedConfig {
  const rules = user.rules ?? {};
  return {
    ignore: normalizeIgnores(user.ignore),
    disabled: Object.entries(rules).filter(([, value]) => value === 'off').map(([key]) => key),
    severityOverrides: user.severity ?? {},
    confidenceOverrides: user.confidence ?? {},
    excludes: [...defaultExcludes, ...(user.exclude ?? [])],
    failOn: user.failOn,
    cache: user.cache ?? true
  };
}
