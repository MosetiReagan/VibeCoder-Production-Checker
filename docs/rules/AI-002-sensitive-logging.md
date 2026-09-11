# Potentially sensitive object logged

- **Rule:** `AI`
- **Severity:** medium
- **Default confidence:** medium

## Description

Potentially sensitive object logged was detected by Production Checker.

## Why it matters

Broad request or environment objects can leak credentials and personal data into logs.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Log request IDs and purposeful fields, and redact credentials.
