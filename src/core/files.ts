import fs from 'node:fs';
import path from 'node:path';
import type { SourceFile } from '../shared.js';

const textExtensions = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.yml', '.yaml', '.env', '.example',
  '.py', '.php', '.rb', '.go', '.java', '.txt', '.dockerfile', '.conf', '.ini', '.toml'
]);
const maxFileSize = 2 * 1024 * 1024;

function isExcluded(name: string, relativePath: string, excludes: string[]): boolean {
  return excludes.some(
    (exclude) =>
      name === exclude ||
      relativePath === exclude ||
      relativePath.startsWith(`${exclude}/`) ||
      relativePath.includes(`/${exclude}/`)
  );
}

export function discoverFiles(root: string, excludes: string[]): SourceFile[] {
  const files: SourceFile[] = [];
  const realRoot = fs.realpathSync(root);
  const walk = (directory: string) => {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      const relative = path.relative(realRoot, fs.realpathSync(fullPath));
      if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
      const normalized = relative.split(path.sep).join('/');
      if (isExcluded(entry.name, normalized, excludes)) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        const stat = fs.statSync(fullPath);
        if (stat.size > maxFileSize || stat.size === 0) continue;
        const extension = path.extname(entry.name).toLowerCase();
        const baseName = path.basename(entry.name).toLowerCase();
        const text = textExtensions.has(extension) || baseName === 'dockerfile' || baseName.startsWith('.env');
        if (!text) continue;
        let content: string;
        try {
          const buffer = fs.readFileSync(fullPath);
          if (buffer.includes(0)) continue;
          content = buffer.toString('utf8');
        } catch {
          continue;
        }
        files.push({
          path: fullPath,
          relativePath: normalized,
          content,
          lines: content.split(/\r?\n/),
          extension: extension || (baseName === 'dockerfile' ? '.dockerfile' : ''),
          size: stat.size,
          mtimeMs: stat.mtimeMs,
          isDocs: normalized.startsWith('docs/') || extension === '.md'
        });
      }
    }
  };
  walk(realRoot);
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
