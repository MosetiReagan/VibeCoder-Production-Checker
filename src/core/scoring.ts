import type { Category, Finding, Severity } from '../shared.js';
import { categoryLabels, severityRank } from '../shared.js';

export interface ScoreBreakdown {
  overall: number;
  categories: Partial<Record<Category, number>>;
  categoryFindings: Partial<Record<Category, Finding[]>>;
}

const weights: Record<Severity, number> = {
  critical: 45,
  high: 22,
  medium: 9,
  low: 3,
  info: 0
};

export function calculateScore(findings: Finding[]): ScoreBreakdown {
  const categoryFindings: Partial<Record<Category, Finding[]>> = {};
  for (const finding of findings) {
    const scoringCategory = finding.category === 'privacy' ? 'ai-generated' : finding.category;
    categoryFindings[scoringCategory] = [...(categoryFindings[scoringCategory] ?? []), finding];
  }
  const categories: Partial<Record<Category, number>> = {};
  for (const [category, items] of Object.entries(categoryFindings) as Array<[Category, Finding[]]>) {
    const penalty = Math.min(75, items.reduce((sum, finding) => sum + weights[finding.severity], 0));
    categories[category] = Math.max(0, 100 - penalty);
  }
  const primaryCategories: Category[] = [
    'security',
    'reliability',
    'configuration',
    'infrastructure',
    'dependencies',
    'performance',
    'ai-generated'
  ];
  const scored = primaryCategories.filter((category) => categories[category] !== undefined);
  if (scored.length === 0) {
    const empty = Object.fromEntries(primaryCategories.map((category) => [category, 100]));
    return { overall: 100, categories: empty, categoryFindings };
  }
  const overall = Math.round(
    scored.reduce((sum, category) => sum + (categories[category] ?? 100), 0) / scored.length
  );
  return { overall, categories, categoryFindings };
}

export function findingsMeetThreshold(findings: Finding[], threshold: Severity): boolean {
  return findings.some((finding) => severityRank[finding.severity] >= severityRank[threshold]);
}

export function explainScores(breakdown: ScoreBreakdown): string {
  const lines = Object.entries(breakdown.categories)
    .map(([category, score]) => {
      const items = breakdown.categoryFindings[category as Category] ?? [];
      const counts = Object.entries(
        items.reduce<Record<string, number>>((acc, item) => {
          acc[item.severity] = (acc[item.severity] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([severity, count]) => `${severity}: ${count}`);
      return `${categoryLabels[category as Category]}: ${score}\n  ${counts.join(', ') || 'No findings'}`;
    })
    .join('\n');
  return `${lines}\nOverall: ${breakdown.overall}`;
}
