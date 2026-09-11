import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('configuration JSON schema', () => {
  it('documents every user-facing option', () => {
    const schema = JSON.parse(fs.readFileSync('docs/config-schema.json', 'utf8'));
    expect(schema.$schema).toMatch(/^https?:\/\/json-schema\.org\//);
    const configSchema = schema.definitions.ProductionCheckConfig;
    for (const property of ['extends', 'ignore', 'rules', 'severity', 'confidence', 'exclude', 'failOn', 'cache']) {
      expect(configSchema.properties, property).toHaveProperty(property);
    }
  });
});
