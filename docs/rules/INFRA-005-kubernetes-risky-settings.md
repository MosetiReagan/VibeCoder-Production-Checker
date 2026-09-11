# Risky Kubernetes workload setting detected

- **Rule:** `INFRA-005`
- **Severity:** high
- **Default confidence:** high

## Description

A Kubernetes manifest enables privileged execution, host networking, HostPath storage, or omits resource limits.

## Why it matters

These settings weaken pod isolation, expose host files or networking, or allow resource exhaustion.

## False positives

Some system components require node access. Validate the operator requirement and suppress with a reason.

## Remediation

Apply least-privilege security contexts, disable host networking, replace HostPath volumes, and define resource requests and limits.
