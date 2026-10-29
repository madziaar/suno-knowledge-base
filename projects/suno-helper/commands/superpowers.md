---
description: Adopt the Superpowers discipline for this turn (skill before action)
argument-hint: "[skill name to force]"
allowed-tools: Bash(python3:*), Read
---

# /superpowers:using-superpowers

Before any action in a turn — including reading a file — find the skill that
governs it and load it.

```bash
PYTHONPATH=agent python3 -m suno_helper skill find "what I am about to do"
PYTHONPATH=agent python3 -m suno_helper skill show <name>
```

## The per-turn contract

Every turn must produce all five, or it is a failed turn even if the tool
"worked":

1. a skill chosen and named,
2. one subgoal advanced,
3. one deterministic action with a tool name,
4. one gate actually evaluated,
5. one ledger line.

## Priority

1. **Process** — `goal-subgoal-loop`, `hyperplan`, `ultraresearch`, `ultrawork`,
   `verify-before-done`, `self-improvement-recursive`.
2. **Team** — `team-pyrite`, `teammode`, `dispatching-agents`, `adversarial`.
3. **Domain** — `suno-prompt-engineering`, `local-first-extension`.

## Red flags

| Thought | Reality |
|---------|---------|
| "This turn is trivial" | Trivial turns are where drift starts. |
| "I remember the skill" | Skills change; load the file. |
| "The subgoal is obviously done" | `verify-before-done` decides, not you. |
| "Delegation takes longer" | It buys you the context you plan with. |
