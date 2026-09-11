# SARIF output

```bash
production-check --format sarif --output report.sarif
```

Production Checker emits SARIF 2.1.0 with:

- One rule descriptor per detected rule
- Physical artifact locations and start lines
- Error/warning/note levels
- GitHub `security-severity` properties
- Confidence and redacted evidence in result properties

Upload it to GitHub code scanning with `github/codeql-action/upload-sarif`.
