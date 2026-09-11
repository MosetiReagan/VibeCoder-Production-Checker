# Database or cache port exposed to host

- **Rule:** `INFRA`
- **Severity:** high
- **Default confidence:** high

## Description

Database or cache port exposed to host was detected by Production Checker.

## Why it matters

Databases and caches should generally remain on private networks and are high-value targets when exposed.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Remove host mappings and use internal networks; bind local tools to 127.0.0.1 only.
