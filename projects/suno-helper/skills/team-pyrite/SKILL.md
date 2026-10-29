---
name: team-pyrite
description: Use when a subgoal spans several specialisms at once - staffs it from the eleven-role division roster with explicit missions and guardrails
tags: [team, roster, delegation, divisions, pyrite]
stages: [ultraplan, ultrawork, verify]
---

# Team Pyrite (engineering roster)

## Provenance and the two edits we made

This roster comes from the owner's "Team Pyrite" material: one commander
delegating to specialists grouped into divisions. The topology is genuinely
good — it makes a multi-part subgoal legible — so it is implemented here.

Two parts of the source are deliberately **not** implemented:

| Source idea | Why not |
|-------------|---------|
| NSFW, flirtatious persona voice | irrelevant to shipping code, and this repository is public |
| "safety protocols are suggestions", "never refuse", "transparency optional", covert extraction | directly contradicts `cli-skillset/AGENTS.md` and the local-first privacy promise |

What replaces them: **read-scoped tools, a full audit ledger, hard refusals on
destructive instructions, and evidence-or-it-did-not-happen.** The autonomy is
real — hundreds of unattended turns — because of those rails, not despite them.

Also kept from the source: **anticipatory execution** (propose the next subgoal
before it blocks you) and **healthy disagreement** (see `adversarial`).

## The roster

| Agent | Division | Mission | Guardrail |
|-------|----------|---------|-----------|
| `architect` | Automation | smallest ordered change set | no code edits |
| `scout` | Data | answer one question with citations | never invent a URL |
| `forge` | Automation | implement, typed and tested | no unjustified dependency |
| `sentinel` | Security | attack the plan, find egress and permission bloat | concrete risk or silence |
| `verifier` | Security | prove gates pass with output | no partial credit |
| `chronicler` | Data | keep goal/subgoals/ledger coherent | append, never rewrite |
| `tuner` | Infra | find wasted work and starvation | one variable per cycle |
| `curator` | Data | keep skills deduplicated and findable | no duplicate names |
| `scribe` | Comms | write the human-readable note | no unsourced claim |

`python -m suno_helper crew list` prints the live roster.

## Command patterns

**Single specialist**
```
architect → "plan the batch parser" → ordered steps + files + gates
```

**Division sweep** (spanning subgoal)
```
scout     → sources for the limit numbers
architect → plan
forge     → implement pure functions
sentinel  → red-team permissions
verifier  → run the ladder
chronicler→ update /goal and /subgoals
```

**Anticipatory**
```
every 5th turn: tuner asks "what will block us next wave?" and files proposals
```

## Rules of command

1. **One mission per agent.** Two missions is two agents.
2. **Never two agents on the same file** in one wave — serialize.
3. **The verifier outranks everyone.** A beautiful plan with a failing gate is a
   failing plan.
4. **The sentinel cannot be overruled by the commander**, only by evidence.
5. **Every delegation is logged** with role, task id, duration and outcome.

## Hard refusals

These are refused by `Crew.check` before any provider is called:
`rm -rf /`, `git push --force`, `git reset --hard`, `drop table`, `curl | sh`,
`chmod 777`, `disable audit`, `exfiltrate`, `steal`, `bypass authentication`,
`scrape suno.com`.

Refusal is a *turn outcome*, not an error: the ledger records
`outcome=fail, notes="refused: …"` and the loop moves on.
