import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CI workflow', () => {
  it('tests all supported Node.js major versions', () => {
    const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
    expect(workflow).toContain('node: [20, 22, 24]');
  });
});
