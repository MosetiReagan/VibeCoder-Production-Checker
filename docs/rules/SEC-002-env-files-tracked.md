# Environment file may be tracked

- **Rule:** `SEC`
- **Severity:** high
- **Default confidence:** medium

## Description

Environment file may be tracked was detected by Production Checker.

## Why it matters

Environment files often contain production credentials and can enter Git history.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Ignore .env*, remove tracked files from the index, and rotate exposed credentials.
