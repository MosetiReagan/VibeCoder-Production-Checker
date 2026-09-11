import fs from 'node:fs/promises';
import path from 'node:path';

export async function initializeConfig(root: string): Promise<string> {
  const file = path.join(root, '.production-check.json');
  if (
    await fs
      .access(file)
      .then(() => true)
      .catch(() => false)
  ) {
    throw new Error(`Configuration already exists: ${file}`);
  }
  const contents = {
    $schema:
      'https://raw.githubusercontent.com/MosetiReagan/VibeCoder-Production-Checker/main/docs/config-schema.json',
    extends: 'recommended',
    cache: true,
    failOn: 'high'
  };
  await fs.writeFile(file, `${JSON.stringify(contents, null, 2)}\n`, 'utf8');
  return file;
}
