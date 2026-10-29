---
name: ultrawork
description: Use when executing a planned step - writes small, typed, tested changes and keeps every transform pure and every edge case named
tags: [implementation, code, typescript, python, ultrawork]
stages: [ultrawork]
---

# Ultrawork

## Working agreement

- **Pure functions for text.** Cleaners, normalisers, builders and estimators
  take a string and return a string (or a struct). No DOM, no storage, no fetch
  inside them. That is what makes them testable and what keeps the local-first
  promise verifiable.
- **Type the boundary, not the internals.** Public functions get explicit
  parameter and return types; local variables can be inferred.
- **Every branch is a test.** Empty input, single tag, 1000-char overflow,
  CJK tags, mixed line endings, duplicate tags, emoji.
- **No new dependency without a sentence.** If you cannot justify it in the PR
  body in one line, do not add it.

## Order of work

```
types → pure function → unit test → wire into UI → manual smoke → gate
```

Never the reverse. A UI wired to an untested transform hides its bugs behind a
click.

## TypeScript specifics (extension core)

```ts
// pure, no side effects, safe on any input
export function cleanStyle(input: string, max = 1000): CleanResult
```

- `strict: true`, `noUncheckedIndexedAccess: true`.
- Return `{ value, removed, truncated, warnings }` rather than bare strings when
  the caller needs to show what changed.
- No `any`. Use `unknown` + narrowing.
- Handle surrogate pairs when slicing to a character budget (`Array.from`).

## Python specifics (agent)

- Standard library only in the agent package — it must run on a cron box with
  no virtualenv and no network.
- `from __future__ import annotations` everywhere.
- Type hints on every public function; `dataclass` for records.
- All filesystem writes go through `fsutil.atomic_write_text` and every path
  through `fsutil.resolve_inside`.
- Tools return `ToolResult`; they never raise to the engine.

## Definition of done for a step

1. Code compiles / typechecks with zero warnings.
2. Tests cover the new branches and pass.
3. No permission, dependency or privacy regression.
4. The step's `gate` command was actually run and its output is in the ledger.

## When it gets hard

Stop and re-read `hyperplan`. If the step needs more than ~120 lines of new
code, it was not a step. Split it, take the smallest, ship that.
