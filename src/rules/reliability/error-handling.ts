import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const exposedStackTraces = createRule({
  id: 'REL-001',
  title: 'Stack trace may be returned to clients',
  description: 'Detects error stack or detailed errors in HTTP response bodies.',
  category: 'reliability',
  severity: 'medium',
  confidence: 'high',
  async run(context) {
    return scanLines(context, [/(?:res(?:ponse)?\.send|json|status\([^)]*\)[^\n]*send)\([^\n]*(?:err(?:or)?\.stack|error\.message)/i], (file, line, text) =>
      createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file,
        line,
        evidence: trimEvidence(text),
        description: 'An HTTP response appears to include a stack trace or detailed error message.',
        impact: 'Internal implementation details, paths, dependency versions, and sometimes secrets can be disclosed.',
        recommendation: 'Return a stable public error code and message. Send diagnostic details to structured server logs with request IDs.'
      })
    );
  }
});

export const emptyCatchBlocks = createRule({
  id: 'REL-002',
  title: 'Catch block may ignore failures',
  description: 'Finds empty catch blocks that can silently hide production errors.',
  category: 'reliability',
  severity: 'low',
  confidence: 'medium',
  async run(context) {
    return scanLines(context, [/catch\s*(?:\([^)]*\))?\s*\{\s*\}/], (file, line, text) =>
      createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file,
        line,
        evidence: trimEvidence(text),
        description: 'A catch block has no visible error handling.',
        impact: 'Failures can be hidden, making incidents difficult to detect and diagnose.',
        recommendation: 'Log the error with useful context, rethrow intentional failures, or document why ignoring the error is safe.'
      })
    );
  }
});
