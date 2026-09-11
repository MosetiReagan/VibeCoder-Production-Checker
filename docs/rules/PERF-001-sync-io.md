# Synchronous I/O may block request handling

- **Rule:** `PERF`
- **Severity:** low
- **Default confidence:** medium

## Description

Synchronous I/O may block request handling was detected by Production Checker.

## Why it matters

Synchronous filesystem calls can block the Node.js event loop and delay all requests.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Use promises, streams, or worker threads in request paths.
