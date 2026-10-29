---
name: using-superpowers
description: Use when starting any turn of the suno-helper loop - establishes that a skill must be found and loaded before planning, researching or editing
tags: [process, discipline, loop, superpowers]
stages: [ultraplan, ultraresearch, ultrawork, verify, reflect, improve]
---

# Using Superpowers

## The rule

Before any action in a turn — including "just checking a file" — find the skill
that governs the action and load it. If a skill applies, you do not have a
choice about using it.

    announce → load → follow → record

Announce the skill you chose, load its full text, follow its checklist, and
record the name in the turn's ledger entry (the engine does this automatically
via `Engine._find_skills`).

## Skill priority

1. **Process skills** — they decide *how* the turn is executed:
   `goal-subgoal-loop`, `hyperplan`, `ultraresearch`, `ultrawork`,
   `verify-before-done`, `self-improvement-recursive`.
2. **Team skills** — they decide *who* executes:
   `team-pyrite`, `teammode`, `dispatching-agents`, `adversarial`.
3. **Domain skills** — they carry the knowledge:
   `suno-prompt-engineering`, `local-first-extension`.

## Red flags

| Thought | Reality |
---------|---------|
| "This turn is trivial, skip the skill lookup" | Trivial turns are where drift starts. Look it up. |
| "I remember what the skill says" | Skills change. Load the file. |
| "I'll find skills after I see the code" | The skill tells you how to read the code. |
| "The subgoal is obviously done" | `verify-before-done` decides that, not you. |
| "Delegating would take longer" | Delegation is how the coordinator keeps context for planning. |

## Per-turn contract

Every turn must produce all five:

1. one skill chosen and named,
2. one subgoal advanced,
3. one deterministic action with a tool name,
4. one gate actually evaluated,
5. one ledger line.

A turn missing any of these is a failed turn even if the tool "worked".

## When the loop is unattended

There is no human to ask. Escalate by *writing*: put the question in
`docs/research/` as an open question, add `blocked` with a reason, and move to
the next subgoal. Never invent a human decision and never stall the queue.
