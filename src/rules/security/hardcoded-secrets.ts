import { createFinding, createRule, redactValue, scanLines, trimEvidence } from '../helpers.js';

const secretPatterns = [
  /\b(?:api[_-]?key|secret|token|password|client[_-]?secret)\s*[:=]\s*["']([^"']{12,})["']/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bpostgres(?:ql)?:\/\/[^:\s]+:([^@\s]+)@/i,
  /\b(?:sk|pk)_(?:proj|live|test)_[A-Za-z0-9_-]{12,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/
];

export const hardcodedSecrets = createRule({
  id: 'SEC-001',
  title: 'Hardcoded secret detected',
  description: 'Finds credentials, private keys, and provider tokens embedded in source or configuration.',
  category: 'security',
  severity: 'high',
  confidence: 'high',
  documentationUrl: 'https://github.com/vibecoder/production-checker/blob/main/docs/rules/SEC-001-hardcoded-secrets.md',
  async run(context) {
    return scanLines(context, secretPatterns, (file, line, text, match) => {
      if (file === '.env.example') return null;
      let evidence = trimEvidence(text);
      if (match[1]) evidence = evidence.split(match[1]).join(redactValue(match[1]));
      return createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file,
        line,
        evidence,
        description: 'A likely credential is embedded directly in a scanned file.',
        impact: 'Anyone with repository access may obtain and reuse the credential.',
        recommendation: 'Move the value to a secret manager or validated environment variable, remove it from history, and rotate the exposed credential.'
      });
    });
  }
});
