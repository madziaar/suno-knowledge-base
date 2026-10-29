---
name: dispatching-agents
description: Use when 2 or more independent tasks can proceed without shared state - dispatches one isolated subagent per problem domain, in parallel
tags: [delegation, subagents, parallel, context]
stages: [ultraplan, ultrawork, verify]
---

# Dispatching Agents

## Why delegate at all

Two reasons, and only two:

1. **Parallelism** — independent problems finish in the time of the slowest, not
   the sum.
2. **Context hygiene** — the coordinator's context is the scarcest resource in a
   500-turn run. A subagent burns its own context on the mess and returns three
   sentences.

Delegation that does neither is overhead with extra steps.

## The isolation contract

A subagent never inherits the session. It receives a freshly constructed brief:

```
ROLE        who it is, what it may touch
MISSION     one sentence, one problem domain
DELIVERABLE the shape of the answer
CONSTRAINTS what it must not do
GATES       how its answer will be judged
CONTEXT     curated excerpt, budgeted (≤ 6000 chars)
SKILLS      the 1–2 skill bodies it needs, verbatim
```

Everything else is noise the subagent will confidently act on.

## When to fan out

| Situation | Fan out? |
|-----------|----------|
| 3 test files failing for unrelated reasons | yes — one per file |
| one bug, three hypotheses | no — sequential, falsify in order |
| research on 4 separate questions | yes |
| anything that edits the same file | no — serialize |
| a decision with two defensible answers | yes — adversarial (see `adversarial`) |

## In this codebase

```bash
python -m suno_helper crew delegate architect "plan the batch parser"
python -m suno_helper crew debate "ship the downloader behind a flag"
```

`Crew.dispatch_many(tasks, parallel=True)` runs them on a thread pool and
**never lets one agent's exception kill the turn** — a failed delegation returns
`AgentResult(ok=False, error=…)` and the loop continues.

## Budgets

- max 4 concurrent agents (diminishing returns, rising rate-limit risk),
- max 2 skills per agent (more crowds out the mission),
- max 6000 chars of context (longer and the agent optimises for the excerpt).

## Reviewing results

1. Read the `summary`, then `evidence`, then `risks` — in that order.
2. A result with no `evidence` is a hypothesis, not a finding.
3. Two agents disagreeing is a signal to run a gate, not to average them.
4. Anything an agent recommends is a *proposal* until a deterministic tool
   confirms it.
