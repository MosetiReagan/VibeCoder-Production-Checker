export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
import type { ResolvedConfig } from './config.js';
export type Confidence = 'high' | 'medium' | 'low';
export type Category =
  | 'security'
  | 'reliability'
  | 'configuration'
  | 'infrastructure'
  | 'dependencies'
  | 'performance'
  | 'privacy'
  | 'production'
  | 'ai-generated';

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  category: Category;
  file: string;
  line: number;
  evidence: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  category: Category;
  severity: Severity;
  confidence: Confidence;
  documentationUrl?: string;
  run(context: ScanContext): Promise<Finding[]>;
}

export interface SourceFile {
  path: string;
  relativePath: string;
  content: string;
  lines: string[];
  extension: string;
  size: number;
}

export interface ProjectInfo {
  root: string;
  languages: string[];
  frameworks: string[];
  packageManager: string | null;
  manifest: Record<string, unknown> | null;
  monorepo: boolean;
}

export interface ScanContext {
  root: string;
  files: SourceFile[];
  project: ProjectInfo;
  gitignore: string[];
  config: ResolvedConfig;
}

export const severityRank: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1
};

export const categoryLabels: Record<Category, string> = {
  security: 'Security',
  reliability: 'Reliability',
  configuration: 'Configuration',
  infrastructure: 'Infrastructure',
  dependencies: 'Dependencies',
  performance: 'Performance',
  privacy: 'Privacy',
  production: 'Production',
  'ai-generated': 'Production Hygiene'
};

export const scoreLevels = [
  { min: 90, label: 'Production Ready' },
  { min: 80, label: 'Mostly Ready' },
  { min: 70, label: 'Needs Attention' },
  { min: 50, label: 'High Risk' },
  { min: 0, label: 'Not Ready' }
] as const;

export function scoreLevel(score: number): string {
  return scoreLevels.find((level) => score >= level.min)?.label ?? 'Not Ready';
}
