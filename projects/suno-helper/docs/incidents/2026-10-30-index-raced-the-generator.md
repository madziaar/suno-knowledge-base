# Incident 2026-10-30 — the index raced the generator

**Status:** fixed by the loop (self-healed) · **Found by:** a 500-turn run
**Severity:** low (transient, self-healing) but it cost five subgoals and 8 turns

## Symptom

The 500-turn run opened with `8 ok, 8 failed`: turns 3–12 logged

```
md_audit: 3 markdown issue(s) in 31 files (0 auto-fixed); gate md_audit: fail
```

Every failure was the same subgoal family — the docs gate and the two children a
split had created from it — and every one of those children was itself an
`md_audit` subgoal, so the split reproduced the failure instead of isolating it.

## Root cause

`docs/tools/README.md` is a hand-maintained index. It gained rows for three new
capabilities (`song-capture`, `batch-backend`, `popup-ui`) in the same commit
that *deleted* their pages, so the capability wave could generate them.

Between the index edit and the generator's turn, the index pointed at three files
that did not exist yet:

| Turn | What happened |
|------|---------------|
| 1–2 | `md_audit` green (audit rotation had not reached the docs yet) |
| 3 | `md_audit` sees 3 dead links → gate fails |
| 5–6 | retried, then split into two `md_audit` children — same 3 dead links |
| 15–18 | `capability_docs` writes `song-capture.md`, `batch-backend.md`, `popup-ui.md` |
| 20+ | `md_audit` green for the remaining 473 audit turns |

The gate was correct. The *state* was transiently inconsistent, and the thrash
guard (absolute at three failures) did its job: it blocked the family instead of
retrying forever.

## Why the split did not help

A split duplicates the parent's gate. When the parent fails because a file is
*momentarily* absent, the children fail for the same reason a second later —
splitting a time-dependent failure just produces two time-dependent failures.

That is now visible in the ledger: 8 fail turns, all in one 10-turn window, then
473 consecutive green audits.

## What changed

1. **The loop re-opened the family itself.** On the next run, `_capability_wave`
   found the generated pages present, the gates passed, and the blocked subgoals
   were re-queued — 30 turns later the goal was 19/19 done at 100%.
2. **A note in the docs index.** `docs/tools/README.md` now says the table is
   generated-adjacent: if you add a row, add the page in the same commit or
   expect a red gate for a few turns.
3. **No code change.** The engine behaved exactly as designed; the lesson is
   about ordering work, not about loosening the guard.

## The general rule this run produced

> A generated artifact and a hand-written index are two writers to the same
> truth. Land them in one commit, or make the index generated too.

The second option is the better one and is queued as a subgoal: render the tools
index from `CAPABILITIES` inside `capability_docs`, so the table cannot name a
page that does not exist.
