import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('configuration errors', () => {
  it('reports every validation issue at once', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-check-config-'));
    fs.writeFileSync(
      path.join(root, '.production-check.json'),
      JSON.stringify({ extends: 'unknown', cache: 'yes', failOn: 'urgent' })
    );
    expect(() => loadConfig(root)).toThrow(/config\.extends:.*config\.failOn:.*config\.cache:/s);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
