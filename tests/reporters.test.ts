import { describe, expect, it } from 'vitest';
import { scanProject } from '../src/index.js';
import { htmlReport, jsonReport, markdownReport, sarifReport } from '../src/reporters/index.js';

describe('reporters', () => {
  it('produces valid machine-readable reports', async () => {
    const result = await scanProject({ path: 'tests/fixtures/insecure-node-app' });
    expect(JSON.parse(jsonReport(result))).toBeTypeOf('object');
    expect(markdownReport(result)).toContain('# Production Readiness Report');
    const sarif = JSON.parse(sarifReport(result));
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0].results.length).toBe(result.findings.length);
    expect(htmlReport(result)).toContain('<!doctype html>');
  });
});
