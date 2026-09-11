import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const sensitiveLogging = createRule({
  id: 'AI-002',
  title: 'Potentially sensitive object logged',
  description: 'Detects logging of environments, request bodies, headers, or credentials.',
  category: 'privacy',
  severity: 'medium',
  confidence: 'medium',
  async run(context) {
    return scanLines(
      context,
      [
        /console\.(?:log|debug|info)\s*\([^\n]*(?:process\.env|req(?:uest)?\.(?:headers|body)|request\.headers)/i
      ],
      (file, line, text) =>
        createFinding({
          ruleId: this.id,
          title: this.title,
          severity: this.severity,
          confidence: this.confidence,
          category: this.category,
          file,
          line,
          evidence: trimEvidence(text),
          description:
            'A broad object containing possible credentials is passed to a logging call.',
          impact:
            'Authorization headers, passwords, tokens, and other personal data can leak into logs.',
          recommendation:
            'Log a stable request ID and purposeful fields. Redact credentials and avoid logging complete request bodies or environments.'
        })
    );
  }
});
