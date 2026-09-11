# No obvious rate limiting on authentication endpoints

- **Rule:** `SEC`
- **Severity:** medium
- **Default confidence:** low

## Description

No obvious rate limiting on authentication endpoints was detected by Production Checker.

## Why it matters

Authentication and OTP endpoints are common brute-force and credential-stuffing targets.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Add rate limiting and lockout or verify that an upstream gateway enforces it.
