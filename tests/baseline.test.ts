import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyBaseline, createBaseline } from '../src/core/baseline.js';
import { scanProject } from '../src/index.js';

describe('baseline', () => {
  it('suppresses only recorded findings', async () => {
    const result = await scanProject({ path: 'tests/fixtures/insecure-node-app', cache: false });
    expect(result.findings.length).toBeGreaterThan(0);
    const baseline = createBaseline(result);
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'production-check-baseline-')), 'baseline.json');
    fs.writeFileSync(file, JSON.stringify(baseline));
    const filtered = applyBaseline(result, file);
    expect(filtered.findings).toHaveLength(0);
    expect(filtered.score.overall).toBe(100);
    fs.rmSync(path.dirname(file), { recursive: true, force: true });
  });
});
