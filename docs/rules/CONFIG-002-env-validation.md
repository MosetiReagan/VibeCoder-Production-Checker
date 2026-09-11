# Required environment variables lack visible validation

- **Rule:** `CONFIG`
- **Severity:** medium
- **Default confidence:** low

## Description

Required environment variables lack visible validation was detected by Production Checker.

## Why it matters

Invalid or missing variables can cause runtime failures or insecure defaults.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Validate required variables at startup with Zod, envalid, dotenv-safe, or an equivalent schema.
