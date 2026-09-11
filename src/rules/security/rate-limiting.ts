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
    const findings: Finding[] = [];
    for (const file of context.files) {
      if (!/\.(?:js|jsx|ts|tsx|py|php)$/.test(file.extension)) continue;
      const globallyApplied = /app\.use\s*\(\s*[\w.]*rate[\w.]*limit/i.test(file.content);
      file.lines.forEach((text, index) => {
        const isAuthenticationRoute = /['"`/]?(?:\/login|\/register|\/auth|\/password-reset|\/forgot-password|\/otp)['"`/]?/.test(text);
        if (!isAuthenticationRoute || globallyApplied) return;
        const surrounding = file.lines.slice(Math.max(0, index - 10), index + 2).join('\n');
        const hasLocalRateLimit = /rate[- ]?limit|ratelimit|throttle|@Throttle/i.test(surrounding);
        if (!hasLocalRateLimit) {
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: this.severity,
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: text.trim().slice(0, 180),
            description: 'An authentication-related endpoint was found without rate limiting visible nearby.',
            impact: 'Attackers can perform credential stuffing, brute force, OTP guessing, or resource exhaustion.',
            recommendation: 'Apply rate limiting and lockout controls to authentication, password reset, OTP, and registration routes. This may be enforced by an upstream gateway.'
          }));
        }
      });
    }
    return findings;
  }
});
