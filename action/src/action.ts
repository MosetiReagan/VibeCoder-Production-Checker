import { findingsMeetThreshold, scanProject } from '../../src/index.js';
import { conciseReport } from '../../src/reporters/index.js';

const path = process.env.INPUT_PATH ?? '.';
const failOn = (process.env['INPUT_FAIL-ON'] ?? 'high') as Parameters<typeof findingsMeetThreshold>[1];

void (async () => {
  try {
    const result = await scanProject({ path, cache: false });
    process.stdout.write(`${conciseReport(result)}\n`);
    if (findingsMeetThreshold(result.findings, failOn)) {
      process.stderr.write(`Production Checker found issues at or above ${failOn} severity.\n`);
      process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
})();
