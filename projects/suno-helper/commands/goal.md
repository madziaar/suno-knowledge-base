---
description: Show or change the single /goal the loop optimises
argument-hint: "[show|set key=value|note text|history|next]"
allowed-tools: Bash(python3:*), Read, Write
---

# /goal

The goal is the north star: one per project, slow-moving, versioned. The metric
is **weighted subgoal completion**, recomputed from the subgoal list — never
hand-edited.

```bash
PYTHONPATH=agent python3 -m suno_helper goal show
PYTHONPATH=agent python3 -m suno_helper goal note "why today's decision was made"
PYTHONPATH=agent python3 -m suno_helper goal set target=120 horizon=Q1
PYTHONPATH=agent python3 -m suno_helper goal history
```

## Changing the goal is a real decision

- `goal set title=…` bumps `version` and is recorded in `goal-history/`.
- If the mission genuinely changed, also rewrite the subgoal list: subgoals that
  no longer serve the goal must be dropped **with a reason**, not abandoned.
- Do not retitle the goal to make progress look better. The improver flags goal
  churn for exactly this reason.

## Read the rendering

`GOAL.md` shows a progress bar, the metric, and a table of subgoals with
priority, weight, attempts and failures. Blocked subgoals list what they wait on.
