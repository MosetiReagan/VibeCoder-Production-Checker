# Getting started

Install globally, or use the package name after it is published:

```bash
npm install -g vibecoder-production-checker
production-check .
```

From a checkout:

```bash
npm install
npm run build
node dist/cli.js .
```

## Useful commands

```bash
node dist/cli.js tests/fixtures/insecure-node-app
node dist/cli.js . --workspace packages/api
node dist/cli.js . --workspaces
node dist/cli.js . --format json --output report.json
node dist/cli.js . --format markdown --output report.md
node dist/cli.js . --format sarif --output report.sarif
node dist/cli.js . --html report.html
node dist/cli.js . --ci --fail-on high
node dist/cli.js . --quiet
node dist/cli.js explain SEC-001
node dist/cli.js score
```

The scanner requires a readable directory and Node.js 20 or newer.

The HTML report includes severity filters, collapsible findings, and stable deep links such as `report.html#finding-1`. It is fully self-contained and works offline.
