# Contributing

Thank you for improving Production Checker.

## Development setup

```bash
git clone https://github.com/vibecoder/production-checker.git
cd production-checker
npm install
npm run build
npm test
npm run lint
npm run typecheck
```

## Workflow

1. Create a focused branch.
2. Make a minimal, tested change.
3. Add or update fixtures for rule behavior.
4. Run build, tests, lint, and typecheck.
5. Open a pull request describing the user-facing result.

Rules must include metadata, evidence, impact, recommendation, tests, and documentation. Avoid rules that report a finding solely because a keyword exists.

## Design principles

- Production readiness over style linting
- Evidence and confidence over alarmist certainty
- Offline by default
- No arbitrary project execution
- Actionable remediation
- Controlled false positives

## Releases

Releases use Semantic Versioning. Maintainers create signed tags and publish from CI after quality checks pass.
