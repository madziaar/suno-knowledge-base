---
name: goal-subgoal-loop
description: Use when running or resuming an autonomous turn - defines the exact /goal and /subgoals update written at the end of every single turn
tags: [goal, subgoal, state, loop, proto col]
stages: [ultraplan, reflect, improve]
---

# Goal → Subgoal Loop

## The invariant

There is exactly **one goal** and **many subgoals**. The goal does not change
per turn; it changes when the evidence says the mission changed. Subgoals change
constantly — that is the point.

```
/goal      north star + metric + progress   (slow-moving, versioned)
/subgoals  atomic verifiable work           (fast-moving, append-mostly)
```

Both live in `.suno-helper/` as JSON (source of truth) and are rendered to
`GOAL.md` / `SUBGOALS.md` for humans after every turn.

## End-of-turn write (mandatory, all five steps)

1. **Recompute the metric** — `state.recompute_progress()` = weighted completion
   of non-dropped subgoals. Never hand-edit `current`.
2. **Record the attempt** — attempts++, failures++ on failure, evidence appended
   on success. Evidence is a string a sceptic can re-run.
3. **Move exactly one status** — `done | active | blocked | dropped`. A turn that
   moves two statuses is doing two turns badly.
4. **Note the decision** — one line in `goal.notes`:
   `"<subgoal>: <outcome> (<evidence>)"`.
5. **Snapshot + ledger** — write files atomically, append one ledger line.

## Promotion rules

A subgoal may only become `done` when **every** acceptance gate passes *and*
the evidence names the command or file that proves it. Otherwise:

| Situation | Status | Next turn does |
|-----------|--------|----------------|
| gate failed once | `active` | retry with a narrower change |
| gate failed twice | `blocked` | self-improvement splits it |
| dependency incomplete | `blocked` | engine re-checks each turn |
| superseded by another subgoal | `dropped` + reason | nothing |

## Adding subgoals

Only three legal sources:

1. **Bootstrap** — `StateStore.seed_default()`.
2. **Wave extension** — when fewer than three subgoals stay open, the engine
   queues the next roadmap wave (`Engine._next_wave`).
3. **Structural proposal** — `split` / `research` / `promote` from
   `self-improvement-recursive`, which records *why* in `proposals.json`.

A subgoal with no `action.tool` and no gate is a wish, not work. Do not add it.

## Selection policy

```
score = priority + staleness + fresh_bonus + failure_recovery + jitter
```

- `staleness = min(6, 0.35 × turns_since_last_attempt)` — nothing starves.
- `fresh_bonus = 1.5` for attempts == 0 — new work gets a look.
- ties break on `id` so runs are reproducible.

## Failure modes to watch

- **Metric drift** — someone edits `current` by hand. The recompute overwrites it.
- **Goal churn** — retitling the goal each week. Version bumps are logged; if
  `version` climbs without a new mission, the improvement loop flags it.
- **Immortal subgoal** — 10 attempts, still `pending`. At 3 failures it must be
  split or dropped; the tuner enforces this.
