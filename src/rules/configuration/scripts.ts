import { createFinding, createRule } from '../helpers.js';

export const productionScripts = createRule({
  id: 'CONFIG-004',
  title: 'Production package scripts are incomplete',
  description: 'Checks for build, start, test, and lint scripts in Node.js application manifests.',
  category: 'configuration',
  severity: 'low',
  confidence: 'medium',
  async run(context) {
    const packageFile = context.files.find((file) => file.relativePath === 'package.json');
    if (!packageFile) return [];
    let manifest: { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    try {
      manifest = JSON.parse(packageFile.content);
    } catch {
      return [];
    }
    const scripts = manifest.scripts ?? {};
    const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
    const required = ['build', 'test'];
    const applicationDependencies = ['next', 'react', 'express', 'fastify', '@nestjs/core'];
    if (applicationDependencies.some((dependency) => dependencies[dependency])) required.push('start');
    if (dependencies.eslint) required.push('lint');
    const missing = required.filter((script) => !scripts[script]);
    if (missing.length === 0) return [];
    const line = packageFile.lines.findIndex((text) => text.includes('"scripts"')) + 1 || 1;
    return [createFinding({
      ruleId: this.id,
      title: this.title,
      severity: this.severity,
      confidence: this.confidence,
      category: this.category,
      file: packageFile.relativePath,
      line,
      evidence: `Missing scripts: ${missing.join(', ')}`,
      description: 'The package manifest lacks scripts needed for reproducible production workflows.',
      impact: 'Deployment, verification, and quality gates become dependent on undocumented commands.',
      recommendation: 'Define build, start, test, and lint commands in package.json and use them consistently in local and CI workflows.'
    })];
  }
});
