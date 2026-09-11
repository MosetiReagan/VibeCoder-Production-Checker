import type { Category, Confidence, Finding, Rule, ScanContext, Severity } from '../shared.js';

export function createRule(rule: Rule): Rule {
  return rule;
}

export function createFinding(options: {
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
}): Finding {
  return options;
}

export function scanLines(
  context: ScanContext,
  patterns: RegExp[],
  callback: (file: string, line: number, text: string, match: RegExpMatchArray) => Finding | null
): Finding[] {
  const findings: Finding[] = [];
  for (const file of context.files) {
    if (file.isDocs ?? isDocumentation(file.relativePath)) continue;
    file.lines.forEach((text, index) => {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const finding = callback(file.relativePath, index + 1, text, match);
          if (finding) findings.push(finding);
          break;
        }
      }
    });
  }
  return findings;
}

export function isDocumentation(path: string): boolean {
  return path.startsWith('docs/') || path.endsWith('.md') || path.includes('/fixtures/');
}

export function redactValue(value: string): string {
  if (value.length <= 6) return '********';
  return `${value.slice(0, 6)}********`;
}

export function trimEvidence(text: string, maxLength = 180): string {
  const trimmed = text.trim().replace(/\r?\n/g, '\\n');
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 3)}...` : trimmed;
}
