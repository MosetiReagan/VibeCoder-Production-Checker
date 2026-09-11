import { describe, expect, it } from 'vitest';
import { trimEvidence } from '../src/rules/helpers.js';

describe('helpers', () => {
  it('keeps multiline evidence on one report line', () => {
    expect(trimEvidence('catch (error) {\n}')).toBe('catch (error) {\\n}');
  });
});
