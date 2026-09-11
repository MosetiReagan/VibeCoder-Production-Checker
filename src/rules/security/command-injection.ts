import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

const dynamicCommandPatterns = [
  /\b(?:exec|execSync|spawn|spawnSync|execFile|execFileSync)\s*\([^)]*(?:\$\{[^}]+\}|['"]\s*\+|%s|\.format\()/i,
  /\b(?:spawn|spawnSync|execFile|execFileSync)\s*\([^)]*shell\s*:\s*true/i,
  /(?:const|let|var)\s+(\w+)\s*=\s*[`'"][^`'"]*(?:\$\{[^}]+\}|['"]\s*\+)/i,
  /^\s*(\w+)\s*=\s*['"`][^'"`]*(?:\$\{[^}]+\}|['"]\s*\+)/im
];

export const commandInjection = createRule({
  id: 'SEC-005',
  title: 'Dynamic shell command detected',
  description: 'Finds shell execution with interpolated or concatenated values.',
  category: 'security',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    return scanLines(context, dynamicCommandPatterns, (file, line, text, match) => {
      const variableName = match[1];
      if (variableName) {
        const isExecuted = context.files.some(
          (scannedFile) =>
            scannedFile.relativePath === file &&
            new RegExp(
              `\\b(?:exec|execSync|spawn|spawnSync|execFile|execFileSync)\\s*\\(\\s*${variableName}\\b`
            ).test(scannedFile.content)
        );
        if (!isExecuted) return null;
      }
      return createFinding({
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
        recommendation:
          'Use execFile with fixed command names and argument arrays. Validate every dynamic value against an allow-list.'
      });
    });
  }
});
