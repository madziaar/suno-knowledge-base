---
name: hyperplan
description: Use when a subgoal needs breaking down before code - produces an atomic plan with invariants, blast radius, rollback and a per-step gate
tags: [planning, decomposition, risk, ultraplan, hyperplan]
stages: [ultraplan]
---

# Hyperplan

Ultraplan says "break the milestone into atomic steps". Hyperplan adds four
things that make the plan survivable when nobody is watching:

```
invariants   what must stay true no matter what
blast radius which files/contracts a step can break
rollback     how to get back, in one command
gate         the check that says the step actually landed
```

## Output shape (write this, do not improvise)

```markdown
## Plan: <subgoal id>
Invariants: L1, L2, ...
Blast radius: <paths>
Rollback: <command>

| # | step | files | gate | rollback |
|---|------|-------|------|----------|
| 1 | ...  | ...   | ...  | ...      |
```

## Rules

1. **One variable per step.** If a step changes two things, it is two steps.
2. **Every step has a gate that runs in under 60 s.** A gate you cannot run is a
   comment.
3. **Smallest reversible increment first.** A plan whose first step is
   irreversible is not a plan.
4. **Name the files.** "Update the docs" is not a step; "edit `docs/x.md` lines
   12–40" is.
5. **Stop at 7 steps.** More means the subgoal is too big — split it and plan
   the first child only.
6. **Write the plan down** in the subgoal description or `docs/research/` — a
   plan that lives only in context is lost at the next turn boundary.

## Invariants for this repo

These hold for every plan in `suno-helper`:

- **L1 — Local-first:** no user prompt, lyric or library entry leaves the device
  in a text-processing path.
- **L2 — Minimal permissions:** never add a Chrome permission to fix a bug.
- **L3 — Pure functions:** text transforms are pure, typed, and unit tested.
- **L4 — Evidence:** no subgoal is done without a re-runnable command.
- **L5 — Reversibility:** any state mutation has a snapshot or a rollback.

## Failure modes

| Smell | Fix |
|-------|-----|
| Plan has no gates | You wrote a wish list. Add `acceptance`. |
| Blast radius "everything" | Split by module first. |
| Step 1 is a refactor | Find the smallest user-visible win, do that first. |
| Plan needs a human decision | Write the question to `docs/research/`, park the subgoal. |

## Handoff

After the plan exists, `ultrawork` executes it, `verify-before-done` closes it,
and `self-improvement-recursive` reads the plan adherence from the ledger.
