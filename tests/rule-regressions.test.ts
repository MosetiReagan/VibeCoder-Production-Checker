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
    size: content.length,
    mtimeMs: 1
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

  it('checks rate limiting beside each authentication route', async () => {
    const { missingRateLimiting } = await import('../src/rules/security/rate-limiting.js');
    const findings = await runRule(missingRateLimiting, [
      createSourceFile('package.json', '{"dependencies":{"@nestjs/throttler":"^6.0.0"}}'),
      createSourceFile('src/routes.ts', `app.post('/login', loginHandler);`),
      createSourceFile('src/reset.ts', `loginRateLimiter,\napp.post('/password-reset', resetHandler);`)
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].file).toBe('src/routes.ts');
  });

  it('redacts every occurrence of a repeated secret', async () => {
    const { hardcodedSecrets } = await import('../src/rules/security/hardcoded-secrets.js');
    const secret = 'sk-test-1234567890abcdefghij';
    const findings = await runRule(hardcodedSecrets, [
      createSourceFile('src/config.ts', `const apiKey = "${secret}"; const backupKey = "${secret}";`)
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].evidence).not.toContain(secret);
    expect(findings[0].evidence.match(/sk-tes\*+/g)).toHaveLength(2);
  });

  it('keeps health acknowledgements out of placeholder findings', async () => {
    const { placeholderImplementation } = await import('../src/rules/ai/placeholders.js');
    const findings = await runRule(placeholderImplementation, [
      createSourceFile('src/api/healthcheck.ts', `export function health() {\n  return { success: true };\n}`)
    ]);
    expect(findings).toHaveLength(0);
  });

  it('detects placeholder payment handlers using nearby context', async () => {
    const { placeholderImplementation } = await import('../src/rules/ai/placeholders.js');
    const findings = await runRule(placeholderImplementation, [
      createSourceFile('src/routes/status.ts', `export async function processPayment() {\n  return { success: true };\n}`)
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].confidence).toBe('medium');
  });

  it('requires environment validation to parse process.env', async () => {
    const { envValidation } = await import('../src/rules/configuration/env-validation.js');
    const files = [
      createSourceFile('package.json', '{"dependencies":{"zod":"^3.23.8"}}'),
      createSourceFile('src/server.ts', 'console.log(process.env.DATABASE_URL);')
    ];
    expect(await runRule(envValidation, files)).toHaveLength(1);

    files.push(createSourceFile('src/env.ts', 'const env = schema.parse(process.env);'));
    expect(await runRule(envValidation, files)).toHaveLength(0);
  });

  it('evaluates the final Docker USER directive', async () => {
    const { dockerRootUser } = await import('../src/rules/infrastructure/docker.js');
    const rootFindings = await runRule(dockerRootUser, [
      createSourceFile('Dockerfile', 'USER node\nUSER root\n')
    ]);
    expect(rootFindings).toHaveLength(1);
    expect(rootFindings[0].line).toBe(2);

    const nonRootFindings = await runRule(dockerRootUser, [
      createSourceFile('Dockerfile', 'USER root\nUSER node\n')
    ]);
    expect(nonRootFindings).toHaveLength(0);
  });

  it('handles Compose port forms and loopback bindings', async () => {
    const { databaseExposed } = await import('../src/rules/infrastructure/docker.js');
    const findings = await runRule(databaseExposed, [
      createSourceFile(
        'docker-compose.yml',
        [
          'services:',
          '  loopback:',
          '    ports: ["127.0.0.1:5432:5432"]',
          '  random-host:',
          '    ports: ["5432"]',
          '  long-form:',
          '    ports:',
          '      - target: 5432',
          '        published: 5432'
        ].join('\n')
      )
    ]);
    expect(findings).toHaveLength(1);
    expect(findings[0].evidence).toContain('long-form');
  });

  it('checks framework production configuration for localhost', async () => {
    const { localhostConfiguration } = await import('../src/rules/configuration/localhost.js');
    const findings = await runRule(localhostConfiguration, [
      createSourceFile('next.config.js', "module.exports = { assetPrefix: 'http://localhost:3000' };")
    ]);
    expect(findings).toHaveLength(1);
  });
});
