import { describe, expect, it } from 'vitest';
import { scanProject } from '../src/index.js';

describe('scanner', () => {
  it('detects the known issues in the insecure Node fixture', async () => {
    const result = await scanProject({ path: 'tests/fixtures/insecure-node-app', cache: false });
    const ids = new Set(result.findings.map((finding) => finding.ruleId));
    for (const id of [
      'SEC-001',
      'SEC-002',
      'SEC-003',
      'SEC-004',
      'SEC-006',
      'SEC-007',
      'SEC-008',
      'SEC-009',
      'REL-001',
      'REL-002',
      'AI-001',
      'AI-002'
    ]) {
      expect(ids, `missing ${id}`).toContain(id);
    }
    expect(result.project.frameworks).toContain('Express');
  });

  it('detects Docker and database exposure issues', async () => {
    const result = await scanProject({ path: 'tests/fixtures/insecure-docker', cache: false });
    const ids = new Set(result.findings.map((finding) => finding.ruleId));
    expect(ids).toContain('INFRA-001');
    expect(ids).toContain('INFRA-002');
    expect(ids).toContain('INFRA-003');
    expect(ids).toContain('INFRA-004');
    expect(ids).toContain('INFRA-005');
    expect(ids).toContain('INFRA-005');
  });

  it('detects placeholder implementation in a Next.js fixture', async () => {
    const result = await scanProject({ path: 'tests/fixtures/insecure-next-app', cache: false });
    expect(result.project.frameworks).toContain('Next.js');
    expect(result.findings.some((finding) => finding.ruleId === 'AI-001')).toBe(true);
  });

  it('detects Python development settings and placeholder responses', async () => {
    const result = await scanProject({ path: 'tests/fixtures/insecure-python', cache: false });
    expect(result.findings.some((finding) => finding.ruleId === 'CONFIG-001')).toBe(true);
    expect(result.findings.some((finding) => finding.ruleId === 'AI-001')).toBe(true);
  });

  it('does not over-report on the secure fixture', async () => {
    const result = await scanProject({ path: 'tests/fixtures/secure-app', cache: false });
    expect(
      result.findings.filter(
        (finding) => finding.severity === 'high' || finding.severity === 'critical'
      )
    ).toEqual([]);
    expect(result.score.overall).toBeGreaterThanOrEqual(80);
  });
});
