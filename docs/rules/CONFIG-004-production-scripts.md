# Production package scripts are incomplete

- **Rule:** `CONFIG-004`
- **Severity:** low
- **Default confidence:** medium

## Description

A Node.js project lacks one or more expected `package.json` scripts.

## Why it matters

Build, start, test, and lint commands make deployment and quality workflows reproducible.

## False positives

Monorepos or deployment platforms may define commands elsewhere. Suppress with the external command location.

## Remediation

Define `build`, `start`, `test`, and, when ESLint is installed, `lint`.
