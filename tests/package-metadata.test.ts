import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('package metadata', () => {
  it('points users to the maintained repository', () => {
    const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const repository = 'https://github.com/MosetiReagan/VibeCoder-Production-Checker';
    expect(manifest.repository.url).toBe(`git+${repository}.git`);
    expect(manifest.homepage).toBe(`${repository}#readme`);
    expect(manifest.bugs.url).toBe(`${repository}/issues`);
  });

  it('ships only the current Node-based action manifest', () => {
    expect(fs.existsSync('.github/action-manifest.yml')).toBe(false);
    expect(fs.readFileSync('action/action.yml', 'utf8')).toContain("using: 'node20'");
  });
});
