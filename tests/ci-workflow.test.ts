import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CI workflow', () => {
  it('tests all supported Node.js major versions', () => {
    const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
    expect(workflow).toContain('node: [20, 22, 24]');
  });

  it('runs release smoke tests on every supported operating system', () => {
    const workflow = fs.readFileSync('.github/workflows/release.yml', 'utf8');
    expect(workflow).toContain('os: [ubuntu-latest, windows-latest, macos-latest]');
    expect(workflow).toContain('needs: quality');
  });
});
