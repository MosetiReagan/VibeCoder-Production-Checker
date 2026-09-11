import { createFinding, createRule } from '../helpers.js';

const envVarPattern = /process\.env\.([A-Z][A-Z0-9_]+)/g;

export const envValidation = createRule({
  id: 'CONFIG-002',
  title: 'Required environment variables lack visible validation',
  description: 'Finds direct process.env access in projects without a visible validation layer.',
  category: 'configuration',
  severity: 'medium',
  confidence: 'low',
  async run(context) {
    const hasValidation = context.files.some((file) =>
      /(?:safeParse|parse|cleanEnv|parseEnv)\s*\(\s*process\.env/.test(file.content)
    );
    if (hasValidation) return [];
    const findings = [];
    const seen = new Set<string>();
    for (const file of context.files.filter((item) => item.relativePath === 'package.json' ? false : item.extension === '.ts' || item.extension === '.js')) {
      for (const [index, line] of file.lines.entries()) {
        for (const match of line.matchAll(envVarPattern)) {
          const key = `${file.relativePath}:${match[1]}`;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: this.severity,
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: line.trim().slice(0, 180),
            description: `Environment variable ${match[1]} is accessed directly and no environment validation was detected.`,
            impact: 'Invalid, missing, or partially configured environments can fail at runtime or silently enable insecure defaults.',
            recommendation: 'Validate required variables at startup with Zod, envalid, dotenv-safe, or your framework schema.'
          }));
        }
      }
    }
    return findings.slice(0, 10);
  }
});
