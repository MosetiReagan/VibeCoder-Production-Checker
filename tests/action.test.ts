import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('GitHub Action bundle', () => {
  it('is a Node 20 action with a committed entry point', () => {
    expect(fs.readFileSync('action/action.yml', 'utf8')).toContain("using: 'node20'");
    expect(fs.existsSync('action/index.js')).toBe(true);
  });

  it('passes secure projects and fails vulnerable projects', () => {
    const secure = spawnSync(process.execPath, ['action/index.js'], {
      env: { ...process.env, INPUT_PATH: 'tests/fixtures/secure-app', 'INPUT_FAIL-ON': 'high' }
    });
    expect(secure.status).toBe(0);

    const vulnerable = spawnSync(process.execPath, ['action/index.js'], {
      env: { ...process.env, INPUT_PATH: 'tests/fixtures/insecure-node-app', 'INPUT_FAIL-ON': 'high' }
    });
    expect(vulnerable.status).toBe(1);
  });
});
