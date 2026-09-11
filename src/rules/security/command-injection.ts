import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const commandInjection = createRule({
  id: 'SEC-005',
  title: 'Dynamic shell command detected',
  description: 'Finds shell execution with interpolated or concatenated values.',
  category: 'security',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    return scanLines(
      context,
      [/\b(?:exec|execSync|spawnSync|spawn)\s*\([^)]*(?:\+|\$\{|%s|\.format\()/],
      (file, line, text) => createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file,
        line,
        evidence: trimEvidence(text),
        description: 'A shell command is dynamically constructed before execution.',
        impact: 'Untrusted input can alter the command and execute arbitrary code on the host.',
        recommendation: 'Use execFile with fixed command names and argument arrays. Validate every dynamic value against an allow-list.'
      })
    );
  }
});
