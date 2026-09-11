# Dependency lockfile missing

- **Rule:** `DEP`
- **Severity:** medium
- **Default confidence:** high

## Description

Dependency lockfile missing was detected by Production Checker.

## Why it matters

Without a lockfile, installs may resolve different versions and produce unstable deployments.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Commit the package manager lockfile and install with frozen lockfile in CI.
