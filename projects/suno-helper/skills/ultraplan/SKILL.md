---
name: ultraplan
description: Use when a milestone needs to become atomic steps - decomposes into the smallest independently verifiable changes, in dependency order
tags: [planning, decomposition, milestones, ultraplan]
stages: [ultraplan]
---

# Ultraplan

The plain decomposition pass. Use `hyperplan` instead when a step is
irreversible, touches privacy or permissions, or when nobody will be watching the
result. Ultraplan is the everyday version.

## Procedure

1. **State the outcome** in one sentence a stranger could verify.
2. **List the artifacts** the outcome needs (files, tests, docs).
3. **Order by dependency**, not by effort: something is "first" only if nothing
   else depends on it.
4. **Cut to seven steps.** If there are more, the milestone is really two
   milestones; do the first and re-plan.
5. **Attach a gate to each step** — a command that exits 0 when the step landed.
6. **Write it down** in the subgoal description.

## Output shape

```markdown
Outcome: <one sentence>
Steps:
1. <step> — files: … — gate: …
2. …
Risks: <one line per risk that would invalidate the order>
```

## Rules

- No step is "refactor for clarity". Every step moves a user-visible or
  test-visible needle.
- No step depends on a decision that is still open — write the question to
  `docs/research/` first and plan around it.
- A step with no gate is a step you cannot finish, only abandon.
- If two steps touch the same file, they are one step or they are ordered.

## Handoff

`ultrawork` executes, `verify-before-done` closes, `goal-subgoal-loop` records.
