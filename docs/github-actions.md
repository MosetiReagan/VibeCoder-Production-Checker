# GitHub Actions

This repository includes a ready-to-publish action manifest at `action/action.yml`.

## Build and publish

1. Create a separate public repository named `production-check-action`.
2. Copy `action/action.yml` into that repository.
3. Build and publish a Docker image to a namespace you own.
4. Replace `ghcr.io/vibecoder/production-check:v1` with your image.
5. Tag the repository `v1`.
6. Publish and test against a fixture repository.

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

The action uses Docker so no Node setup is required. It invokes the CLI in CI mode and preserves its exit code.
