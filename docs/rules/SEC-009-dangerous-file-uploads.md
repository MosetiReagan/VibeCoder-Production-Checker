# Potentially dangerous file upload configuration

- **Rule:** `SEC-009`
- **Severity:** high
- **Default confidence:** medium

## Description

An upload path was found without a visible size or type restriction nearby.

## Why it matters

Unrestricted uploads can consume storage, deliver malware, or place executable content in a served path.

## Examples

```js
app.post('/upload', upload.single('file'), handler);
```

## False positives

Validation may occur in a handler, middleware, or upstream service. Suppress with a reason when that control exists.

## Remediation

Enforce MIME and extension allow-lists, maximum sizes, random storage names, malware scanning, and non-executable storage. Serve untrusted files with `Content-Disposition: attachment`.
