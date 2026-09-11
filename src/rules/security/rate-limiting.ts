import { createFinding, createRule } from '../helpers.js';
import type { Finding } from '../../shared.js';

export const missingRateLimiting = createRule({
  id: 'SEC-008',
  title: 'No obvious rate limiting on authentication endpoints',
  description: 'Reports sensitive routes where no rate-limiting middleware is visible nearby.',
  category: 'security',
  severity: 'medium',
  confidence: 'low',
  async run(context) {
    const rateLimiting = context.files.some((file) =>
      /rate[- ]?limit|ratelimit|throttler/i.test(file.content)
    );
    if (rateLimiting) return [];
    const findings: Finding[] = [];
    for (const file of context.files) {
      if (!/\.(?:js|jsx|ts|tsx|py|php)$/.test(file.extension)) continue;
      file.lines.forEach((text, index) => {
        if (/['"`/]?(?:\/login|\/register|\/auth|\/password-reset|\/forgot-password|\/otp)['"`/]?/.test(text)) {
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: this.severity,
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: text.trim().slice(0, 180),
            description: 'An authentication-related endpoint was found but no obvious rate limiting was detected in the project.',
            impact: 'Attackers can perform credential stuffing, brute force, OTP guessing, or resource exhaustion.',
            recommendation: 'Apply rate limiting and lockout controls to authentication, password reset, OTP, and registration routes. This may be enforced by an upstream gateway.'
          }));
        }
      });
    }
    return findings;
  }
});
