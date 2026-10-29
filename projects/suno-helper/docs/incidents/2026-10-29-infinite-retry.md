# Incident 2026-10-29 — the loop retried one subgoal 54 times

**Status:** fixed · **Found by:** the loop itself (turn 72) · **Severity:** high
for unattended runs (burns the whole batch, never converges)

## Symptom

A 60-turn batch ended with `6 ok, 54 failed`. The ledger showed the same
subgoal, `docs-cite-the-canonical-limits-isolate-the-failing-evidence`, failing
every turn with an identical message:

```
md_audit: 186 markdown issue(s) in 400 files (0 auto-fixed)
```

`subgoals.json` at that moment: that entry had `attempts=54`, `failures=54`,
`depends_on=2`, `status=pending`. `proposals.json` had grown to 200 entries,
49 of them duplicate `tune` proposals.

## Three root causes

### 1. The thrash guard was relative, not absolute

```python
# before
if sub.failures >= 3 and not sub.depends_on:
    sub.mark("blocked")
```

Once a subgoal was split it gained `depends_on`, so the guard stopped applying —
the split *disarmed* the only brake. A subgoal could then fail forever as long as
its children kept passing.

**Fix:** the guard is absolute (`failures >= RETRY_LIMIT` → never selected).
Splitting is allowed exactly once per subgoal (`split_depth`), and a subgoal that
fails after being split is escalated rather than retried:

```python
sub.mark("blocked", reason=f"{sub.failures} failures — escalated for a human decision")
self.research.ask(...)   # the question is now on the desk, not in a loop
```

### 2. The gate scanned trees the project does not own

`md_audit(paths=["docs"])` walked `archive/`, `resources/` and `llm-wiki/` — 400
files, 186 pre-existing dead links in vendored third-party lists. No edit inside
`projects/suno-helper` could ever make that gate pass, so the subgoal was
unsatisfiable by construction.

**Fix:** vendored/retired trees are excluded by default
(`VENDORED_PREFIXES`), reported as `vendored_skipped`, and opt-in via
`include_vendored=True`. Split children now audit `projects/suno-helper/docs`,
which is a scope the project can actually fix.

### 3. Proposals were not deduplicated

A failure streak made `reflect()` run every turn, and each run appended the same
advice again. 200 proposals, 49 identical pending tunings — the ledger of
decisions became unreadable exactly when it mattered.

**Fix:** `propose()` returns the existing pending proposal for the same
`(kind, title)` and merges evidence; storage keeps ≤40 pending plus ≤120 decided.

## Why the loop did not notice sooner

It did notice — the ledger recorded `fail` 54 times — but nothing *acted* on a
failing pattern. That is the difference between logging and self-improvement.
The escalation path (blocked + written question + note) is what turns a repeated
failure into a decision.

## Regression tests added

| Test | Protects against |
|------|------------------|
| `test_thrash_guard_is_absolute_even_with_dependencies` | cause 1 |
| `test_split_happens_once_per_subgoal` | splitting forever |
| `test_split_depth_roundtrip` | depth lost on reload |
| `test_md_audit_skips_vendored_trees` | cause 2 |
| `test_md_audit_can_opt_into_vendored` | over-correction |
| `test_pending_proposals_are_deduped` | cause 3 |

## What the next long run should show

- zero subgoals with `failures > 3`
- `proposals.json` with a small, distinct pending set
- a success rate above 90% after the first wave

That is the check this incident leaves behind.
