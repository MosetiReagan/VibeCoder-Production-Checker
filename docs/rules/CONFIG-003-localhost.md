# Localhost URL in production configuration

- **Rule:** `CONFIG-003`
- **Severity:** medium
- **Default confidence:** medium

## Description

A localhost or `127.0.0.1` URL was found in production deployment configuration.

## Why it matters

Local service URLs often point to a different process or no process at all in production.

## False positives

Sidecar architectures may intentionally use loopback. Document the sidecar and suppress the finding.

## Remediation

Use a validated production hostname, internal service DNS name, or platform-provided service binding.
