# /subgoals

_turn 518 · 20 subgoals_

## `canonical-suno-limits-table` — Canonical Suno limits table

- **status:** done · **priority:** 5 · **weight:** 2
- **attempts/failures:** 1/0 · **last turn:** 2
- **description:** One machine-readable source of truth for per-model character limits (v4: style 200 / lyrics 3000; v4.5-v5.5: style 1000 / lyrics 5000; simple prompt 500; title 100) so every tool and doc reads the same numbers.
- **stages:** ultraresearch → ultrawork → verify
- **action:** `limits_audit`
- **gates:** limits_audit, json_validate
- **last evidence:** turn 2: limits_audit: limits ok: v5 style=1000 lyrics=5000, 9 docs scanned; gate limits_audit: pass limits ok: v5 style=1000 lyrics=5000, 9 docs scanned; gate json_validate: pass 5 json files parsed
- **artifacts:** docs/suno-limits.json

## `docs-cite-the-canonical-limits-apply-the-smalles` — Docs cite the canonical limits: apply the smallest fix

- **status:** done · **priority:** 5 · **weight:** 0.5
- **attempts/failures:** 1/0 · **last turn:** 86
- **depends on:** docs-cite-the-canonical-limits-isolate-the-faili
- **description:** Implementation sub-step created by the self-improvement loop.
- **stages:** ultrawork → verify
- **action:** `json_validate`
- **gates:** json_validate
- **last evidence:** turn 86: json_validate: 5 json files parsed; gate json_validate: pass 5 json files parsed

## `docs-cite-the-canonical-limits-isolate-the-faili` — Docs cite the canonical limits: isolate the failing evidence

- **status:** done · **priority:** 5 · **weight:** 0.5
- **attempts/failures:** 55/0 · **last turn:** 85
- **depends on:** docs-cite-the-canonical-limits-isolate-the-faili-2, docs-cite-the-canonical-limits-isolate-the-faili-3
- **description:** Narrow audit sub-step created by the self-improvement loop.
- **stages:** verify
- **action:** `md_audit` {'paths': ['projects/suno-helper']}
- **gates:** md_audit
- **last evidence:** turn 85: md_audit: markdown clean: 47 files; gate md_audit: pass markdown clean: 53 files
- **artifacts:** projects/suno-helper/GOAL.md

## `docs-cite-the-canonical-limits-isolate-the-faili-2` — Docs cite the canonical limits: isolate the failing evidence: isolate the failing evidence

- **status:** done · **priority:** 5 · **weight:** 0.5
- **attempts/failures:** 1/0 · **last turn:** 15
- **description:** Narrow audit sub-step created automatically after repeated failure.
- **stages:** verify
- **action:** `md_audit` {'paths': ['docs']}
- **gates:** md_audit
- **last evidence:** turn 15: md_audit: markdown clean: 6 files; gate md_audit: fail 186 markdown issue(s) in 400 files (0 auto-fixed)
- **artifacts:** docs/README.md

## `docs-cite-the-canonical-limits-isolate-the-faili-3` — Docs cite the canonical limits: isolate the failing evidence: apply the smallest fix

- **status:** done · **priority:** 5 · **weight:** 0.5
- **attempts/failures:** 1/0 · **last turn:** 16
- **depends on:** docs-cite-the-canonical-limits-isolate-the-faili-2
- **description:** Implementation sub-step created automatically after repeated failure.
- **stages:** ultrawork → verify
- **action:** `json_validate`
- **gates:** json_validate
- **last evidence:** turn 16: json_validate: 5 json files parsed; gate json_validate: pass 5 json files parsed

## `extension-core-library` — Extension core library

- **status:** done · **priority:** 5 · **weight:** 2.5
- **attempts/failures:** 1/0 · **last turn:** 1
- **description:** Pure TypeScript modules for style cleaning, five-pillar building, tag normalisation, lyric diffing, duration estimation, exclude lists, CSV and storage — all client-side, all unit tested.
- **stages:** ultraplan → ultrawork → verify
- **action:** `extension_check`
- **gates:** extension_check
- **last evidence:** turn 1: extension_check: extension compile+tests green; gate extension_check: pass extension compile+tests green
- **artifacts:** projects/suno-helper/extension

## `batch-link-parser-and-csv-export` — Batch link parser and CSV export

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 1/0 · **last turn:** 8
- **description:** Paste public Suno links, extract metadata, export CSV/JSON client-side.
- **stages:** ultraplan → ultrawork → verify
- **action:** `extension_check`
- **gates:** extension_check
- **last evidence:** turn 8: extension_check: extension compile+tests green; gate extension_check: pass extension compile+tests green
- **artifacts:** projects/suno-helper/extension

## `docs-cite-the-canonical-limits` — Docs cite the canonical limits

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 6/0 · **last turn:** 87
- **depends on:** canonical-suno-limits-table, docs-cite-the-canonical-limits-apply-the-smalles, docs-cite-the-canonical-limits-isolate-the-faili
- **description:** All prompt guides reference docs/suno-limits.json numbers, no drift.
- **stages:** ultrawork → verify
- **action:** `md_audit` {'paths': ['docs', 'projects/suno-helper/docs']}
- **gates:** md_audit
- **last evidence:** turn 87: md_audit: markdown clean: 26 files; gate md_audit: pass markdown clean: 53 files
- **artifacts:** docs/README.md

## `repeatable-prompt-tester-log-apply-the-smallest-` — Repeatable prompt tester log: apply the smallest fix

- **status:** done · **priority:** 4 · **weight:** 0.5
- **attempts/failures:** 1/0 · **last turn:** 22
- **depends on:** repeatable-prompt-tester-log-isolate-the-failing
- **description:** Implementation sub-step created automatically after repeated failure.
- **stages:** ultrawork → verify
- **action:** `json_validate`
- **gates:** json_validate
- **last evidence:** turn 22: json_validate: 5 json files parsed; gate json_validate: pass 5 json files parsed

## `repeatable-prompt-tester-log-isolate-the-failing` — Repeatable prompt tester log: isolate the failing evidence

- **status:** done · **priority:** 4 · **weight:** 0.5
- **attempts/failures:** 1/0 · **last turn:** 18
- **description:** Narrow audit sub-step created automatically after repeated failure.
- **stages:** verify
- **action:** `md_audit` {'paths': ['docs']}
- **gates:** md_audit
- **last evidence:** turn 18: md_audit: markdown clean: 6 files; gate md_audit: fail 186 markdown issue(s) in 400 files (0 auto-fixed)
- **artifacts:** docs/README.md

## `skill-library-for-the-loop` — Skill library for the loop

- **status:** done · **priority:** 4 · **weight:** 1.5
- **attempts/failures:** 1/0 · **last turn:** 3
- **description:** Superpowers-format SKILL.md files that the loop can find and load.
- **stages:** ultraplan → ultrawork → verify
- **action:** `skills_lint`
- **gates:** skills_lint
- **last evidence:** turn 3: skills_lint: 22 skills valid; gate skills_lint: pass 22 skills valid
- **artifacts:** skills/INDEX.md

## `creator-field-guide` — Creator field guide

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 1/0 · **last turn:** 74
- **description:** Explain the five pillars, limit table and experiment workflow for new users.
- **stages:** ultrawork → verify
- **action:** `md_audit` {'paths': ['projects/suno-helper/docs']}
- **gates:** md_audit
- **last evidence:** turn 74: md_audit: markdown clean: 6 files; gate md_audit: fail 186 markdown issue(s) in 400 files (0 auto-fixed)
- **artifacts:** projects/suno-helper/docs/README.md

## `loop-self-improvement-ledger` — Loop self-improvement ledger

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 1/0 · **last turn:** 7
- **description:** Every turn scores itself; bad stretches produce gated process proposals with rollback snapshots.
- **stages:** reflect → improve
- **action:** `improve_report`
- **gates:** improve_report
- **last evidence:** turn 7: improve_report: loop report written (6 turns sampled); gate improve_report: pass loop report written (6 turns sampled)
- **artifacts:** docs/loop-report.md

## `repeatable-prompt-tester-log` — Repeatable prompt tester log

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 3/2 · **last turn:** 23
- **depends on:** repeatable-prompt-tester-log-apply-the-smallest-, repeatable-prompt-tester-log-isolate-the-failing
- **description:** One-variable experiment log with hypothesis, evidence and decision per run.
- **stages:** ultraplan → ultrawork
- **action:** `md_audit` {'paths': ['projects/suno-helper/docs']}
- **gates:** md_audit
- **last evidence:** turn 23: md_audit: markdown clean: 5 files; gate md_audit: fail 186 markdown issue(s) in 400 files (0 auto-fixed)
- **artifacts:** projects/suno-helper/docs/README.md

## `research-digest-maintained` — Research digest maintained

- **status:** done · **priority:** 3 · **weight:** 1
- **attempts/failures:** 1/0 · **last turn:** 20
- **description:** Keep docs/research/ current: Suno limits, usesuno tool inventory, HookGenius and competitor patterns, extension security notes.
- **stages:** ultraresearch
- **action:** `research_digest`
- **gates:** research_digest
- **last evidence:** turn 20: research_digest: research digest: 16 sources, 0 open questions, 0 stale; gate research_digest: pass research digest: 16 sources, 0 open questions, 0 stale
- **artifacts:** docs/research/README.md

## `tool-reference-batch-fetch-planner` — Tool reference: Batch Fetch Planner

- **status:** done · **priority:** 3 · **weight:** 0.6
- **attempts/failures:** 1/0 · **last turn:** 507
- **description:** Generate and verify the reference page for batch-planner (phase-4).
- **stages:** ultraplan → ultrawork → verify
- **action:** `capability_docs` {'only': ['batch-planner']}
- **gates:** capability_docs
- **last evidence:** turn 507: capability_docs: capability docs verified: 1 page(s), 1 written; gate capability_docs: pass capability docs verified: 1 page(s), 0 written
- **artifacts:** projects/docs/tools/batch-planner.md

## `tool-reference-batch-link-parser` — Tool reference: Batch Link Parser

- **status:** done · **priority:** 3 · **weight:** 0.6
- **attempts/failures:** 1/0 · **last turn:** 506
- **description:** Generate and verify the reference page for link-parser (phase-4).
- **stages:** ultraplan → ultrawork → verify
- **action:** `capability_docs` {'only': ['link-parser']}
- **gates:** capability_docs
- **last evidence:** turn 506: capability_docs: capability docs verified: 1 page(s), 1 written; gate capability_docs: pass capability docs verified: 1 page(s), 0 written
- **artifacts:** projects/docs/tools/link-parser.md

## `local-model-hand-off` — Local model hand-off

- **status:** done · **priority:** 2 · **weight:** 0.8
- **attempts/failures:** 1/0 · **last turn:** 78
- **description:** Document an optional Ollama hand-off so prompts can be drafted offline.
- **stages:** ultraresearch → ultrawork
- **action:** `research_digest`
- **gates:** research_digest
- **last evidence:** turn 78: research_digest: research digest: 16 sources, 0 open questions, 0 stale; gate research_digest: pass research digest: 16 sources, 0 open questions, 0 stale
- **artifacts:** docs/research/README.md

## `loop-observability-report` — Loop observability report

- **status:** done · **priority:** 2 · **weight:** 0.8
- **attempts/failures:** 1/0 · **last turn:** 75
- **description:** Keep docs/loop-report.md generated from the ledger every wave.
- **stages:** reflect → improve
- **action:** `improve_report`
- **gates:** improve_report
- **last evidence:** turn 75: improve_report: loop report written (74 turns sampled); gate improve_report: pass loop report written (74 turns sampled)
- **artifacts:** docs/loop-report.md

## `prompt-library-search` — Prompt library search

- **status:** done · **priority:** 2 · **weight:** 0.8
- **attempts/failures:** 1/0 · **last turn:** 77
- **description:** Client-side fuzzy search over saved prompts with keyboard navigation.
- **stages:** ultraplan → ultrawork
- **action:** `extension_check`
- **gates:** extension_check
- **last evidence:** turn 77: extension_check: extension compile+tests green; gate extension_check: pass extension compile+tests green
- **artifacts:** projects/suno-helper/extension
