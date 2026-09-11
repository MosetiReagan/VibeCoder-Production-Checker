# Potential placeholder implementation

- **Rule:** `AI`
- **Severity:** medium
- **Default confidence:** medium

## Description

Potential placeholder implementation was detected by Production Checker.

## Why it matters

A user may receive a misleading success response while the intended operation never occurs.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Implement the real operation or return an explicit not-implemented error until it exists.
