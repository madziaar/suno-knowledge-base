# Incident: the green gate that ran nothing

**Date:** 2026-10-30
**Severity:** low for the code, high for the *claim* — the soak was reported green
on evidence that had not been collected.
**Detected by:** noticing that 500 turns finished in 7 seconds, when a single
`extension_check` takes ~11.

## What happened

`extension_check` has always had two modes:

- dependencies installed → run `npm run compile` and `npm run test`
- not installed → verify the scaffold exists and return `ok: True`

The second mode is deliberate. The loop is designed to run on a machine with no
API key and no `node_modules`; refusing to start there would make the tool
useless in exactly the environment it targets.

The bug is what the *summary* said and what the *ledger* recorded. It said
"extension scaffold present; dependencies not installed so typecheck skipped" —
and then returned `ok: True`, which the engine recorded as a passing gate for
every subgoal that names `extension_check` in its acceptance list.

A new sandbox had no `node_modules` (it is not snapshotted). A 500-turn run
completed in **7 seconds**, 500/500 ok, goal **100.0/100**, with 64
`extension_check` turns that compiled nothing and tested nothing. The dashboard
showed a perfect run. The extension was not verified at all.

## Why it took noticing, not a test

Every individual turn was honest. The tool reported what it did. The engine
recorded `ok` truthfully. There was no exception, no red gate, nothing to
pattern-match on — the only wrong thing was a *stronger claim than the evidence
supported*, and no assertion had ever encoded the claim.

The tell was arithmetic: 500 turns × an 11-second gate cannot fit in 7 seconds.

## Fix

1. **`ToolResult.skipped`** — a third outcome next to passed and failed, so a
   gate that could not run is a first-class state instead of a pass.
2. **The summary leads with `SKIPPED —`** and names the command that would make
   it real (`npm install`).
3. **The engine prefixes the recorded detail with `[skipped]`**, so the ledger
   distinguishes 64 skipped checks from 64 real ones. The evidence string in the
   ledger is what a human reads when deciding whether a run proved anything.
4. **`doctor` grows a check** — "extension dependencies": missing `node_modules`
   now prints `MISSING — run npm install or extension_check only checks the
   scaffold` in red.

A skipped gate still counts as a pass for *scheduling*, on purpose: a loop must
not spin forever because the machine it runs on is missing a JS toolchain. It
just must not look like proof.

## The re-run

State reset, `npm install` (559 packages), then the same command:

```bash
PYTHONPATH=agent python3 -m suno_helper loop --turns 500 --quiet --seed 7
```

Now each audit rotation actually runs `tsc --noEmit` and 354 vitest tests. The
run takes *minutes* instead of seconds, which is the point.

## Rule

> **A gate that cannot run is not a gate that passed.** Give it a third state,
> put the word "skipped" in the ledger, and make the summary lead with it.
> Otherwise a perfect score is just a machine that did not check.

Corollary: any run whose wall-clock time is implausible for the checks it claims
to have performed should be treated as evidence of a broken gate, not a fast
one.
