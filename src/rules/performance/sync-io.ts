import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const syncIoInHandler = createRule({
  id: 'PERF-001',
  title: 'Synchronous I/O may block request handling',
  description: 'Finds synchronous filesystem calls in route or handler files.',
  category: 'performance',
  severity: 'low',
  confidence: 'medium',
  async run(context) {
    return scanLines(context, [/\b(?:readFileSync|writeFileSync|existsSync|statSync)\s*\(/], (file, line, text) => {
      if (!/route|controller|server|api|app|handler/i.test(file)) return null;
      return createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file,
        line,
        evidence: trimEvidence(text),
        description: 'A synchronous filesystem call appears in likely request-handling code.',
        impact: 'A single slow filesystem operation can block the Node.js event loop and delay all concurrent requests.',
        recommendation: 'Use promises/promises-based I/O, streams, or worker threads for request-time file operations.'
      });
    });
  }
});
