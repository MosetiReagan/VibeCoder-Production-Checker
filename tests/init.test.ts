import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { initializeConfig } from '../src/core/init.js';
import { configSchema } from '../src/config.js';

describe('init', () => {
  it('creates valid recommended configuration', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-check-init-'));
    const file = await initializeConfig(root);
    const contents = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(configSchema.safeParse(contents).success).toBe(true);
    await expect(initializeConfig(root)).rejects.toThrow('Configuration already exists');
    fs.rmSync(root, { recursive: true, force: true });
  });
});
