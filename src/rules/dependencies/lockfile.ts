import { createFinding, createRule } from '../helpers.js';

export const missingLockfile = createRule({
  id: 'DEP-001',
  title: 'Dependency lockfile missing',
  description: 'Checks that JavaScript projects have a package manager lockfile.',
  category: 'dependencies',
  severity: 'medium',
  confidence: 'high',
  async run(context) {
    if (!context.files.some((file) => file.relativePath === 'package.json')) return [];
    const hasLockfile = context.files.some((file) =>
      ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(file.relativePath)
    );
    if (hasLockfile) return [];
    return [createFinding({
      ruleId: this.id,
      title: this.title,
      severity: this.severity,
      confidence: this.confidence,
      category: this.category,
      file: 'package.json',
      line: 1,
      evidence: 'No package-lock.json, pnpm-lock.yaml, or yarn.lock found',
      description: 'The project has package.json but no committed lockfile.',
      impact: 'Installs and deployments may resolve different dependency versions, producing unstable builds and audits.',
      recommendation: 'Commit the lockfile for your chosen package manager and install with frozen lockfile in CI and deployments.'
    })];
  }
});
