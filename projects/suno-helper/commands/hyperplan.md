---
description: Decompose a subgoal with invariants, blast radius, rollback and per-step gates
argument-hint: "<subgoal or feature>"
allowed-tools: Read, Write, Edit, Bash(python3:*)
---

# /hyperplan

Ultraplan decomposes. Hyperplan decomposes **and** makes the plan survivable
unattended.

```markdown
## Plan: <subgoal id>
Invariants: L1 local-first, L2 minimal permissions, L3 pure functions, L4 evidence, L5 reversibility
Blast radius: <paths>
Rollback: <one command>

| # | step | files | gate | rollback |
|---|------|-------|------|----------|
| 1 | …    | …     | …    | …        |
```

## Rules

1. One variable per step.
2. Every step's gate runs in under 60 s.
3. Smallest reversible increment first.
4. Name the files, not the idea.
5. Stop at seven steps; if you need more, the subgoal is two subgoals.
6. Write the plan into the subgoal description — a plan that lives only in
   context dies at the next turn boundary.

## Repo invariants

- **L1** no user prompt/lyric/library text leaves the device in a text path.
- **L2** never add a Chrome permission to fix a bug.
- **L3** text transforms are pure, typed and tested.
- **L4** no subgoal is done without a re-runnable command.
- **L5** every state mutation has a snapshot or a rollback.

The skill lives at [`skills/hyperplan`](../skills/hyperplan/SKILL.md); the lighter
everyday version is [`skills/ultraplan`](../skills/ultraplan/SKILL.md).
