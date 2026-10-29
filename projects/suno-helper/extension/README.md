# Suno Helper — extension

A Manifest V3 browser extension that puts the prompt-engineering toolkit next to
the Suno create page. **Everything is computed on your machine.** There is no
backend, no account, and no telemetry.

## What it does

| Tool | Field | What it does |
|------|-------|--------------|
| Prompt builder | Style | Five pillars (genre, instrumentation, mood, vocal, production) with lock + re-roll |
| Style cleaner | Style | Removes hype words, duplicate tags and stray brackets, then fits the model budget |
| Lyrics normaliser | Lyrics | Maps `[主歌]`, `[【サビ】]`, `[Estribillo]`, `[Припев]`, `[Chorus x2]` to canonical tags |
| Lyric diff | Lyrics | Line-level diff with per-section change detection |
| Duration estimator | Lyrics | Syllable-based length estimate per section, with warnings |
| Exclude builder | Exclude Styles | Category picker → clean comma-separated exclusion list |
| Library | — | Local prompt library, search, one-click fill into the Suno tab |
| Batch export | — | CSV/JSON export of metadata (client-side) |

## Permissions

```json
"permissions": ["storage"],
"host_permissions": ["https://suno.com/*", "https://www.suno.com/*"]
```

That is the whole list. If a feature seems to need `tabs`, `cookies` or
`<all_urls>`, the feature is wrong, not the budget.

## Develop

```bash
npm install
npm run dev        # wxt dev server
npm run compile    # tsc --noEmit
npm test           # vitest (pure functions only, no browser needed)
npm run build      # production bundle in .output/
```

`npm test` runs without a browser: every module in `src/lib` is a pure function
with no DOM and no `chrome` global. That is deliberate — it is what makes the
local-first claim testable.

## Architecture

```
entrypoints/popup      React UI (builder / tools / library)
entrypoints/content    injects one button, fills fields, captures values
entrypoints/background single writer of chrome.storage, message router
src/lib                pure functions — the actual product
src/selectors.ts       every DOM selector in one place (one-file fixes)
src/messages.ts        typed message protocol
```

## Privacy contract

1. No text you type is ever sent anywhere. The only `fetch` calls in the
   codebase are for public URLs you paste into the batch tool, and they are
   host-allowlisted.
2. No analytics, no crash reporting, no remote config, no remote code.
3. `chrome.storage.local` only. Export your library at any time; delete it with
   one button.

## Limits

Numbers come from [`docs/suno-limits.json`](../../../docs/suno-limits.json); the
typed mirror in `src/lib/limits.ts` is asserted against it in
`limits.test.ts`, so drift fails CI rather than a user's generation.
