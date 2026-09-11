# GitHub Actions

This repository includes a ready-to-publish Node 20 action at `action/action.yml`. The bundled entry point is `action/index.js`; no Docker image is required.

## Build and publish

1. Create a separate public repository named `production-check-action`.
2. Copy `action/action.yml` and `action/index.js` into that repository.
3. Tag the repository `v1`.
4. Publish and test against a fixture repository.

## Usage

```yaml
name: Production Check
on:
  pull_request:
jobs:
  production-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: your-namespace/production-check-action@v1
        with:
          path: .
          fail-on: high
```

The action runs directly on Node 20, prints concise findings, and preserves the severity-based exit code.
