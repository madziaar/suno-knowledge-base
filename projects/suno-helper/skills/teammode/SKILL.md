---
name: teammode
description: Use when several subgoals can advance in one wave without touching the same files - runs a fan-out wave, then a serial merge with gates
tags: [team, parallel, waves, orchestration, merge]
stages: [ultraplan, ultrawork]
---

# Team Mode

Team mode is *wave execution*: fan out across independent subgoals, then merge
serially under gates. It is the difference between a loop that does one thing per
turn forever and one that closes a milestone in a wave.

## Wave protocol

```
1. SELECT   up to 4 open subgoals with unmet deps == 0
2. PARTITION by blast radius (files they will touch)
   — any overlap → keep the higher-priority one, defer the rest
3. DISPATCH one agent crew per partition, in parallel
4. COLLECT  results into a local queue (never write files from N agents at once)
5. MERGE    serially: apply, run gates, record evidence, rollback on failure
6. REPORT   one ledger line per subgoal + one wave summary in goal.notes
```

## Partitioning rule

```
share a file  →  serialize
share a tool  →  parallel is fine (tools are read-mostly)
share a state →  serialize (goal/subgoal writes are single-writer)
```

Goal and subgoal files are **single-writer by design**. Only the engine mutates
them, after the wave. Agents propose; the engine commits.

## Budgets

| resource | per wave | rationale |
|----------|----------|-----------|
| subgoals | ≤ 4 | beyond that, merge defects outnumber wins |
| agents | ≤ 4 concurrent | rate limits, review bandwidth |
| wall clock | ≤ 10 min | a wave that runs longer is a milestone |
| ledger lines | 1 per subgoal + 1 | the wave itself is auditable |

## Merge checklist

- [ ] every changed file is inside `projects/suno-helper` or `docs/`
- [ ] `npm run compile` and `npm test` green (extension touched)
- [ ] `python -m suno_helper selftest` green (agent touched)
- [ ] no new Chrome permission
- [ ] no new dependency
- [ ] `python -m suno_helper doctor` passes
- [ ] `/goal` + `/subgoals` regenerated
- [ ] one ledger line per subgoal

## When team mode is wrong

- Interactive debugging — one hypothesis at a time.
- Anything rewriting the same module.
- When the last wave's gates failed: fix first, fan out second.
- When fewer than two subgoals are unblocked: run a normal turn.
