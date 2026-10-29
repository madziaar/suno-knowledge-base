---
name: adversarial
description: Use when a decision has two defensible answers or a change touches privacy, permissions or user data - runs a builder against a skeptic and decides on evidence
tags: [adversarial, red-team, review, debate, risk]
stages: [verify, improve]
---

# Adversarial Review

## The setup

Two agents, one motion, opposite jobs:

- **Builder** (`forge`) — strongest honest case *for*, with evidence.
- **Skeptic** (`sentinel`) — concrete failure modes *against*, with evidence.
- **Judge** — not a third opinion. The **deterministic gates** decide.

```
motion: "Ship the profile parser behind a flag"
forge:   here is the smallest safe implementation, gate X passes
sentinel: it sends a user URL to a third party; gate Y has no coverage
judge:   revise — add host allowlist, then re-run gates
```

## Decision rules

| Condition | Decision |
|-----------|----------|
| builder has evidence, skeptic names no concrete risk | `accept` |
| skeptic names ≥ 1 concrete risk | `revise` (risk becomes a subgoal) |
| neither side has evidence | `hold` (go research) |
| both have evidence and they conflict | `hold` + run the disputed gate |

Never average. Averaging two opposite claims produces a claim nobody checked.

## What counts as a concrete risk

- "It sends `profile_url` to `api.example.com` on line 42" — concrete.
- "Could be a privacy issue" — not concrete, reject it.
- "Adds `tabs` permission for a feature that only needs `activeTab`" — concrete.
- "Might be slow" — quote a measurement or drop it.

## Mandatory adversaries for this repo

Run `adversarial` before shipping anything that:

1. adds or widens a Chrome permission,
2. touches a network call with user data,
3. changes a canonical number in `docs/suno-limits.json`,
4. marks a previously `blocked` subgoal as `done`,
5. deletes a subgoal or a test.

## Output

The debate is recorded on the proposal/subgoal:

```
decision: revise
rationale: skeptic named 1 concrete risk (URL egress without allowlist)
rejected: [ship behind flag]
accepted: [add host allowlist first]
```

If the loop cannot resolve it unattended, the risk becomes a **blocked
subgoal** with the question written to `docs/research/`. It does not become a
silent exception.
