# Parity check: usesuno.com vs. this extension

`https://usesuno.com/` — a free, no-account, in-browser Suno toolkit with 16
tools plus a Chrome extension ("Suno Prompt Manager"). Recorded here as a
benchmark, not as a spec: some of what it does we should decline to do.

Last reviewed **2026-10-30**. Their tool list is the thing that changes; our
column is derived from the capability registry, so it moves with the code.

## Side by side

| Their tool | Us | Notes |
|---|---|---|
| Prompt Builder (genre / instruments / mood / vocal / production) | ✅ `prompt-builder` | Same five dimensions; ours writes a tagged style string, theirs fills a form |
| Style string cleaner | ✅ `clean-style` | |
| Exclude styles generator | ✅ `exclude-styles` | Capped at 1,000 chars, matching `docs/suno-limits.json` |
| Random style generator (lock & re-roll) | ❌ | Cheap to add: it is our builder minus the chosen pillars |
| Lyrics text diff | ✅ `lyric-diff` | |
| Structure tag helper | ❌ | In our `normalizeTags` territory; a variant, not a new capability |
| Lyrics tag normalizer (CJK/ES/FR → `[Verse]`) | ✅ `tag-normalizer` | |
| **Lyrics timestamping (LRC / SRT / VTT + ID3-synced MP3)** | ❌ | **Real gap.** No audio handling on our side at all today |
| **MV Studio (in-browser lyric video export)** | ❌ | **Real gap.** Heavy; canvas + MediaRecorder |
| Duration estimator | ✅ `duration-estimator` | |
| **Suno downloader (audio / video / cover)** | ❌ | Deliberate — see "what we decline" |
| **Playlist downloader (ZIP)** | ❌ | Deliberate |
| **Profile downloader & analyzer** | ❌ | Deliberate download; the *analyzer* half is interesting |
| **Cover art downloader** | ❌ | Deliberate |
| **Song inspector** (title / creator / tags / duration / lyrics from a public link) | ✅ `song-capture` | We parse OG + JSON-LD from public pages; they render it richer |
| Batch link parser → CSV / JSON | ✅ `link-parser` + `csv-export` | Ours also queues the batch in a background worker |
| Style prompt library (searchable, public) | ⚠️ | We have a **local** library (`prompt-storage`); they have a hosted, searchable one |
| Guide hub / Creator Field Guide | ⚠️ | `docs/` and `skills/` — for the build, not for a creator |

**Score:** 8 matched, 3 partial, 9 missing.

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
