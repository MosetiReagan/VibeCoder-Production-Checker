import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';
import { findUnsafeSqlExecutions, isJavaScriptLike } from '../analysis/typescript-ast.js';

const unsafeSql = [
  /(?:query|execute|raw|all|get)\s*\(\s*[`"'](?:SELECT|INSERT|UPDATE|DELETE)[^`"']*[`"']\s*\+/i,
  /(?:query|execute|raw)\s*\(\s*[`"'][^`"']*\$\{[^}]+\}[^`"']*[`"']/i,
  /(?:const|let|var)\s+(\w+)\s*=\s*[`"'](?:SELECT|INSERT|UPDATE|DELETE)[^`"']*(?:\$\{[^}]+\}|['"]\s*\+)/i,
  /^\s*(\w+)\s*=\s*['"`](?:SELECT|INSERT|UPDATE|DELETE)[^'"`]*(?:\$\{[^}]+\}|['"]\s*\+)/im
];

export const sqlInjection = createRule({
  id: 'SEC-004',
  title: 'Potentially unsafe SQL construction',
  description: 'Finds SQL strings concatenated with variables or interpolated values.',
  category: 'security',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    const astFindings = context.files
      .filter(isJavaScriptLike)
      .flatMap((file) =>
        findUnsafeSqlExecutions(file).map((finding) =>
          createFinding({
            ruleId: this.id,
            title: this.title,
            severity: this.severity,
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: finding.line,
            evidence: trimEvidence(finding.evidence),
            description: 'A SQL statement appears to be constructed by concatenation or interpolation.',
            impact: 'If the interpolated value is attacker-controlled, SQL injection can expose or modify application data.',
            recommendation: 'Use parameterized queries or the query-builder APIs provided by Prisma, Drizzle, Sequelize, TypeORM, or Knex.'
          })
        )
      );
    const legacyFiles = context.files.filter((file) => !isJavaScriptLike(file));
    const legacyContext = { ...context, files: legacyFiles };
    const legacyFindings = scanLines(legacyContext, unsafeSql, (file, line, text, match) => {
      const variableName = match[1];
      if (!variableName) {
        return createFinding({
          ruleId: 'SEC-004',
          title: 'Potentially unsafe SQL construction',
          severity: 'high',
          confidence: 'medium',
          category: 'security',
          file,
          line,
          evidence: trimEvidence(text),
          description: 'A SQL statement appears to be constructed by concatenation or interpolation.',
          impact: 'If the interpolated value is attacker-controlled, SQL injection can expose or modify application data.',
          recommendation: 'Use parameterized queries or the query-builder APIs provided by Prisma, Drizzle, Sequelize, TypeORM, or Knex.'
        });
      }
      const isQueried = legacyContext.files.some((scannedFile) =>
        scannedFile.relativePath === file &&
        new RegExp(`\\b(?:query|execute|raw|all|get)\\s*\\(\\s*${variableName}\\b`).test(scannedFile.content)
      );
      if (!isQueried) return null;
      return createFinding({
        ruleId: 'SEC-004',
        title: 'Potentially unsafe SQL construction',
        severity: 'high',
        confidence: 'medium',
        category: 'security',
        file,
        line,
        evidence: trimEvidence(text),
        description: 'A SQL statement appears to be constructed by concatenation or interpolation.',
        impact: 'If the interpolated value is attacker-controlled, SQL injection can expose or modify application data.',
        recommendation: 'Use parameterized queries or the query-builder APIs provided by Prisma, Drizzle, Sequelize, TypeORM, or Knex.'
      });
    });
    return [...astFindings, ...legacyFindings];
  }
});
