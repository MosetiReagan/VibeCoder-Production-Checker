import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export interface Workspace {
  name: string;
  path: string;
}

export function detectWorkspaces(root: string): Workspace[] {
  const patterns = [...packageJsonPatterns(root), ...pnpmPatterns(root)];
  const workspaces = new Map<string, Workspace>();
  for (const pattern of patterns) {
    for (const directory of expandPattern(root, pattern)) {
      if (!fs.existsSync(path.join(directory, 'package.json'))) continue;
      const name = path.relative(root, directory).split(path.sep).join('/');
      workspaces.set(name, { name, path: directory });
    }
  }
  return [...workspaces.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function packageJsonPatterns(root: string): string[] {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      workspaces?: string[] | { packages?: string[] };
    };
    if (Array.isArray(manifest.workspaces)) return manifest.workspaces;
    return manifest.workspaces?.packages ?? [];
  } catch {
    return [];
  }
}

function pnpmPatterns(root: string): string[] {
  try {
    const document = YAML.parse(fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8')) as {
      packages?: string[];
    };
    return document.packages ?? [];
  } catch {
    return [];
  }
}

function expandPattern(root: string, pattern: string): string[] {
  const normalized = pattern.split('/').join(path.sep);
  if (!normalized.includes('*')) return [path.resolve(root, normalized)];
  const parent = path.resolve(root, path.dirname(normalized));
  if (!fs.existsSync(parent)) return [];
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(parent, entry.name));
}
