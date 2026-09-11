import { createFinding, createRule } from '../helpers.js';

export const missingHealthChecks = createRule({
  id: 'INFRA-004',
  title: 'No obvious health check detected',
  description: 'Detects projects without a visible application health endpoint.',
  category: 'infrastructure',
  severity: 'low',
  confidence: 'medium',
  async run(context) {
    const hasRoute = context.files.some((file) =>
      /['"`/]?(?:\/health|\/healthz|\/ready|\/readyz|\/livez)['"`/]?/.test(file.content)
    );
    const dockerfile = context.files.find((file) => file.relativePath === 'Dockerfile');
    const dockerHasCheck = Boolean(
      dockerfile?.lines.some((line) => /^\s*HEALTHCHECK\s/.test(line))
    );
    if (hasRoute && (!dockerfile || dockerHasCheck)) return [];
    const line = dockerfile?.lines.findIndex((line) => /^\s*CMD\s/.test(line));
    return [
      createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file: dockerfile?.relativePath ?? '(no Dockerfile)',
        line: dockerfile && line !== undefined && line !== -1 ? line + 1 : 0,
        evidence: hasRoute
          ? 'Health endpoint exists but Docker HEALTHCHECK is missing'
          : 'No health endpoint found',
        description: 'The scanner did not find a complete, visible readiness health mechanism.',
        impact:
          'Orchestrators may route traffic to unhealthy instances or fail to restart hung processes.',
        recommendation:
          'Add liveness and readiness endpoints and configure the deployment or Docker HEALTHCHECK to use them.'
      })
    ];
  }
});
