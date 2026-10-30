# The agent app

```bash
cd projects/suno-helper
PYTHONPATH=agent python3 -m suno_helper app
# → suno helper app  ·  http://127.0.0.1:8787/
```

A local dashboard over the loop: the goal, the subgoals, the ledger, the
capability registry, the skills, and a **live** view of a run as each turn
happens. Standard library only — no FastAPI, no Flask, no npm, no CDN. It starts
on a machine with no virtualenv and no network, because the same machine is
supposed to be able to run the loop offline.

## What you can do without a terminal

| Panel | What it does |
|---|---|
| **Dashboard** | Goal progress, subgoal/capability counts, success rate. Edit the goal — saving writes `/goal` on disk. |
| **Live turns** | `Run N` streams every turn over SSE: phase, subgoal, tool, outcome, and the progress bar moving. `Stop` interrupts mid-run. |
| **Subgoals** | The full table with acceptance gates; add one, or mark one complete. |
| **Ledger** | The last N turns, failures highlighted. |
| **Capabilities** | All 28, each marked `ready` when its source files, tests and symbols are all present. |
| **Gates** | Run any audit (`md_audit`, `limits_audit`, `extension_check`, …) and read the JSON result. |
| **Skills & crew** | The 23 discoverable skills and the delegation roster. |

Keyboard: `1`–`6` switch panels, `r` runs.

## Routes

Reads need nothing. Writes need the `X-Suno-Helper: 1` header, and a token too
when the bind is not loopback.

```
GET  /                     the dashboard (static, offline)
GET  /api/health           version, root, run state, what this bind allows
GET  /api/state            goal + subgoals + ledger + capabilities + skills + crew
GET  /api/subgoals         the subgoal table
GET  /api/capabilities     28 entries with readiness
GET  /api/skills           discovered SKILL.md files
GET  /api/crew             the delegation roster
GET  /api/tools            every gate the toolbox exposes
GET  /api/ledger?limit=N   recent turns
GET  /api/export           goal + subgoals + capabilities as one bundle
GET  /api/stream?turns=N   SSE: start → turn × N → done
POST /api/goal             {title, statement, metric, target}
POST /api/subgoal          {title, description, priority, weight, action, acceptance}
POST /api/subgoal/complete {id, evidence}
POST /api/gate             {tool, args}
POST /api/turn             {turns}  (synchronous, bounded at 200)
POST /api/stop             interrupt a running stream
```

## The three guards

**1. The bind decides the token.**

```bash
suno_helper app                          # 127.0.0.1 — no token, writes open
suno_helper app --host 0.0.0.0           # token auto-generated, printed once
suno_helper app --host 0.0.0.0 --trusted-proxy   # no token, CSRF header still required
suno_helper app --readonly               # every read route, no write route
```

**2. CSRF, always.** Cross-origin JavaScript cannot set a custom header without
a preflight, and this server answers no preflights with a permissive CORS
policy. So `X-Suno-Helper: 1` is a real check even when there is no token — it
stops a page you have open elsewhere from POSTing to your localhost.

**3. One runner.** The engine has a single mutable state. A second concurrent
run is refused rather than interleaved, and `.suno-helper/loop.lock` keeps the
CLI and the app from both driving it.

## Why a server and not six CLI commands

The loop already writes everything to disk; a terminal shows it one `cat` at a
time. The thing a *500-turn run* needs is not more information, it is the
**shape** of the run while it happens: which phase dominates, which subgoal keeps
failing, whether progress is moving. That is a chart, and a chart needs a
surface.

## Honest limits

- **No authentication beyond the token.** This is a local tool. Do not put it on
  a public interface; `--trusted-proxy` is for a reverse proxy you control, and
  the warning it prints says exactly that.
- **No history beyond the ledger.** The dashboard renders the current state; it
  does not draw charts over time. The ledger JSONL has the data if you want it.
- **Single user.** Two browsers hitting it are two clients of one engine, which
  is fine; two *runs* are refused.

## Tests

`agent/tests/test_app.py` — 54 tests, real sockets:

- HTTP verbs and status codes against a live server on port 0
- token / CSRF / read-only / trusted-proxy matrices
- SSE ordering (`start` → N × `turn` → `done`)
- shutdown of a server that was never started (would hang otherwise)
- static wiring: every id `app.js` uses exists in the HTML, every nav item has a
  panel, no inline handlers, no external URLs
