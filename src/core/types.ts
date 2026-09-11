import type { ProjectInfo, Finding, ScanContext, SourceFile } from '../shared.js';
import type { ScoreBreakdown } from './scoring.js';
import type { ResolvedConfig } from '../config.js';

export interface ScanResult {
  project: ProjectInfo;
  filesAnalyzed: number;
  dependenciesAnalyzed: number;
  findings: Finding[];
  score: ScoreBreakdown;
  durationMs: number;
  config: ResolvedConfig;
  cached?: boolean;
}

export type { ProjectInfo, Finding, ScanContext, SourceFile, ScoreBreakdown };
