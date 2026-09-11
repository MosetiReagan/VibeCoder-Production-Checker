# Configuration

Create `.production-check.json` in the project root.

```json
{
  "extends": "recommended",
  "ignore": {
    "SEC-001": "Development-only test credential"
  },
  "rules": {
    "AI-001": "off"
  },
  "severity": {
    "SEC-003": "high"
  },
  "confidence": {
    "SEC-008": "low"
  },
  "exclude": ["generated", "third-party"],
  "failOn": "high"
}
```

## Options

- `extends`: currently `recommended`; reserved for shared profiles
- `ignore`: rule ID to reason object (preferred) or array
- `rules`: rule ID to `error`, `warn`, or `off`
- `severity`: severity override
- `confidence`: confidence override
- `exclude`: additional directories or exact file paths
- `failOn`: default CI threshold
 - `cache`: persist scan results between unchanged runs (default: `true`)

Set `cache` to `false` for one-off audits or when you want every run to execute every rule. Cached scans are keyed by project files, modification times, configuration, and rule metadata.

Default exclusions are `node_modules`, `.git`, `dist`, `build`, `coverage`, `.cache`, `.next`, and `vendor`.
