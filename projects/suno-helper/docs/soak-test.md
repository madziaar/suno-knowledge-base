# The 500-turn soak: what it actually did

```bash
cd projects/suno-helper
PYTHONPATH=agent python3 -m suno_helper loop --turns 500 --quiet --seed 7
PYTHONPATH=agent python3 -m suno_helper loop --turns 30  --quiet   # drain the re-opened family
```

Second soak, run 2026-10-30 against the real repository, with extension compile
and all 246 unit tests enabled inside the audit rotation.

## Headline numbers

| Metric | Value |
|--------|-------|
| Turns in the ledger | **530** |
| Turns ok / failed | 522 / 8 |
| Failed turns | turns 3–12 only, one transient cause (see below) |
| Audit turns | 498, every one green |
| Build turns | 19 `done` + 5 `plan` waves |
| Subgoals completed | 19 of 19 |
| Delegations to the crew | 36 |
| Engine wall-clock | 233 s (sum of turn durations) |
| Goal | 100.0 / 100, `complete` |

## The 8 failures were one bug

Not eight. `docs/tools/README.md` gained rows for three capabilities whose pages
the loop had not generated yet, so `md_audit` saw three dead links for about ten
turns. The thrash guard blocked the family at three failures instead of looping;
the generator then wrote the pages, and the next run re-opened and closed
everything.

Written up in
[`incidents/2026-10-30-index-raced-the-generator.md`](incidents/2026-10-30-index-raced-the-generator.md).
The honest summary: **the gate was right, the ordering was wrong.**

## What the other 490 turns were

After the roadmap closed (~turn 20), the loop ran its audit rotation 61 times:

`md_audit` → `skills_lint` → `limits_audit` → `json_validate` →
`research_digest` → `capability_docs` → `extension_check` → `improve_report`

That is 61 full passes over the repository's invariants: the limits table still
matches 35 docs, all 22 skills still lint, all 19 capability pages still match
their source, TypeScript still compiles, all 246 extension tests still pass.

Five turns were `plan` turns: the capability wave queued work as pages completed
(the registry drove it, not a hand-written list).

## What this proves, and what it does not

**Proves:** the loop is stable across 500+ turns; it does not thrash, does not
duplicate proposals (12 proposals, 4 distinct pending), survives restarts, and
its gates fail when they should — including when the failure is in the docs the
loop itself just wrote.

**Does not prove:** creativity. The default provider is deterministic, so the
loop decides *what to verify* and *when to escalate*; it does not invent prose.
The audit rotation is deliberately cheap so a cron job can afford to run it for
years.

## Reproducing

```bash
cd projects/suno-helper
PYTHONPATH=agent python3 -m suno_helper doctor            # 8/8 environment checks
PYTHONPATH=agent python3 -m suno_helper loop --turns 50 --seed 7
PYTHONPATH=agent python3 -m suno_helper improve report    # regenerates docs/loop-report.md
```

A fresh clone starts at turn 0 with six seeded subgoals; the wave generator
extends the roadmap from the capability registry as work completes.
