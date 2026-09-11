# Managing false positives

## Inline suppression

```ts
const testToken = process.env.TEST_TOKEN; // production-check-ignore SEC-001
```

Inline suppression applies to the specific evidence line.

## Configuration suppression

```json
{
  "ignore": {
    "SEC-008": "Rate limiting is enforced by the API gateway"
  }
}
```

The object form is preferred because it records a reason.

## Disable a rule

```json
{
  "rules": {
    "AI-001": "off"
  }
}
```

## Report an issue

Open a rule request or bug report with unsafe and safe examples. Rule improvements should reduce false positives without hiding high-confidence evidence.
