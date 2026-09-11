# Scoring methodology

Scores are deterministic and based only on findings emitted by enabled rules.

## Category scores

Each category starts at 100. Findings subtract:

| Severity | Penalty |
|---|---:|
| Critical | 45 |
| High | 22 |
| Medium | 9 |
| Low | 3 |
| Info | 0 |

A category cannot fall below 0. Penalties are capped at 75 per category, ensuring multiple low-severity findings cannot make a category worse than one critical finding and that a severe issue still leaves room for measurable improvement.

## Overall score

The overall score is the mean of applicable scores in Security, Reliability, Configuration, Infrastructure, Dependencies, Performance, and Production Hygiene. Categories with no applicable findings count as 100.

## Levels

- 90–100: Production Ready
- 80–89: Mostly Ready
- 70–79: Needs Attention
- 50–69: High Risk
- 0–49: Not Ready

Run `production-check score` to see finding counts per category. Scores are not a security certification.
