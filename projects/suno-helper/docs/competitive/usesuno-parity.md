# Parity check: usesuno.com vs. this extension

`https://usesuno.com/` — a free, no-account, in-browser Suno toolkit with 16
tools plus a Chrome extension ("Suno Prompt Manager"). Recorded here as a
benchmark, not as a spec: some of what it does we should decline to do.

Last reviewed **2026-10-30**. Their tool list is the thing that changes; our
column is derived from the capability registry, so it moves with the code.

**Update, same day:** the gaps below were closed. See *What shipped* at the end;
the table is kept as written so the delta stays visible.

## Side by side

| Their tool | Us | Notes |
|---|---|---|
| Prompt Builder (genre / instruments / mood / vocal / production) | ✅ `prompt-builder` | Same five dimensions; ours writes a tagged style string, theirs fills a form |
| Style string cleaner | ✅ `clean-style` | |
| Exclude styles generator | ✅ `exclude-styles` | Capped at 1,000 chars, matching `docs/suno-limits.json` |
| Random style generator (lock & re-roll) | ✅ `random-style` | Seeded, so a roll is reproducible; per-pillar locks |
| Lyrics text diff | ✅ `lyric-diff` | |
| Structure tag helper | ✅ `structure-tags` | Six templates, repeats each chorus separately |
| Lyrics tag normalizer (CJK/ES/FR → `[Verse]`) | ✅ `tag-normalizer` | |
| **Lyrics timestamping (LRC / SRT / VTT + ID3-synced MP3)** | ✅ `lyrics-timestamps` | LRC/SRT/VTT, estimated cues labelled as such, tap-timing, `.lrc` import. No ID3 tagging |
| **MV Studio (in-browser lyric video export)** | ✅ `lyric-video` | Canvas + MediaRecorder on a full page; silent unless you supply an audio file |
| Duration estimator | ✅ `duration-estimator` | |
| **Suno downloader (audio / video / cover)** | ⚠️ `media-save` | Single song page, one click, via `chrome.downloads`. No bulk path exists |
| **Playlist downloader (ZIP)** | ⚠️ | The page is client-rendered, so we say so and point at batch capture. ZIP writer exists (`zip-export`) but is not fed by a scraper |
| **Profile downloader & analyzer** | ✅ analyzer, ⚠️ downloader | `library-analytics` works on captures; no profile scraping |
| **Cover art downloader** | ⚠️ | `findMediaTargets` returns cover URLs; the content button saves audio only so far |
| **Song inspector** (title / creator / tags / duration / lyrics from a public link) | ✅ `song-capture` | We parse OG + JSON-LD from public pages; they render it richer |
| Batch link parser → CSV / JSON | ✅ `link-parser` + `csv-export` | Ours also queues the batch in a background worker |
| Style prompt library (searchable, public) | ✅ locally | `style-library`: 12 seeds + yours, scored search. Ours is private by design |
| Guide hub / Creator Field Guide | ⚠️ | `docs/` and `skills/` — for the build, not for a creator |

**Score:** 12 matched, 4 partial, 0 missing. Two of the four partials are
deliberate (no bulk download, no profile scraping); one is a real gap (ID3
tagging); one is UI surface we have not built yet (cover-art button).

## The gaps worth closing, in order

1. **Lyrics timestamping → LRC/SRT/VTT.** No network, no audio. Pure text in,
   cues out. Fits `src/lib` exactly and is a weekend of work. This is the
   highest value-per-line item on the list.
2. **Random style generator with lock & re-roll.** A thin wrapper over the
   builder; ~80 lines including tests.
3. **Structure tag helper.** Variant of `normalizeTags`; should extend the
   existing capability rather than add a 20th.
4. **Profile analytics without downloading anything.** They download and then
   analyze; we can analyze the public page we already capture. Same insight,
   no redistribution.

## What we decline, and why

The four downloaders (audio, video, cover, playlist, profile) all rehost
copyrighted work outside Suno's UI and against its terms. Our privacy model —
`docs/tools/privacy-model.md` — says we read public pages and never store or
redistribute media. Adding a downloader would not be a feature gap; it would be
a different product. The **MV Studio** is a separate question: it is
transformation of user-supplied lyrics into a user-owned video, not
redistribution, but it is a canvas/MediaRecorder project of its own scale and
does not belong inside a 270 kB popup.

## Where we are ahead

- **Local-first by construction.** No account, no sync, no server. Their text
  tools claim the same; their library and analyzers imply otherwise.
- **A real background worker.** Their batch parser produces a file; our batch
  path queues, retries with backoff, persists per item, and survives MV3 worker
  death.
- **A loop that maintains the repo.** 19 capabilities each gated on their own
  source symbols; 246 tests; 8 audit gates. Theirs is a static site.

## What shipped (2026-10-30, later the same day)

| Capability | Where |
|---|---|
| `lyrics-timestamps` | `src/lib/timestamps.ts` · 33 tests · Studio tab |
| `random-style` | `src/lib/randomStyle.ts` · Tools → Random |
| `structure-tags` | `src/lib/structure.ts` · Tools → Structure |
| `style-library` | `src/lib/styleLibrary.ts` · Tools → Styles |
| `media-save` | `src/lib/mediaTargets.ts` + `src/lib/download.ts` · content button |
| `lyric-video` | `src/lib/videoPlan.ts` + `entrypoints/studio/` · its own page |
| `library-analytics` | `src/lib/analytics.ts` · options page |
| `zip-export` | `src/lib/zip.ts` · background handler |

Registry went 19 → 27 capabilities; 246 → 354 vitest tests; bundle 267.65 kB →
317.99 kB.

### The one place we are genuinely behind

**ID3-tagged MP3.** They mux lyrics *into* an audio file; we cannot, because we
never handle audio containers. The honest position: we write the subtitle file,
they write the tagged track. Everything else in their timestamping tool we now
match or exceed (we can import a real `.lrc` and retime it; they cannot).
