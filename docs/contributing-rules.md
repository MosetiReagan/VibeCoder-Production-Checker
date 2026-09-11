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
