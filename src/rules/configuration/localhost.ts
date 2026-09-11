import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const localhostConfiguration = createRule({
  id: 'CONFIG-003',
  title: 'Localhost URL in production configuration',
  description: 'Finds localhost or loopback URLs in deployment-relevant configuration.',
  category: 'configuration',
  severity: 'medium',
  confidence: 'medium',
  async run(context) {
    return scanLines(context, [/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/], (file, line, text) => {
      const productionConfig = /\.(?:production|prod)(?:\.[^.]+)?$/.test(file) ||
        file === 'production.env' ||
        file === 'Dockerfile' ||
        /^(?:docker-compose|compose)\.ya?ml$/.test(file);
      if (!productionConfig) return null;
      if (file === 'Dockerfile' && /^\s*HEALTHCHECK\s/.test(text)) return null;
      return createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file,
        line,
        evidence: trimEvidence(text),
        description: 'A localhost or loopback URL is configured for a production deployment path.',
        impact: 'The application may call itself or a local service that does not exist in the production runtime.',
        recommendation: 'Use an explicitly validated production hostname or service-discovery name. Reserve localhost for local development configuration.'
      });
    });
  }
});
