import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const insecureCookies = createRule({
  id: 'SEC-007',
  title: 'Insecure session cookie configuration',
  description: 'Detects cookies set without HttpOnly, Secure, or SameSite attributes.',
  category: 'security',
  severity: 'medium',
  confidence: 'medium',
  async run(context) {
    return scanLines(
      context,
      [/cookie\s*\([^)]*(?:token|session|auth)/i, /res\.cookie\s*\(/],
      (file, line, text) => {
        const options = text.replace(/\s+/g, ' ');
        const missing = [
          !/secure\s*:\s*true/i.test(options) ? 'Secure' : null,
          !/httpOnly\s*:\s*true/i.test(options) ? 'HttpOnly' : null,
          !/sameSite/i.test(options) ? 'SameSite' : null
        ].filter(Boolean);
        if (missing.length === 0) return null;
        return createFinding({
          ruleId: this.id,
          title: this.title,
          severity: this.severity,
          confidence: this.confidence,
          category: this.category,
          file,
          line,
          evidence: trimEvidence(text),
          description: `A cookie likely associated with authentication is missing ${missing.join(', ')}.`,
          impact:
            'Session cookies can be exposed through transport interception, JavaScript access, or cross-site request patterns.',
          recommendation:
            'Set Secure, HttpOnly, and SameSite=Lax or Strict. Use a strict setting for sensitive cookies and document intentional development exceptions.'
        });
      }
    );
  }
});
