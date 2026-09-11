# Contributing rules

A production rule must answer a deployment-risk question, not merely search for a keyword.

## Required rule properties

- Stable ID (`SEC-`, `REL-`, `CONFIG-`, `INFRA-`, `DEP-`, `PERF-`, or `AI-`)
- Clear title and description
- Category, severity, and default confidence
- Evidence from the source file
- User impact
- Actionable recommendation
- Insecure fixture that triggers it
- Secure fixture that does not trigger it
- Unit or integration test
- Documentation in `docs/rules/`

## Rule checklist

- Does the pattern have a practical production failure mode?
- Is the evidence visible and specific?
- Can a reasonable secure implementation trigger it?
- Does the finding avoid claiming certainty when static analysis cannot prove it?
- Are development, documentation, and fixture contexts considered?
- Is severity proportional to impact?
- Is confidence honest?

Add rules to `src/rules/<category>/` and export them from `src/rules/index.ts`.

Library consumers can register organization-specific rules programmatically with `registerRule`:

```ts
import { registerRule, scanProject } from 'production-check';

registerRule({
  id: 'CUSTOM-001',
  title: 'Organization deployment policy',
  description: 'Checks an organization-specific production requirement.',
  category: 'production',
  severity: 'low',
  confidence: 'high',
  async run(context) {
    return [];
  }
});

const result = await scanProject({ path: '.' });
```

The CLI intentionally does not load arbitrary rule files because doing so would execute project code. A sandboxed plugin loader is planned for v1.0.

JavaScript and TypeScript rules can use the syntax-tree helpers in `src/rules/analysis/typescript-ast.ts` for more precise expression and call analysis. Regex fallbacks remain available for languages without an AST adapter.
