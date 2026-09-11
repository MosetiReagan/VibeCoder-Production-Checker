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

The configuration is validated with Zod. Invalid files fail the scan.

Default exclusions are `node_modules`, `.git`, `dist`, `build`, `coverage`, `.cache`, `.next`, and `vendor`.
