import { describe, expect, it } from 'vitest';
import type { Rule, ScanContext, SourceFile } from '../src/shared.js';
import { resolveConfig } from '../src/config.js';

export function createSourceFile(relativePath: string, content: string): SourceFile {
  return {
    path: `/project/${relativePath}`,
    relativePath,
    content,
    lines: content.split(/\r?\n/),
    extension: relativePath.slice(relativePath.lastIndexOf('.')),
    size: content.length
  };
}

export function createContext(files: SourceFile[]): ScanContext {
  return {
    root: '/project',
    files,
    project: {
      root: '/project',
      languages: [],
      frameworks: [],
      packageManager: null,
      manifest: null,
      monorepo: false
    },
    gitignore: [],
    config: resolveConfig({})
  };
}

export async function runRule(rule: Rule, files: SourceFile[]) {
  return rule.run(createContext(files));
}

describe('rule regression coverage', () => {
  it('detects SQL built separately from query execution', async () => {
    const { sqlInjection } = await import('../src/rules/security/sql-injection.js');
    const findings = await runRule(sqlInjection, [
      createSourceFile('src/db.ts', `const sql = "SELECT * FROM users WHERE id = " + userId;\ndb.query(sql);`)
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].line).toBe(1);
  });

  it('keeps parameterized SQL quiet', async () => {
    const { sqlInjection } = await import('../src/rules/security/sql-injection.js');
    const findings = await runRule(sqlInjection, [
      createSourceFile('src/db.ts', `const sql = 'SELECT * FROM users WHERE id = $1';\ndb.query(sql, [userId]);`)
    ]);
    expect(findings).toHaveLength(0);
  });

  it('keeps hardcoded outbound requests with unrelated request logging quiet', async () => {
    const { ssrf } = await import('../src/rules/security/ssrf.js');
    const findings = await runRule(ssrf, [
      createSourceFile(
        'src/proxy.ts',
        `const trace = req.query.trace;\nconst response = await fetch('https://api.example.com/data');`
      )
    ]);
    expect(findings).toHaveLength(0);
  });

  it('detects shell commands built separately and shell-mode spawns', async () => {
    const { commandInjection } = await import('../src/rules/security/command-injection.js');
    const findings = await runRule(commandInjection, [
      createSourceFile(
        'src/shell.ts',
        [
          'const command = `wc -l ${file}`;',
          'exec(command, { cwd });',
          "spawnSync('sh', ['-c', command]);",
          "spawn('npm', ['test'], { shell: true });",
          "execFile('wc', ['-l', file]);"
        ].join('\n')
      )
    ]);
    expect(findings.map((finding) => finding.line)).toEqual([1, 4]);
  });
});
