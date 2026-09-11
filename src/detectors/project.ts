import fs from 'node:fs';
import path from 'node:path';
import type { ProjectInfo, SourceFile } from '../shared.js';

const manifestIndicators: Array<[string, string]> = [
  ['next', 'Next.js'],
  ['react', 'React'],
  ['vite', 'Vite'],
  ['express', 'Express'],
  ['fastify', 'Fastify'],
  ['@nestjs/core', 'NestJS']
];

export function detectProject(root: string, files: SourceFile[]): ProjectInfo {
  const packageFile = files.find((file) => file.relativePath === 'package.json');
  let manifest: Record<string, unknown> | null = null;
  if (packageFile) {
    manifest = JSON.parse(packageFile.content) as Record<string, unknown>;
  }
  const dependencies = {
    ...((manifest?.dependencies as Record<string, string>) ?? {}),
    ...((manifest?.devDependencies as Record<string, string>) ?? {})
  };
  const frameworks = manifestIndicators
    .filter(([name]) => Boolean(dependencies[name]))
    .map(([, framework]) => framework);
  if (files.some((file) => file.relativePath === 'manage.py')) frameworks.push('Django');
  if (files.some((file) => file.relativePath === 'artisan')) frameworks.push('Laravel');
  if (files.some((file) => file.relativePath === 'config/application.rb')) frameworks.push('Rails');
  if (files.some((file) => file.relativePath === 'pom.xml' || file.relativePath === 'build.gradle')) {
    frameworks.push('Spring');
  }
  const packageManager = fs.existsSync(path.join(root, 'pnpm-lock.yaml'))
    ? 'pnpm'
    : fs.existsSync(path.join(root, 'yarn.lock'))
      ? 'yarn'
      : fs.existsSync(path.join(root, 'package-lock.json'))
        ? 'npm'
        : manifest
          ? 'npm (no lockfile)'
          : null;
  const monorepo = ['pnpm-workspace.yaml', 'turbo.json', 'nx.json', 'lerna.json'].some((name) =>
    fs.existsSync(path.join(root, name))
  );
  const extensions = new Set(files.map((file) => file.extension));
  const languages = [
    extensions.has('.ts') || extensions.has('.tsx') ? 'TypeScript' : null,
    extensions.has('.js') || extensions.has('.jsx') ? 'JavaScript' : null,
    extensions.has('.py') ? 'Python' : null,
    extensions.has('.php') ? 'PHP' : null
  ].filter(Boolean) as string[];
  return { root, languages, frameworks, packageManager, manifest, monorepo };
}
