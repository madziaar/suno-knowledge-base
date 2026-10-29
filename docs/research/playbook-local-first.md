# The Local-First Playbook — summary with citations

Source: *"The Local-First Playbook: Building a Privacy-Centric AI Music Companion
from usesuno.com Patterns"* (supplied as a PDF, 16 pages). Summarised here so the
claims the architecture rests on stay checkable inside the repository.

## The five pillars

1. **Client-side processing.** Every text transform (prompt builder, tag
   normaliser, lyric diff) runs in the user's tab. The playbook's example is
   usesuno's style cleaner, which never calls a server.
2. **Robust client storage.** `chrome.storage.local` over `localStorage`:
   asynchronous, native objects/arrays, ~10 MB quota, `onChanged` events,
   survives browsing-data clears. `localStorage` is page-scoped, string-only,
   ~5 MB, synchronous.
3. **Clear operational boundary.** Inspect/download tools necessarily fetch a
   public URL; text tools never do. The boundary is documented to users rather
   than hidden.
4. **Responsible permissions.** Request the minimum. Broad permissions erode
   trust — the playbook cites critiques of a third-party "Suno Manager"
   extension that requested wide access.
5. **On-device AI.** The end state: a small local model (e.g. via Ollama or
   WebGPU) so even generation guidance stays private.

## Architecture claims used here

- MV3 split: `manifest.json` + content scripts (isolated world, DOM only) +
  background service worker (event-driven, storage owner) + popup UI.
- `chrome.storage.onChanged` is the correct way to keep surfaces in sync;
  polling is not.
- Batch storage writes; debounce search input; read the whole library once and
  filter client-side.
- DOM patching (intercepting the site's JavaScript) is the most fragile
  integration and should be avoided for anything but enthusiast tools.
- Reverse-engineered APIs (`gcui-art/suno-api`) work but are fragile and
  legally uncertain; the playbook itself advises caution. **This project goes
  further and refuses them.**

## Roadmap adopted

| Phase | Playbook | Here |
|-------|----------|------|
| 1 | Prompt manager, five-pillar builder, tag normaliser + cleaner, basic profile tool | Extension: builder, cleaner, normaliser, diff, estimator, exclude builder, library |
| 2 | Local LLM, lyric/prompt assistant, repeatable testing planner, analytics | `suno-helper` agent loop + `docs/prompt-experiments.md`; local provider (Ollama) supported |
| 3 | Stable API integrations, pro tier, other platforms, hybrid workflows | Deliberately out of scope until the local-first core is finished |

## Where this repository disagrees

The playbook suggests a profile downloader "reads a public URL and saves media
locally". That is implemented as **metadata parse only** — no media scraping —
because `cli-skillset/AGENTS.md` forbids scrapers that attack Suno and because
downloading another creator's audio is a rights question, not an engineering one.
