import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const wildcardCors = createRule({
  id: 'SEC-003',
  title: 'Permissive CORS configuration',
  description: 'Detects wildcard CORS with cookie or credential usage and explains context.',
  category: 'security',
  severity: 'medium',
  confidence: 'medium',
  async run(context) {
    const usesCredentials = context.files.some((file) =>
      file.content.includes('credentials: true') || file.content.includes('Access-Control-Allow-Credentials')
    );
    return scanLines(
      context,
      [/cors\(\s*\{[^}]*origin\s*:\s*['"]\*['"]/i, /Access-Control-Allow-Origin['"]?\s*[:,]\s*['"]\*['"]/i],
      (file, line, text) => createFinding({
        ruleId: this.id,
        title: this.title,
        severity: usesCredentials ? 'high' : this.severity,
        confidence: usesCredentials ? 'high' : this.confidence,
        category: this.category,
        file,
        line,
        evidence: trimEvidence(text),
        description: `Wildcard CORS was detected${usesCredentials ? ' while credentials or cookies are also configured' : ''}.`,
        impact: usesCredentials
          ? 'A wildcard origin combined with credentials can allow untrusted websites to make credentialed requests.'
          : 'Any origin can call the API; this may expose public data unexpectedly or bypass assumptions about allowed clients.',
        recommendation: 'Use an explicit allow-list of trusted origins. Avoid wildcard origins when cookies, Authorization headers, or credentials are enabled.'
      })
    );
  }
});
