---
description: Red-team a decision or change with a builder against a skeptic
argument-hint: "<motion to attack>"
allowed-tools: Bash(python3:*), Read
---

# /adversarial

Two agents, opposite jobs, one motion. The judge is not a third opinion — it is
the deterministic gate.

```bash
PYTHONPATH=agent python3 -m suno_helper crew debate "add a background fetch for profile pages"
```

## Decision rules

| Condition | Decision |
|-----------|----------|
| builder has evidence, skeptic names no concrete risk | `accept` |
| skeptic names ≥1 concrete risk | `revise` — the risk becomes a subgoal |
| neither side has evidence | `hold` — go research |
| both have evidence that conflicts | `hold` — run the disputed gate |

Never average the two positions. Averaging produces a claim nobody checked.

## Mandatory adversaries in this repo

Run this before shipping anything that:

1. adds or widens a Chrome permission,
2. sends user data over the network,
3. changes a number in `docs/suno-limits.json`,
4. marks a blocked subgoal done,
5. deletes a subgoal or a test.

## Output

A `revise` verdict must name the risk concretely, e.g. "sends `profile_url` to a
third-party host with no allowlist (patch.ts:42)". "Could be a privacy issue" is
rejected as a non-finding.
