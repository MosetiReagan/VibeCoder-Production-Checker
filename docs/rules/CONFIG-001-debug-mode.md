# Development or debug setting in production configuration

- **Rule:** `CONFIG`
- **Severity:** medium
- **Default confidence:** medium

## Description

Development or debug setting in production configuration was detected by Production Checker.

## Why it matters

Debug and development modes can expose verbose errors, sensitive routes, and development middleware.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Default production deployments to NODE_ENV=production and validate debug settings.
