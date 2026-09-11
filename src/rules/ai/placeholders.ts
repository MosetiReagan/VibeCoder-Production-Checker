import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

const placeholderPatterns = [
  /return\s*\{\s*success\s*:\s*true\s*,?\s*\}/i,
  /return\s*\{\s*['"]success['"]\s*:\s*True\s*,?\s*\}/i,
  /return\s*\{\s*success\s*:\s*true\s*,\s*(?:message|data)\s*:/i,
  /\/\/\s*(?:TODO|FIXME|IMPLEMENT THIS|placeholder)/i,
  /["'`]YOUR_API_KEY["'`]|=\s*CHANGE_ME\b|["'`]EXAMPLE_SECRET["'`]/i
];

export const placeholderImplementation = createRule({
  id: 'AI-001',
  title: 'Potential placeholder implementation',
  description: 'Identifies suspicious success responses, TODO operations, and placeholder credentials.',
  category: 'ai-generated',
  severity: 'medium',
  confidence: 'medium',
  async run(context) {
    return scanLines(context, placeholderPatterns, (file, line, text) => {
      if (file.includes('.env.example') || file.startsWith('.github/')) return null;
      const operational = /(payment|charge|login|auth|save|create|delete|update|database|api)/i.test(file + '\n' + text);
      return createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: operational ? 'medium' : 'low',
        category: this.category,
        file,
        line,
        evidence: trimEvidence(text),
        description: operational
          ? 'An operation-like handler appears to return success without a visible external or database operation.'
          : 'A placeholder marker or hardcoded example value was found in production-relevant source.',
        impact: 'Users can receive misleading success responses while the intended business operation never occurred.',
        recommendation: 'Implement the real operation, return an explicit not-implemented error until it exists, and use tests to verify database or provider effects.'
      });
    });
  }
});
