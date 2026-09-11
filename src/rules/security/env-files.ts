import fs from 'node:fs';
import path from 'node:path';
import { createFinding, createRule, trimEvidence } from '../helpers.js';

export const envFilesTracked = createRule({
  id: 'SEC-002',
  title: 'Environment file may be tracked',
  description: 'Detects environment files that are present and not clearly ignored.',
  category: 'security',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    const findings = [];
    for (const file of context.files.filter((item) => /^\.env(?:\..+)?$/.test(item.relativePath))) {
      const ignored = context.gitignore.some((line) => /^\.env(\.\*)?$/.test(line));
      const gitDir = path.join(context.root, '.git');
      if (!ignored && fs.existsSync(gitDir)) {
        const firstSecret = file.lines.find((line) => /^\s*[A-Z0-9_]+\s*=/.test(line));
        findings.push(createFinding({
          ruleId: this.id,
          title: this.title,
          severity: this.severity,
          confidence: this.confidence,
          category: this.category,
          file: file.relativePath,
          line: 1,
          evidence: trimEvidence(firstSecret?.split('=')[0] ?? file.relativePath),
          description: 'An environment file exists in a Git repository and is not covered by the observed ignore patterns.',
          impact: 'Production credentials may be committed and shared with every repository reader.',
          recommendation: 'Add .env* to .gitignore, remove tracked environment files with git rm --cached, and rotate exposed credentials. Keep a .env.example template without secrets.'
        }));
      }
    }
    return findings;
  }
});
