# Architecture and decisions

## Shape of the system

```
probe  →  decide  →  act  →  verify  →  record
         (goal)     (tool)  (gates)   (ledger + subgoals)
```

Two halves, deliberately separated:

| Half | Runs where | Depends on | Fails how |
|------|-----------|------------|-----------|
| `extension/` TS | the user's browser | nothing at runtime | a gate catches it before release |
| `agent/` Python | a cron box or a laptop | stdlib only | a turn is recorded as `fail` |

They share one artifact: `docs/suno-limits.json`. The extension's typed mirror is
asserted against it by `limits.test.ts`; the agent audits docs for stale claims
against the same file. There is no third source of numbers.

### Three layers in the extension

```
entrypoints/          the only files that touch browser APIs
  popup/App.tsx       four-tab shell        (builder · batch · library · tools)
  options/App.tsx     settings, export, capture history
  background.ts       storage writer + batch queue (the only fetch in the product)
  content/index.tsx   reads/writes the Suno create form

src/components/       presentational panels — no chrome.* calls, no fetch
src/state/builder.ts  zustand store for the shared builder state
src/lib/              pure functions: every transform, every parser, every rule
src/backend/jobs.ts   pure job state machine (schedule, retry, settle)
```

The rule is one sentence long: **if it can be pure, it is in `src/lib` or
`backend/` and it has a test; if it touches the browser, it is in `entrypoints/`
and it is as small as possible.** That is what lets 246 tests run in node with no
browser and no network.

## Decisions

### D1 — The loop must work with no model

**Decision:** the default provider is a deterministic local heuristic.

**Why:** a cron job that dies when an API key expires is a cron job you stop
trusting. With deterministic tools (audits, lints, builds, digests) the loop
makes real progress offline; a model adds planning quality, not capability.

**Cost:** the heuristic planner is a rule, not a reasoner. It is good at
"what is the next mechanical step" and bad at "is this the right feature".

### D2 — One goal, many subgoals, both on disk

**Decision:** state is JSON in `.suno-helper/`, rendered to `GOAL.md` /
`SUBGOALS.md` after every turn.

**Why:** a 500-turn run needs state a human can read at 3 a.m. and a program can
diff. Atomic writes (temp + `os.replace`) mean a killed process never leaves a
half-written goal.

**Cost:** two representations to keep in sync — mitigated by generating the
markdown from the JSON, never the reverse.

### D3 — Verification is deterministic, never model-judged

**Decision:** a subgoal is `done` only when its `acceptance` tools return `ok`.

**Why:** "the model says it looks right" is how loops drift for hundreds of
turns without anyone noticing. Gates are commands; evidence is their output.

**Cost:** anything not expressible as a command cannot be auto-completed. Those
subgoals get `blocked` with a written reason instead of a fake win.

### D4 — Self-improvement is rate-limited

**Decision:** parameters are bounded, at most one tuning change per 10 turns,
structural changes at most one per scheduled reflection, every change has a
rollback.

**Why:** unbounded self-modification oscillates. The loop would change its process
faster than it can measure the effect, and every metric becomes noise.

**Cost:** slower adaptation. That is the point.

### D5 — Delegation is isolated by construction

**Decision:** every subagent gets a freshly built brief (role, mission,
deliverables, constraints, gates, budgeted context, ≤2 skills). Session history
is never forwarded.

**Why:** context contamination is the dominant failure mode in multi-agent work,
and the coordinator's context is the scarcest resource in a long run.

### D6 — Permissions are a budget, not a setting

**Decision:** `storage` plus host access to suno.com. Nothing else.

**Why:** the product's claim is privacy. One `tabs` permission turns a verifiable
promise into a marketing line. Any future permission needs a written
justification in the PR that adds it.

### D7 — No reverse-engineered APIs, no site patching

**Decision:** recorded as a risk, never implemented.

**Why:** they need the user's session cookie, break silently, and carry ToS
exposure. The playbook already flags this; we agree and go further by refusing
the feature rather than gating it.

### D8 — Selectors in exactly one module

**Decision:** every DOM selector lives in `src/selectors.ts`, ordered by
resilience (placeholder/aria text before class names), with a verification date.

**Why:** Suno will change its markup. The cost of that change should be one
file and a version bump, not an archaeology session.

### D9 — Skills over prompt-hardcoding

**Decision:** the loop retrieves methods from `skills/` instead of embedding
procedures in code.

**Why:** methods change more often than code, and a skill is reviewable prose
that a human can fix in a pull request. It also keeps the per-turn context small:
two skills, not fifteen.

## Testing strategy

| Layer | Tool | Count | What it protects |
|-------|------|-------|------------------|
| Pure text/state functions (TS) | vitest | 246 | every transform edge case, including emoji, CJK tags, quoted CSV and nested JSON-LD |
| Canonical-data mirror | vitest | 1 | drift between `limits.ts` and `docs/suno-limits.json` |
| Batch machine + capture parser | vitest | 47 | retry budgets, concurrency, partial pages, duplicate merging |
| Agent state machine | unittest | 109 | selection policy, starvation, thrash guard, gate honesty, ledger integrity |
| Convergence | unittest | 8 | the loop actually closes subgoals within a turn budget |
| End-to-end | `npm run build` + `wxt build` | — | the extension still packages (267 kB, MV3) |

The suite runs without network, without a browser and without credentials, which
is what makes it usable as a gate inside the loop itself.

## Known limitations

1. Selectors are best-effort against a live SPA and will need verification
   against the current DOM.
2. The heuristic planner cannot judge feature value; roadmap waves are
   hand-authored.
3. The duration estimator counts English syllables; other languages will be
   systematically wrong (documented, not silently averaged).
4. `chrome.storage.local` is not encrypted at rest — it is protected by the
   OS user account and the browser profile, which is the same model as any local
   app.
5. The loop caps structural changes, so a genuinely mis-specified goal takes
   several turns to correct.
6. Batch capture reads public pages only. Playlists and profiles need a real tab
   (their track lists are rendered client-side), so they are marked `manual`
   rather than half-parsed.
7. There is no audio handling at all: no download, no transcode, no ID3. The
   extension records metadata and stops.
