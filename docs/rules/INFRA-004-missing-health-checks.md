# No obvious health check detected

- **Rule:** `INFRA`
- **Severity:** low
- **Default confidence:** medium

## Description

No obvious health check detected was detected by Production Checker.

## Why it matters

Orchestrators need signals to avoid routing to unhealthy or hung processes.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Implement readiness and liveness endpoints and configure platform health checks.
