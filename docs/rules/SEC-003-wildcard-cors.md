# Permissive CORS configuration

- **Rule:** `SEC`
- **Severity:** medium
- **Default confidence:** medium

## Description

Permissive CORS configuration was detected by Production Checker.

## Why it matters

Wildcard origins can allow untrusted websites to interact with an API; combining them with credentials is especially dangerous.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Use an explicit origin allow-list and never combine wildcard origins with credentials.
