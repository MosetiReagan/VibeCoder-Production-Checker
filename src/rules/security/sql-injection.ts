import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

const unsafeSql = [
  /(?:query|execute|raw|all|get)\s*\(\s*[`"'](?:SELECT|INSERT|UPDATE|DELETE)[^`"']*[`"']\s*\+/i,
  /(?:query|execute|raw)\s*\(\s*[`"'][^`"']*\$\{[^}]+\}[^`"']*[`"']/i
];

export const sqlInjection = createRule({
  id: 'SEC-004',
  title: 'Potentially unsafe SQL construction',
  description: 'Finds SQL strings concatenated with variables or interpolated values.',
  category: 'security',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    return scanLines(context, unsafeSql, (file, line, text) => createFinding({
      ruleId: this.id,
      title: this.title,
      severity: this.severity,
      confidence: this.confidence,
      category: this.category,
      file,
      line,
      evidence: trimEvidence(text),
      description: 'A SQL statement appears to be constructed by concatenation or interpolation.',
      impact: 'If the interpolated value is attacker-controlled, SQL injection can expose or modify application data.',
      recommendation: 'Use parameterized queries or the query-builder APIs provided by Prisma, Drizzle, Sequelize, TypeORM, or Knex.'
    }));
  }
});
