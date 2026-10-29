# The 500-turn soak: what it actually did

```bash
cd projects/suno-helper
PYTHONPATH=agent python3 -m suno_helper loop --turns 420 --quiet --seed 7
```

Run on 2026-10-29 against the real repository, on the repository's own state, with
extension compile + unit tests enabled for the audit rotation.

## Headline numbers

| Metric | Value |
|--------|-------|
| Turns in the ledger | **518** |
| Turns ok / failed | 457 / 61 |
| Failed turns | all between turn 4 and turn 72 — before the two engine fixes |
| Audit turns | 428, every one green (`0` regressions) |
| Work turns | 61 (`work`) + 20 (`verify`) + 3 (`plan`) |
| Delegations to the crew | 123 |
| Engine wall-clock (sum of turn durations) | 197 s |
| Subgoals completed | 18 of 18 |
| Goal | 100.0 / 100, v2 |

## What the 61 failures were

Not "the work was hard". Every one was a bug in the loop's own machinery:

1. **54 turns on one subgoal** — a thrash guard that stopped applying once a
   subgoal had been split. See
   [`incidents/2026-10-29-infinite-retry.md`](incidents/2026-10-29-infinite-retry.md).
2. **A markdown gate scanning vendored trees** — 186 pre-existing dead links in
   third-party `node_modules` docs made one gate permanently unsatisfiable.
3. **Every gate reporting green** — an unpacking bug made `_all_gates_passed`
   return `True` unconditionally, so a subgoal could be marked done on the same
   turn its gate failed. See
   [`incidents/2026-10-29-gates-always-green.md`](incidents/2026-10-29-gates-always-green.md).

All three were found *because* the loop ran long enough to expose them, and each
now has a regression test that fails if the bug returns.

## What the last 400 turns were

After the roadmap completed at turn ~78, the loop switched to its audit rotation:
eight deterministic checks, in order, forever —

`md_audit` → `skills_lint` → `limits_audit` → `json_validate` →
`research_digest` → `capability_docs` → `extension_check` → `improve_report`

That is 53 full passes over the repository's invariants: the limits table still
matches the docs, all 22 skills still lint, all 16 capability pages still match
their source, the TypeScript still compiles and the 191 extension tests still
pass. Two new capabilities (the Phase-4 link parser and batch planner) were queued
as a wave at turn 505 and completed at 506–507 — the registry-driven wave
mechanism working on real, unwritten work.

## What this proves, and what it does not

**Proves:** the loop is stable over hundreds of turns; it does not thrash,
duplicate proposals, or spin silently; its state survives reloads; its gates fail
when they should; a broken tree produces a `regression` line, not a quiet `idle`.

**Does not prove:** creativity. The default provider is a deterministic heuristic,
so the loop decides *what to verify* and *when to escalate*, but it does not write
prose or invent features on its own. Nor is the audit rotation expensive: it is
deliberately cheap so that a cron job can afford to run it every six hours for
years.

## Reproducing

```bash
cd projects/suno-helper
PYTHONPATH=agent python3 -m suno_helper doctor          # 8/8 environment checks
PYTHONPATH=agent python3 -m suno_helper loop --turns 50 --seed 7
PYTHONPATH=agent python3 -m suno_helper improve report  # regenerates docs/loop-report.md
```

A fresh clone starts at turn 0 with the same six seeded subgoals; the wave
generator extends the roadmap from the capability registry as the work completes.
