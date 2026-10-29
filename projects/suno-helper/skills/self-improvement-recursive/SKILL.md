---
name: self-improvement-recursive
description: Use when the loop has failed repeatedly or has drifted - diagnose from the ledger, propose one bounded change, gate it, apply rarely, always keep a rollback
tags: [improvement, reflection, tuning, recursion, meta]
stages: [reflect, improve]
---

# Self-Improvement Recursive

## The cycle

```
observe → diagnose → propose → gate → apply (rare) → measure → rollback?
```

The recursion is real, but it is *rate-limited on purpose*. Unbounded
self-modification oscillates: the loop changes its process faster than it can
measure the effect, so every metric becomes noise.

## Observe

Read the ledger, not your memory of it:

```bash
python -m suno_helper status
python -m suno_helper improve report
```

Signals worth acting on:

| signal | threshold | meaning |
|--------|-----------|---------|
| consecutive failures | ≥ 2 | retrying the same approach |
| success rate (40 turns) | < 60 % | process is wrong, not the subgoal |
| average cycle | > 8 s | too much work per turn |
| open subgoals | > 12 | planning debt |
| subgoal failures | ≥ 3 | the unit is too coarse |
| goal version churn | > 1 / week | mission is unclear |

## Propose

Every proposal is a record with a rationale and evidence:

```json
{"id":"tune-0003","kind":"tune","title":"Cut per-cycle work",
 "rationale":"Average cycle is 9400 ms","payload":{"delegate_every":4},
 "evidence":["avg_ms=9400"],"confidence":0.6}
```

Kinds: `tune` (parameters) · `split` (coarse subgoal) · `research` (missing
knowledge) · `prune` (dead work) · `promote` (starved work) · `doc`.

## Gate

A `tune` proposal may auto-apply only if **all** hold:

1. at least 2 consecutive failures OR success rate < 75 %,
2. 10 turns since the last applied change (cooldown),
3. every target parameter inside its declared bounds,
4. at most one change per cycle.

Anything else waits, and the reason is written down. Rejections are data.

## Apply and measure

After applying, the *next* 20 turns are the experiment. Do not change anything
else during them. At the end, compare:

- success rate before vs after,
- average cycle time before vs after,
- open-subgoal count.

If any regressed, `python -m suno_helper improve rollback <id>`.

## What must never be self-modified

- the verification gates (a loop that can lower its own bar is not improving),
- the privacy rules (L1/L2 in `hyperplan`),
- the ledger schema,
- the set of files outside `projects/suno-helper`.

## Anti-patterns

- "Improving" by deleting the failing test. That is score manipulation.
- Applying three tunings at once and attributing the win to all three.
- Proposing without evidence because the diagnosis felt right.
- Never rolling back. A loop with no rollbacks is not measuring.
