# Dynamic shell command detected

- **Rule:** `SEC`
- **Severity:** high
- **Default confidence:** medium

## Description

Dynamic shell command detected was detected by Production Checker.

## Why it matters

Untrusted values can alter dynamically constructed shell commands and execute arbitrary code.

## Examples

See the relevant fixture in `tests/fixtures/` for a tested unsafe example and the secure fixture for controlled behavior.

## False positives

The rule uses evidence and confidence. It may miss controls enforced outside the repository, such as an API gateway, platform health check, or secret manager. Suppress the finding with a documented reason when such an external control exists.

## Remediation

Use fixed command names with argument arrays and validate values against allow-lists.
