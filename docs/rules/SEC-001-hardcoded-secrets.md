# Hardcoded secret detected

- **Rule:** `SEC`
- **Severity:** high
- **Default confidence:** high

## Description

Hardcoded secret detected was detected by Production Checker.

## Why it matters

Credentials in source can be copied and reused by anyone with repository access.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Move values to secret managers or validated environment variables and rotate exposed credentials.
