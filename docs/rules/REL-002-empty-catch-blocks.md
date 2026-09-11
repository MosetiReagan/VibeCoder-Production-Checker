# Catch block may ignore failures

- **Rule:** `REL`
- **Severity:** low
- **Default confidence:** medium

## Description

Catch block may ignore failures was detected by Production Checker.

## Why it matters

Silently ignored errors hide incidents and make diagnosis difficult.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Log useful context, rethrow, or document why ignoring the error is safe.
