# Potentially unsafe SQL construction

- **Rule:** `SEC`
- **Severity:** high
- **Default confidence:** medium

## Description

Potentially unsafe SQL construction was detected by Production Checker.

## Why it matters

Concatenated or interpolated SQL can allow attackers to change query meaning.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Use parameterized queries or safe query-builder APIs.
