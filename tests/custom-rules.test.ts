import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { registerRule, scanProject } from '../src/index.js';
import type { Finding, Rule, ScanContext } from '../src/index.js';

describe('custom rules', () => {
  it('registers project-specific rules for programmatic scans', async () => {
    const customRule: Rule = {
      id: 'CUSTOM-TEST-001',
      title: 'Custom production check',
      description: 'Verifies that custom rules participate in scans.',
      category: 'production',
      severity: 'low',
      confidence: 'high',
      async run(context: ScanContext): Promise<Finding[]> {
        return context.files.map((file) => ({
          ruleId: this.id,
          title: this.title,
          severity: this.severity,
          confidence: this.confidence,
          category: this.category,
          file: file.relativePath,
          line: 1,
          evidence: file.relativePath,
          description: this.description,
          impact: 'This rule verifies extension behavior.',
          recommendation: 'Use custom rules for organization-specific deployment checks.'
        }));
      }
    };
    registerRule(customRule);

    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-check-custom-'));
    fs.writeFileSync(path.join(root, 'README.md'), '# Custom project\n');
    const result = await scanProject({ path: root, cache: false });
    fs.rmSync(root, { recursive: true, force: true });

    expect(result.findings.some((finding) => finding.ruleId === customRule.id)).toBe(true);
  });
});
