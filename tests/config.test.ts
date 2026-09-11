import { describe, expect, it } from 'vitest';
import { resolveConfig } from '../src/config.js';

describe('configuration', () => {
  it('requires reasons when suppressing through the object form', () => {
    const config = resolveConfig({ ignore: { 'SEC-001': 'Valid local development fixture' } });
    expect(config.ignore['SEC-001']).toBe('Valid local development fixture');
  });

  it('supports disabling rules and severity overrides', () => {
    const config = resolveConfig({ rules: { 'AI-001': 'off' }, severity: { 'SEC-003': 'high' } });
    expect(config.disabled).toContain('AI-001');
    expect(config.severityOverrides['SEC-003']).toBe('high');
  });
});
