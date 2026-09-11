# Insecure session cookie configuration

- **Rule:** `SEC`
- **Severity:** medium
- **Default confidence:** medium

## Description

Insecure session cookie configuration was detected by Production Checker.

## Why it matters

Missing Secure, HttpOnly, or SameSite can expose sessions to interception, scripts, or cross-site requests.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Set Secure, HttpOnly, and SameSite=Lax or Strict for sensitive cookies.
