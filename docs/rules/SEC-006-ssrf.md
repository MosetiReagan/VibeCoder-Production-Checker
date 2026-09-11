# Potential server-side request forgery

- **Rule:** `SEC`
- **Severity:** high
- **Default confidence:** medium

## Description

Potential server-side request forgery was detected by Production Checker.

## Why it matters

Server-side fetches using request-derived URLs can reach private networks and metadata services.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Validate schemes and hosts, block private IP ranges, and resolve DNS before connecting.
