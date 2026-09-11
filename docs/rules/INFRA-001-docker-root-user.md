# Container may run as root

- **Rule:** `INFRA`
- **Severity:** high
- **Default confidence:** medium

## Description

Container may run as root was detected by Production Checker.

## Why it matters

A compromised process gains unnecessary root privileges inside the container.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Create a dedicated user and end the runtime stage with USER.
