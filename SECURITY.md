# Security Policy

## Supported versions

Security fixes target the latest published minor release.

## Reporting a vulnerability

Email security@vibecoder.dev with details, reproduction steps, and affected versions. Do not open a public issue for an undisclosed vulnerability.

We aim to acknowledge reports within 48 hours and provide an assessment within 5 business days.

## Scanner safety

Production Checker performs static analysis only. It does not execute application code, lifecycle scripts, package managers, build tools, shell commands, or project scripts. It reads files with Node APIs, skips binaries and oversized files, and does not follow symlinks outside the target project.

Reports are intended to be safe for sharing. Secret values are redacted before report generation. File names, source lines, and non-secret evidence are included by design.

## Scope

- Vulnerabilities in Production Checker itself
- Scanner crashes or unsafe file handling on malformed input
- False negatives for high-confidence security patterns
- Secret leakage in reports

Out of scope:

- Vulnerabilities found only in scanned applications; use regular issues with a minimized reproduction
- Social engineering, compromised developer machines, or denial of service requiring unusual input sizes beyond documented limits
