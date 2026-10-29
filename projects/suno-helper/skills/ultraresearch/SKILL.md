---
name: ultraresearch
description: Use when a fact, limit, API shape or DOM selector is not yet verified - searches primary sources, grades them, and stores cited findings locally
tags: [research, sources, verification, internet, ultraresearch]
stages: [ultraresearch]
---

# Ultraresearch

## Goal

Replace every guess with a citation, and every citation with a *date*. Suno's
product changes; a fact without a retrieval date is a rumour.

## Loop

1. **Write the question** as a falsifiable sentence:
   "The v5 Style field accepts 1000 characters" — not "what are the limits".
2. **Search in this order** (stop as soon as a primary source answers it):
   1. the vendor's own docs / API reference,
   2. the vendor's changelog or release notes,
   3. the repo's existing `docs/` (someone may already know),
   4. community posts (Reddit, Medium, blogs) — *evidence of practice*, never
      evidence of specification,
   5. competitor tools' behaviour (usesuno, HookGenius, sunobuilder) — useful
      for feature parity, useless for limits.
3. **Grade each source** and store the grade:

   | grade | kind | trust |
   |-------|------|-------|
   | A | official docs, API schema | 0.9–1.0 |
   | B | dated third-party test with method shown | 0.7–0.85 |
   | C | community consensus, no method | 0.5–0.65 |
   | D | single blog claim, undated | ≤ 0.4 |

4. **Record it** in `docs/research/sources.json` with `retrieved_at` and
   `retrieved_by`. Never hand-type a URL you did not load.
5. **Write the answer** into the note *and* the canonical file it belongs to
   (`docs/suno-limits.json` for numbers).
6. **Say what is still unknown.** An honest gap beats a confident invention.

## What "search the internet" means here

The agent's fetcher only talks to hosts it is allowed to talk to, and it is
off unless `--allow-network` is passed. When network is unavailable:

- read the cached corpus (still valid research),
- mark the question `parked` with the reason,
- never fabricate a source row.

That asymmetry is deliberate: a cached citation is auditable, an invented one is
poison that every later turn will trust.

## Query patterns that work

```
"suno v5 style prompt character limit 2026"
"suno api custom_generate schema lyrics title limit"
"chrome extension manifest v3 storage.local quota"
"wxt content script inject react component 2026"
"usesuno prompt builder five pillars"
```

## Anti-patterns

- Searching once and generalising to every model version.
- Reading an SEO blog as specification.
- Copying a competitor's limit table without checking a date on it.
- Recommending a scraping approach against Suno — the repo forbids it
  (`cli-skillset/AGENTS.md`).
