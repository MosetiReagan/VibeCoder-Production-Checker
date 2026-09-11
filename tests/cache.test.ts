import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { scanProject } from '../src/index.js';

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});

describe('scan cache', () => {
  it('reuses unchanged scans and refreshes changed projects', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-check-cache-'));
    directories.push(root);
    const source = path.join(root, 'server.js');
    fs.writeFileSync(source, "const apiKey = 'sk-test-1234567890';\n");

    const first = await scanProject({ path: root, cache: true });
    const second = await scanProject({ path: root, cache: true });
    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.findings).toEqual(first.findings);

    fs.utimesSync(source, new Date(Date.now() + 5000), new Date(Date.now() + 5000));
    const refreshed = await scanProject({ path: root, cache: true });
    expect(refreshed.cached).toBe(false);
  });
});
