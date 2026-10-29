---
name: find-skills
description: Use when you need a capability you do not have in context - retrieves the most relevant local skill by name, tag, stage and body instead of guessing
tags: [retrieval, process, skills, discovery]
stages: [ultraplan, ultraresearch, ultrawork]
---

# Find Skills

## Why

An agent that guesses at a technique re-invents it badly. The repository already
contains the technique as a `SKILL.md`. Finding it is cheaper than inventing it.

## Procedure

1. **Restate the need as a verb phrase**, not a noun: "clean duplicate style
   tags", not "style cleaner".
2. **Search by three angles** and take the union:
   - the subgoal title,
   - the current stage (`ultraplan`, `ultraresearch`, …),
   - the domain noun + verb (`lyrics normalise`, `extension storage`).
3. **Read the top hit's frontmatter first.** If its `description` does not start
   with a situation you are actually in, drop it and take the next.
4. **Stop at two skills.** Three or more means the subgoal is too coarse — split
   it first (see `hyperplan`).

```bash
python -m suno_helper skill find "clean up a style prompt" --stage ultrawork
python -m suno_helper skill show suno-prompt-engineering
```

## Scoring (what the registry does)

| Signal | Weight |
|--------|--------|
| name match | 6.0 |
| tag match | 3.0 |
| `when_to_use` phrase | 2.5 |
| description overlap | 2.0 |
| stage match | 1.5 |
| body overlap | ≤ 2.0 |
| synonym expansion | 0.55 × trigger |

## Writing a new skill because none fit

Follow `writing-skills`: run the task *without* the skill first, record the
failure, then write the smallest text that prevents that exact failure. Then
`python -m suno_helper skill lint` before committing.

## Anti-patterns

- Loading every skill "to be safe" — burns the context the planner needs.
- Copying a skill's code block without reading its guardrails.
- Creating a skill for something a test can enforce. Automate that instead.
