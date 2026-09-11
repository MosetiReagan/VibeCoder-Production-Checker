# Risky Docker configuration detected

- **Rule:** `INFRA`
- **Severity:** high
- **Default confidence:** high

## Description

Risky Docker configuration detected was detected by Production Checker.

## Why it matters

Privileged mode and Docker socket mounts can compromise the host; host networking and mutable latest tags weaken isolation and reproducibility.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Remove privileged/socket access, use bridge networking, and pin immutable image versions.
