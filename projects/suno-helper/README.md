# Suno Helper

A local-first Suno companion **and** the autonomous agent loop that keeps
building it.

Two deliverables live here:

| Deliverable | What it is | Where |
|-------------|------------|-------|
| **Extension** | Manifest V3 browser extension: five-tab popup (builder, batch, library, tools, studio), a full-page lyric-video renderer, options page, background batch capture. Zero network egress except the public pages you ask it to read. | [`extension/`](extension/) |
| **Agent loop** | A goal/subgoal engine that runs unattended, turn after turn, updating `/goal` and `/subgoals`, loading skills, researching, delegating to an agent crew, verifying with deterministic tools, and improving its own process | [`agent/`](agent/) |

Everything is standard-library Python and dependency-light TypeScript. No
backend, no account, no telemetry.

---

## Quick start

```bash
# from the repository root
cd projects/suno-helper

# 1. see where the loop stands
PYTHONPATH=agent python3 -m suno_helper status

# 2. run 10 turns synchronously
PYTHONPATH=agent python3 -m suno_helper loop --turns 10

# 3. the real thing: 500 unattended turns
PYTHONPATH=agent python3 -m suno_helper loop --turns 500 --quiet --seed 7

# 4. find the skill that applies to a task
PYTHONPATH=agent python3 -m suno_helper skill find "clean duplicate style tags"

# 5. adversarial review of a decision
PYTHONPATH=agent python3 -m suno_helper crew debate "add a profile downloader"
```

The extension:

```bash
cd extension
npm install
npm test          # 191 unit tests, pure functions, no browser
npm run compile   # strict TypeScript
npm run build     # .output/chrome-mv3/
```

---

## What "the loop" actually does

Every turn, all nine steps, recorded in `.suno-helper/ledger.jsonl`:

```
1 LOAD       read /goal, /subgoals, params, ledger
2 SKILLS     find + load the process skill for the current stage
3 SELECT     pick the next subgoal (priority + staleness + failure recovery)
4 RESEARCH   triage open questions against the cited corpus
5 DELEGATE   dispatch an agent crew with isolated context
6 ACT        run the subgoal's deterministic tool
7 VERIFY     evaluate every acceptance gate — evidence or it did not happen
8 IMPROVE    reflect → propose → gate → apply (rare) → rollback if worse
9 PERSIST    update /goal + /subgoals, snapshot, append the ledger line
```

Because steps 6–7 are deterministic tools rather than model output, a cron run
with no API key still does real, verifiable work.

### Three modes, in order

| Mode | When | What a turn produces |
|------|------|----------------------|
| **build** | an open subgoal exists | a tool run plus every acceptance gate, then `done` / `progress` / `fail` |
| **plan** | the queue is empty | a new wave generated from the capability registry — only capabilities whose sources *and tests* exist, so a wave cannot manufacture a failing turn |
| **audit** | roadmap complete | one check from a fixed 8-step rotation (`md_audit`, `skills_lint`, `limits_audit`, `json_validate`, `research_digest`, `capability_docs`, `extension_check`, `improve_report`) |

The third mode exists because of a bug: the first long run reached "goal
complete" and then logged the same `idle` line for six turns while nothing at all
was verified. A quiet turn must still leave evidence. Three incidents are written
up in [`docs/incidents/`](docs/incidents/).

### The files it owns

State lives in `<repo>/.suno-helper/` — the **repository root**, not this
directory. The loop supervises repo-wide invariants (`docs/suno-limits.json`,
`docs/research/`), so its state sits above the project. `GOAL.md` and
`SUBGOALS.md` stay here because humans read them next to the code.

```
<repo>/.suno-helper/
  goal.json            the single goal (versioned)
  subgoals.json        the work queue
  meta.json            turn counter
  goal-history/NNNNN.json   snapshot every 25 turns
  params.json          tunable process parameters (bounded)
  proposals.json       self-improvement proposals + decisions
  research-questions.json
  ledger.jsonl         one line per turn (+ archived rotations)
GOAL.md                rendered /goal
SUBGOALS.md            rendered /subgoals
```

## Skills

The loop does not hard-code its methods: it retrieves them. 15 skills in
[`skills/`](skills/), in the Superpowers `SKILL.md` format:

| Skill | Used for |
|-------|----------|
| `using-superpowers` | the per-turn discipline rule |
| `find-skills` | retrieving the right skill instead of guessing |
| `goal-subgoal-loop` | the exact end-of-turn state write |
| `hyperplan` | decomposition with invariants, blast radius, rollback |
| `ultraplan` | the everyday decomposition pass |
| `ultraresearch` | source grading and citation discipline |
| `ultrawork` | implementation rules for pure, typed, tested code |
| `verify-before-done` | the gate ladder |
| `self-improvement-recursive` | bounded self-tuning + rollback |
| `dispatching-agents` | isolated-context delegation |
| `adversarial` | builder vs skeptic, decided by evidence |
| `team-pyrite` | the division roster (engineering version) |
| `teammode` | wave execution + serial merge |
| `suno-prompt-engineering` | five pillars, limits, tags, exclusions |
| `local-first-extension` | MV3, permissions, storage, privacy |

```bash
PYTHONPATH=agent python3 -m suno_helper skill list
PYTHONPATH=agent python3 -m suno_helper skill lint
PYTHONPATH=agent python3 -m suno_helper skill index
```

## The agent crew

Nine specialists with narrow missions and explicit guardrails:
`architect`, `scout`, `forge`, `sentinel`, `verifier`, `chronicler`, `tuner`,
`curator`, `scribe`.

```bash
PYTHONPATH=agent python3 -m suno_helper crew list
PYTHONPATH=agent python3 -m suno_helper crew delegate sentinel "audit the manifest permissions"
PYTHONPATH=agent python3 -m suno_helper crew debate "ship the batch parser behind a flag"
```

Hard refusals (`rm -rf /`, `git push --force`, `scrape suno.com`, …) are checked
*before* any provider call. See [`docs/provenance.md`](docs/provenance.md) for
which parts of the supplied "Team Pyrite" material were adopted, and which two
were deliberately dropped.

## Providers

Default is offline and deterministic — no key, no network:

```bash
python3 -m suno_helper loop --turns 500        # heuristic planner
SUNO_HELPER_PROVIDER=ollama  OLLAMA_MODEL=qwen3 python3 -m suno_helper loop --turns 50
SUNO_HELPER_PROVIDER=openai  OPENAI_API_KEY=… python3 -m suno_helper loop --turns 50
```

A remote failure degrades to the heuristic mid-turn instead of killing a cron
run.

## Running on a schedule

```bash
./scripts/cron-loop.sh --turns 40          # one batch
```

```cron
# every 6 hours, 40 turns each (~160/day)
0 */6 * * * cd /path/to/suno-knowledge-base/projects/suno-helper && ./scripts/cron-loop.sh --turns 40 --quiet >> ../.suno-helper/cron.log 2>&1
```

The script takes a lock (`.suno-helper/loop.lock`), so overlapping cron invocations
exit instead of interleaving state writes.

## Verify

```bash
PYTHONPATH=agent python3 -m suno_helper selftest   # 109 agent tests
PYTHONPATH=agent python3 -m suno_helper doctor     # environment + state checks
cd extension && npm test && npm run compile        # 191 extension tests
```

## Docs

- [`GOAL.md`](GOAL.md) · [`SUBGOALS.md`](SUBGOALS.md) — live state
- [`docs/soak-test.md`](docs/soak-test.md) — the 500-turn run, with numbers and caveats
- [`docs/field-guide.md`](docs/field-guide.md) — creator field guide
- [`docs/architecture.md`](docs/architecture.md) — decisions and trade-offs
- [`docs/provenance.md`](docs/provenance.md) — what came from the supplied material
- [`docs/prompt-experiments.md`](docs/prompt-experiments.md) — the one-variable test log
- [`docs/tools/`](docs/tools/) — one generated reference page per capability (source-verified)
- [`docs/incidents/`](docs/incidents/) — what broke, why, and the test that now prevents it
- [`../../docs/suno-limits.json`](../../docs/suno-limits.json) — canonical limits
- [`../../docs/research/README.md`](../../docs/research/README.md) — cited corpus
