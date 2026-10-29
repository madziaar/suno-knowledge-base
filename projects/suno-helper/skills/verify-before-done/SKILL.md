---
name: verify-before-done
description: Use when about to mark any subgoal done or claim any result - requires re-runnable evidence, not an opinion, and blocks on warnings
tags: [verification, gates, evidence, testing]
stages: [verify]
---

# Verify Before Done

## The one rule

> If you cannot paste the command and its output, the subgoal is not done.

"Looks right", "should work", "the types line up" are not evidence. They are
predictions.

## Gate ladder

Run bottom-up; stop at the first failure.

| # | gate | command |
|---|------|---------|
| 1 | unit tests | `npm test` (extension) / `python -m suno_helper selftest` (agent) |
| 2 | typecheck | `npm run compile` |
| 3 | canonical data | `python -m suno_helper tools limits_audit` |
| 4 | docs hygiene | `md_audit` — fences, dead links, trailing whitespace |
| 5 | skills contract | `python -m suno_helper skill lint` |
| 6 | state integrity | `python -m suno_helper doctor` |

## Evidence format

Store this string on the subgoal:

```
turn 41: extension_check: extension compile+tests green; gate extension_check: pass
```

Rules:
- starts with the turn,
- names the tool,
- quotes the tool's own summary,
- lists each gate and its verdict.

## Warnings are failures

A passing command that prints `warning`, `deprecated`, `TODO` or `skipped` did
not pass. Either fix it or record it as an explicit, accepted limitation in the
subgoal note — and then it is a *known* gap, not a hidden one.

## Silent-skip detection

The three ways a gate lies:

1. **No tests found** — runner exits 0 because the glob matched nothing.
2. **Dependencies missing** — typecheck "passes" by not running.
3. **Cached build** — output is from before your change.

Guard: assert a minimum test count, check `node_modules` exists, and clear the
build cache when the result is suspicious.

## When a gate fails

1. Read the actual error, not the last line.
2. Reproduce it in isolation.
3. Fix the cause, not the assertion.
4. Re-run the *whole* ladder — a fix that breaks a lower gate is not a fix.

Never mark done "as a follow-up will cover it". Either open a real subgoal for
the gap or keep the current one open.
