import { describe, expect, it } from 'vitest';
import { calculateScore, findingsMeetThreshold } from '../src/index.js';
import type { Finding } from '../src/index.js';

describe('scoring', () => {
  it('applies meaningful penalties to severe findings', () => {
    const finding = { severity: 'high', category: 'security' } as Finding;
    expect(calculateScore([finding]).categories.security).toBe(78);
  });

  it('enforces severity thresholds', () => {
    const medium = { severity: 'medium' } as Finding;
    expect(findingsMeetThreshold([medium], 'high')).toBe(false);
    expect(findingsMeetThreshold([medium], 'medium')).toBe(true);
  });
});
