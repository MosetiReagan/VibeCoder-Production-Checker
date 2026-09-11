# Scanner security model

Production Checker is static and offline.

## Guaranteed non-execution

The scanner does not execute:

- `npm install`
- `npm run`
- `make`
- project scripts
- shell commands
- application source

## Safe file handling

- Resolves the project root with `realpath`
- Does not follow paths resolving outside the project
- Uses Node filesystem APIs, not shell commands
- Skips empty files, binary files, and files over 2 MiB
- Parses YAML with the safe `yaml` library
- Uses bounded regular expressions and line-scanning rather than full AST execution

## Secret protection

Likely credential values are redacted before report creation. `.env.example` is excluded from secret findings. Reports can still include non-secret evidence, paths, and line numbers.

## Optional online features

No optional online analysis is implemented. Any future AI review must require explicit opt-in, disclose transmitted data, and redact secrets.
