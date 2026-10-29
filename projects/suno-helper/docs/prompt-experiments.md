# Prompt experiments — one variable at a time

Log every test. A remembered result is a rumour; a logged one is data.

## Template

```markdown
### EXP-000 — <short question>
- **Date:** YYYY-MM-DD
- **Question:** Does <one change> improve <one observable>?
- **Baseline:** `styles=…` / `lyrics=…` / model=v5.5 / seed=…
- **Change (only one):** …
- **Held constant:** everything else, byte-identical
- **Result:** …
- **Decision:** keep / revert / narrow
- **Next question:** …
```

## Rules

1. One variable per experiment. Two changes and you learn nothing.
2. Quote the exact Style string. "A darker vibe" is not reproducible.
3. The observable must be checkable: clarity of a lyric line, whether a section
   survived, harshness of a snare, not "better".
4. Record the model version — v4 and v5 respond differently to the same string.
5. A failed experiment is a result. Write it down; do not retry it next week.

## Log

### EXP-000 — does removing hype words change anything?
- **Date:** 2026-10-29
- **Question:** does stripping `masterpiece, best quality` from a Style string
  change the output at all?
- **Baseline:** `dark synthwave, arpeggiated Moog bass, melancholic, breathy
  female vocal, tape saturation` (control)
- **Change (only one):** prepend `masterpiece, best quality,`
- **Held constant:** lyrics, model v5.5, all other tags, order of the rest
- **Result:** pending — needs a generation run on the account
- **Decision:** pending
- **Next question:** does front-loading the vocal pillar ahead of instrumentation
  change perceived vocal presence?

> The loop cannot run generations, so experiments stay `pending` until a human
> fills them in. That is deliberate: the agent prepares the test, the human owns
> the judgement.
