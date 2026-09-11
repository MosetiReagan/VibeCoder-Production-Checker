import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const debugMode = createRule({
  id: 'CONFIG-001',
  title: 'Development or debug setting in production-relevant configuration',
  description: 'Finds debug, development mode, and localhost settings outside documentation.',
  category: 'configuration',
  severity: 'medium',
  confidence: 'medium',
  async run(context) {
    return scanLines(
      context,
      [/\b(?:DEBUG|NODE_ENV|APP_ENV|ENVIRONMENT)\s*[:=]\s*['"]?(?:true|development|dev)['"]?/i],
      (file, line, text) => {
        if (file.startsWith('tests/') || file.startsWith('.github/')) return null;
        return createFinding({
          ruleId: this.id,
          title: this.title,
          severity: this.severity,
          confidence: this.confidence,
          category: this.category,
          file,
          line,
          evidence: trimEvidence(text),
          description: 'A debug or development mode setting was found in a deployed application path.',
          impact: 'Debug mode can expose verbose errors, sensitive logs, internal routes, or slower development middleware.',
          recommendation: 'Default production deployments to NODE_ENV=production and derive debug behavior from an explicitly validated setting.'
        });
      }
    );
  }
});
