import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const ssrf = createRule({
  id: 'SEC-006',
  title: 'Potential server-side request forgery',
  description: 'Finds outbound HTTP requests that use request-derived URL values.',
  category: 'security',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    return scanLines(
      context,
      [
        /\b(?:fetch|axios(?:\.(?:get|post|request))?|got|request)\s*\(\s*(?:req(?:uest)?\.(?:query|body|params|url)|request\.(?:GET|POST))/i
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
          description: 'An outbound HTTP request appears to use a URL derived from request data.',
          impact:
            'An attacker may be able to reach internal services, cloud metadata endpoints, or private networks.',
          recommendation:
            'Validate the destination against an allow-list of schemes and hosts, resolve DNS before connecting, and block private IP ranges.'
        })
    );
  }
});
