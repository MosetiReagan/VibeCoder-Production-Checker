import { describe, expect, it } from 'vitest';
import { ruleEngineVersion } from '../src/core/cache.js';
import type { Rule } from '../src/index.js';

describe('cache signatures', () => {
  it('changes when rule implementation changes', () => {
    const base = {
      id: 'TEST-001',
      title: 'Test rule',
      description: 'Test rule',
      category: 'production',
      severity: 'low',
      confidence: 'high'
    } as const;
    const first: Rule = { ...base, run: async () => [] };
    const second: Rule = {
      ...base,
      run: async () => [
        {
          ruleId: 'TEST-001',
          title: 'Test rule',
          severity: 'low',
          confidence: 'high',
          category: 'production',
          file: 'example.ts',
          line: 1,
          evidence: 'example',
          description: 'Test rule',
          impact: 'Test rule',
          recommendation: 'Test rule'
        }
      ]
    };
    expect(ruleEngineVersion([first])).not.toBe(ruleEngineVersion([second]));
  });
});
