# /subgoals

_turn 530 · 16 subgoals_

## `agent-app-is-documented-and-gated` — Agent app is documented and gated

- **status:** done · **priority:** 5 · **weight:** 2
- **attempts/failures:** 1/0 · **last turn:** 501
- **description:** The dashboard has a reference page, the registry entry passes its symbol gate, and the doc index links to it.
- **stages:** ultraplan → ultrawork → verify
- **action:** `capability_docs` {'only': ['agent-app']}
- **gates:** capability_docs, md_audit
- **last evidence:** turn 501: capability_docs: capability docs verified: 1 page(s), 0 written; gate capability_docs: pass capability docs verified: 1 page(s), 0 written; gate md_audit: pass markdown clean: 75 files
- **artifacts:** projects/docs/tools/agent-app.md

## `agent-app-tests-are-green` — Agent app tests are green

- **status:** done · **priority:** 5 · **weight:** 2
- **attempts/failures:** 1/0 · **last turn:** 502
- **description:** 54 server tests: routes, guards, SSE ordering, shutdown, static wiring.
- **stages:** verify
- **action:** `agent_tests`
- **gates:** agent_tests
- **last evidence:** turn 502: agent_tests: agent tests green: 168 tests; gate agent_tests: pass agent tests green: 168 tests
- **artifacts:** agent/tests

## `canonical-suno-limits-table` — Canonical Suno limits table

- **status:** done · **priority:** 5 · **weight:** 2
- **attempts/failures:** 1/0 · **last turn:** 1
- **description:** One machine-readable source of truth for per-model character limits (v4: style 200 / lyrics 3000; v4.5-v5.5: style 1000 / lyrics 5000; simple prompt 500; title 100) so every tool and doc reads the same numbers.
- **stages:** ultraresearch → ultrawork → verify
- **action:** `limits_audit`
- **gates:** limits_audit, json_validate
- **last evidence:** turn 1: limits_audit: limits ok: v5 style=1000 lyrics=5000, 47 docs scanned; gate limits_audit: pass limits ok: v5 style=1000 lyrics=5000, 47 docs scanned; gate json_validate: pass 5 json files parsed
- **artifacts:** docs/suno-limits.json

## `extension-core-library` — Extension core library

- **status:** done · **priority:** 5 · **weight:** 2.5
- **attempts/failures:** 1/0 · **last turn:** 2
- **description:** Pure TypeScript modules for style cleaning, five-pillar building, tag normalisation, lyric diffing, duration estimation, exclude lists, CSV and storage — all client-side, all unit tested.
- **stages:** ultraplan → ultrawork → verify
- **action:** `extension_check`
- **gates:** extension_check
- **last evidence:** turn 2: extension_check: extension compile+tests green; gate extension_check: pass extension compile+tests green
- **artifacts:** projects/suno-helper/extension

## `app-roadmap-closed-end-to-end` — App roadmap closed end to end

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 1/0 · **last turn:** 504
- **description:** Every capability the app added has a generated page, a registry entry and a test that reads its source symbols.
- **stages:** ultrawork → verify
- **action:** `capability_docs`
- **gates:** capability_docs, skills_lint
- **last evidence:** turn 504: capability_docs: capability docs verified: 28 page(s), 0 written; gate capability_docs: pass capability docs verified: 28 page(s), 0 written; gate skills_lint: pass 23 skills valid
- **artifacts:** projects/docs/tools/clean-style.md

## `batch-link-parser-and-csv-export` — Batch link parser and CSV export

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 1/0 · **last turn:** 5
- **description:** Paste public Suno links, extract metadata, export CSV/JSON client-side.
- **stages:** ultraplan → ultrawork → verify
- **action:** `extension_check`
- **gates:** extension_check
- **last evidence:** turn 5: extension_check: extension compile+tests green; gate extension_check: pass extension compile+tests green
- **artifacts:** projects/suno-helper/extension

## `docs-cite-the-canonical-limits` — Docs cite the canonical limits

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 1/0 · **last turn:** 3
- **depends on:** canonical-suno-limits-table
- **description:** All prompt guides reference docs/suno-limits.json numbers, no drift.
- **stages:** ultrawork → verify
- **action:** `md_audit` {'paths': ['docs', 'projects/suno-helper/docs']}
- **gates:** md_audit
- **last evidence:** turn 3: md_audit: markdown clean: 46 files; gate md_audit: pass markdown clean: 74 files
- **artifacts:** docs/README.md

## `skill-library-for-the-loop` — Skill library for the loop

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 1/0 · **last turn:** 4
- **description:** Superpowers-format SKILL.md files that the loop can find and load.
- **stages:** ultraplan → ultrawork → verify
- **action:** `skills_lint`
- **gates:** skills_lint
- **last evidence:** turn 4: skills_lint: 23 skills valid; gate skills_lint: pass 23 skills valid
- **artifacts:** skills/INDEX.md

## `skipped-gates-are-visible` — Skipped gates are visible

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 1/0 · **last turn:** 503
- **description:** A gate that cannot run reports SKIPPED and the ledger records it, so a green run over missing dependencies cannot pose as verification.
- **stages:** ultraplan → verify
- **action:** `agent_tests`
- **gates:** agent_tests, json_validate
- **last evidence:** turn 503: agent_tests: agent tests green: 168 tests; gate agent_tests: pass agent tests green: 168 tests; gate json_validate: pass 5 json files parsed
- **artifacts:** agent/tests

## `creator-field-guide` — Creator field guide

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 1/0 · **last turn:** 7
- **description:** Explain the five pillars, limit table and experiment workflow for new users.
- **stages:** ultrawork → verify
- **action:** `md_audit` {'paths': ['projects/suno-helper/docs']}
- **gates:** md_audit
- **last evidence:** turn 7: md_audit: markdown clean: 40 files; gate md_audit: pass markdown clean: 74 files
- **artifacts:** projects/suno-helper/docs/README.md

## `loop-self-improvement-ledger` — Loop self-improvement ledger

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 1/0 · **last turn:** 9
- **description:** Every turn scores itself; bad stretches produce gated process proposals with rollback snapshots.
- **stages:** reflect → improve
- **action:** `improve_report`
- **gates:** improve_report
- **last evidence:** turn 9: improve_report: loop report written (8 turns sampled); gate improve_report: pass loop report written (8 turns sampled)
- **artifacts:** docs/loop-report.md

## `repeatable-prompt-tester-log` — Repeatable prompt tester log

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 1/0 · **last turn:** 6
- **description:** One-variable experiment log with hypothesis, evidence and decision per run.
- **stages:** ultraplan → ultrawork
- **action:** `md_audit` {'paths': ['projects/suno-helper/docs']}
- **gates:** md_audit
- **last evidence:** turn 6: md_audit: markdown clean: 40 files; gate md_audit: pass markdown clean: 74 files
- **artifacts:** projects/suno-helper/docs/README.md

## `research-digest-maintained` — Research digest maintained

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 1/0 · **last turn:** 8
- **description:** Keep docs/research/ current: Suno limits, usesuno tool inventory, HookGenius and competitor patterns, extension security notes.
- **stages:** ultraresearch
- **action:** `research_digest`
- **gates:** research_digest
- **last evidence:** turn 8: research_digest: research digest: 16 sources, 0 open questions, 0 stale; gate research_digest: pass research digest: 16 sources, 0 open questions, 0 stale
- **artifacts:** docs/research/README.md

## `local-model-hand-off` — Local model hand-off

- **status:** done · **priority:** 2 · **weight:** 0.8
- **attempts/failures:** 1/0 · **last turn:** 10
- **description:** Document an optional Ollama hand-off so prompts can be drafted offline.
- **stages:** ultraresearch → ultrawork
- **action:** `research_digest`
- **gates:** research_digest
- **last evidence:** turn 10: research_digest: research digest: 16 sources, 0 open questions, 0 stale; gate research_digest: pass research digest: 16 sources, 0 open questions, 0 stale
- **artifacts:** docs/research/README.md

## `loop-observability-report` — Loop observability report

- **status:** done · **priority:** 2 · **weight:** 0.8
- **attempts/failures:** 1/0 · **last turn:** 11
- **description:** Keep docs/loop-report.md generated from the ledger every wave.
- **stages:** reflect → improve
- **action:** `improve_report`
- **gates:** improve_report
- **last evidence:** turn 11: improve_report: loop report written (10 turns sampled); gate improve_report: pass loop report written (10 turns sampled)
- **artifacts:** docs/loop-report.md

## `prompt-library-search` — Prompt library search

- **status:** done · **priority:** 2 · **weight:** 0.8
- **attempts/failures:** 1/0 · **last turn:** 12
- **description:** Client-side fuzzy search over saved prompts with keyboard navigation.
- **stages:** ultraplan → ultrawork
- **action:** `extension_check`
- **gates:** extension_check
- **last evidence:** turn 12: extension_check: extension compile+tests green; gate extension_check: pass extension compile+tests green
- **artifacts:** projects/suno-helper/extension
