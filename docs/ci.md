# CI integration

```bash
production-check --ci --fail-on high
```

`--ci` prints concise `SEVERITY RULE FILE:LINE TITLE` lines. The process exits non-zero when at least one finding is at or above the threshold. Valid thresholds are `critical`, `high`, `medium`, and `low`.

Set a default in configuration:

```json
{
  "failOn": "high"
}
```

Generate SARIF for GitHub code scanning:

```bash
production-check --format sarif --output production-check.sarif
```

CI does not execute project code or package lifecycle scripts.
