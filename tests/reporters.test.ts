import { describe, expect, it } from 'vitest';
import { scanProject } from '../src/index.js';
import { htmlReport, jsonReport, markdownReport, sarifReport, terminalReport } from '../src/reporters/index.js';

describe('reporters', () => {
  it('produces valid machine-readable reports', async () => {
    const result = await scanProject({ path: 'tests/fixtures/insecure-node-app', cache: false });
    expect(JSON.parse(jsonReport(result))).toBeTypeOf('object');
    expect(markdownReport(result)).toContain('# Production Readiness Report');
    const sarif = JSON.parse(sarifReport(result));
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0].results.length).toBe(result.findings.length);
    expect(sarif.runs[0].tool.driver.rules[0].helpUri).toMatch(/docs\/rules\/SEC-\d+-/);
    expect(sarif.runs[0].tool.driver.rules.find((rule: { id: string }) => rule.id === 'SEC-004').properties.tags).toContain('cwe-89');
    expect(htmlReport(result)).toContain('<!doctype html>');
  });

  it('discloses disabled rules in terminal output', async () => {
    const result = await scanProject({ path: 'tests/fixtures/secure-app', cache: false });
    result.config.disabled.push('SEC-001');
    expect(terminalReport(result)).toContain('1 rule(s) disabled (SEC-001)');
  });
});
