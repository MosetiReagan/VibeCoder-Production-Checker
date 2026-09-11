import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { detectWorkspaces, scanProject, scanWorkspaces } from '../src/index.js';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('monorepo workspaces', () => {
  it('detects and scans package workspaces separately', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-check-monorepo-'));
    roots.push(root);
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ workspaces: ['packages/*'] }));
    fs.mkdirSync(path.join(root, 'packages/api'), { recursive: true });
    fs.mkdirSync(path.join(root, 'packages/web'), { recursive: true });
    fs.writeFileSync(path.join(root, 'packages/api/package.json'), '{"name":"api"}');
    fs.writeFileSync(path.join(root, 'packages/web/package.json'), '{"name":"web"}');
    fs.writeFileSync(path.join(root, 'packages/api/server.js'), "const apiKey = 'sk-test-1234567890';\n");

    expect(detectWorkspaces(root).map((workspace) => workspace.name)).toEqual(['packages/api', 'packages/web']);
    const api = await scanProject({ path: root, workspace: 'packages/api', cache: false });
    expect(api.workspace).toBe('packages/api');
    expect(api.findings.some((finding) => finding.ruleId === 'SEC-001')).toBe(true);

    const results = await scanWorkspaces({ path: root, cache: false });
    expect(results.map((result) => result.workspace)).toEqual(['packages/api', 'packages/web']);
    expect(results[1].findings.some((finding) => finding.ruleId === 'SEC-001')).toBe(false);
  });
});
