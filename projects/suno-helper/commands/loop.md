---
description: Run the autonomous goal/subgoal loop for N turns
argument-hint: "[turns] [--every 60] [--seed 7]"
allowed-tools: Bash(python3:*), Read, Write, Edit
---

# /loop

Run the suno-helper loop. Every turn:

1. loads `/goal` and `/subgoals`,
2. finds and loads the process skill for the current stage,
3. selects the next subgoal,
4. researches open questions,
5. dispatches an agent crew,
6. runs the subgoal's deterministic tool,
7. evaluates every acceptance gate,
8. reflects and (rarely) self-tunes,
9. rewrites `/goal` + `/subgoals` and appends a ledger line.

## Run

```bash
PYTHONPATH=agent python3 -m suno_helper loop --turns "${1:-25}" --report-every 25
```

For a long unattended batch:

```bash
PYTHONPATH=agent python3 -m suno_helper loop --turns 500 --quiet --seed 7
```

## After the batch

```bash
PYTHONPATH=agent python3 -m suno_helper status
PYTHONPATH=agent python3 -m suno_helper doctor
tail -5 .suno-helper/ledger.jsonl
```

## Rules

- Do not hand-edit `GOAL.md` / `SUBGOALS.md`; they are rendered from
  `.suno-helper/*.json`.
- If a turn reports `fail`, the next turn reads the failure — do not "fix" the
  state by marking it done.
- Stop and read `docs/loop-report.md` if the success rate drops below 60%.
