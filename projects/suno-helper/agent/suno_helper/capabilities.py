"""Capability registry: the project's feature surface, as data.

Why a registry instead of another hardcoded wave list?

The loop's second failure mode (after infinite retry) was *idling*: once the
hand-written wave list ran out it spun on ``goal complete`` for hundreds of
turns. A registry fixes that honestly — every entry names a real source file and
the identifiers that file must expose, so the generated documentation can only
pass when the code actually exists. The work is therefore bounded by reality:
no capability, no doc, no completion.

Adding a capability is a deliberate act: one dataclass entry and the doc follows.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Capability:
    """One shipped feature, with the evidence that proves it ships."""

    id: str
    title: str
    phase: str
    summary: str
    #: Files relative to ``projects/suno-helper/`` that implement the feature.
    sources: tuple[str, ...]
    #: Substrings that must appear in ``sources``; a doc cannot claim what the
    #: code does not export.
    symbols: tuple[str, ...]
    behaviours: tuple[str, ...]
    edge_cases: tuple[str, ...]
    tests: tuple[str, ...] = ()
    related: tuple[str, ...] = ()


CAPABILITIES: tuple[Capability, ...] = (
    Capability(
        id="clean-style",
        title="Style String Cleaner",
        phase="phase-2",
        summary=(
            "Turns a pasted style blob into a deduplicated, tag-shaped style string: "
            "splits on separators, drops hype vocabulary, normalises casing, caps the "
            "tag count and reports exactly what it removed."
        ),
        sources=("extension/src/lib/cleanStyle.ts",),
        symbols=("HYPE_WORDS", "cleanStyle", "CleanResult"),
        behaviours=(
            "Splits on commas, semicolons, pipes and slashes before judging each segment.",
            "Removes a curated hype list (words that add no musical information).",
            "Deduplicates case-insensitively while keeping the first spelling seen.",
            "Collapses whitespace, trims dangling separators and returns a `CleanResult` with `removed` and `duplicates`.",
            "Never truncates silently: the caller sees the over-budget flag before submitting.",
        ),
        edge_cases=(
            "A style made only of hype words returns an empty string plus the removal list — the UI shows a prompt instead of an empty box.",
            "Unicode is preserved; cleaning does not strip non-Latin scripts.",
            "Repeated runs are idempotent: cleaning a cleaned string changes nothing.",
        ),
        tests=("extension/src/lib/cleanStyle.test.ts",),
        related=("prompt-builder", "model-limits"),
    ),
    Capability(
        id="prompt-builder",
        title="Five-Pillar Prompt Builder",
        phase="phase-2",
        summary=(
            "Composes a style string from five independent pillars — genre, "
            "instrumentation, mood, vocal, production — with deterministic re-rolls and "
            "per-pillar locks so a creator can iterate on one axis at a time."
        ),
        sources=("extension/src/lib/buildStyle.ts",),
        symbols=("PILLARS", "buildStyle", "rollStyle", "toggleLock", "auditStyle"),
        behaviours=(
            "Renders pillars in a fixed order so the same state always yields the same string.",
            "`rollStyle` uses a seeded PRNG (`mulberry32`), so a re-roll is reproducible from its seed.",
            "Locked pillars survive a re-roll; unlocked ones are replaced.",
            "`missingPillars` and `isComplete` tell the UI what is still empty.",
            "`auditStyle` flags pillars that are present but thin (one generic tag).",
        ),
        edge_cases=(
            "Excluding a pillar keeps it out of the output without discarding its stored value.",
            "An empty state builds to an empty string rather than a string of separators.",
            "Seeds collide only as often as a 32-bit PRNG allows; tests assert reproducibility, not uniqueness.",
        ),
        tests=("extension/src/lib/buildStyle.test.ts",),
        related=("clean-style", "prompt-storage"),
    ),
    Capability(
        id="tag-normalizer",
        title="Structure Tag Normalizer",
        phase="phase-3",
        summary=(
            "Normalises bracket tags in lyrics and style strings — multilingual aliases to "
            "the canonical English set, bracket styles to one form, and missing structure "
            "tags inferred from repetition."
        ),
        sources=("extension/src/lib/normalizeTags.ts",),
        symbols=("CANONICAL_TAGS", "parseTagLine", "normalizeTags", "inferMissingStructure"),
        behaviours=(
            "`parseTagLine` walks brackets with a depth counter, so `[Verse (quiet)]` parses as one tag.",
            "Aliases (`couplet`, `estribillo`, `refrão`, `припев`, …) map to `[Verse]`.",
            "Bracket styles — square, lenticular, parens, fullwidth — collapse to one chosen form.",
            "`inferMissingStructure` adds `[Verse]`/`[Chorus]` hints only where repetition makes it unambiguous.",
            "`tagStats` reports counts per canonical tag so the UI can show balance.",
        ),
        edge_cases=(
            "Nested or unbalanced brackets are left untouched rather than guessed at.",
            "Unknown tags are preserved verbatim; the tool normalises, it does not censor.",
            "Lyrics with no tags at all are returned unchanged unless inference is explicitly requested.",
        ),
        tests=("extension/src/lib/normalizeTags.test.ts",),
        related=("lyric-diff", "model-limits"),
    ),
    Capability(
        id="lyric-diff",
        title="Lyric Diff Tool",
        phase="phase-3",
        summary=(
            "Line-level diff between two lyric drafts, with a changed/added/removed summary "
            "so a creator can see what a revision actually did before committing to a generation."
        ),
        sources=("extension/src/lib/diffLyrics.ts",),
        symbols=("diffLyrics", "summarizeDiff", "DiffResult"),
        behaviours=(
            "Compares normalised lines (trailing whitespace and CRLF removed) before diffing.",
            "Classifies each line as equal, added, removed or changed.",
            "`summarizeDiff` produces a one-line human summary for the ledger or a toast.",
            "Runs on the longest common subsequence, so reordering is reported rather than flattened.",
        ),
        edge_cases=(
            "Two empty drafts produce an empty diff, not an error.",
            "A draft with only whitespace changes reports zero changed lines.",
            "Very long drafts are bounded by the caller's line budget; the tool does not silently truncate.",
        ),
        tests=("extension/src/lib/diffLyrics.test.ts",),
        related=("tag-normalizer",),
    ),
    Capability(
        id="duration-estimator",
        title="Duration Estimator",
        phase="phase-3",
        summary=(
            "Estimates a song's runtime from syllables and a tempo preset, section by "
            "section, so creators can tell whether a lyric draft fits a 2- or 4-minute target "
            "before spending a generation."
        ),
        sources=("extension/src/lib/estimateDuration.ts",),
        symbols=("PACE_PRESETS", "countSyllables", "estimateDuration", "formatDuration"),
        behaviours=(
            "Counts syllables per line with a vowel-group heuristic plus a silent-e correction.",
            "Applies a pace preset (syllables per second) per section.",
            "Adds instrumental padding for intro/outro sections from a fixed table.",
            "Returns per-section estimates plus a total and a formatted `m:ss` string.",
        ),
        edge_cases=(
            "Instrumental-only lyrics fall back to the fixed instrumental table.",
            "A pace id that is not in the presets falls back to the default rather than throwing.",
            "The estimate is a planning aid, not a measurement — the docs say so explicitly.",
        ),
        tests=("extension/src/lib/estimateDuration.test.ts",),
        related=("model-limits",),
    ),
    Capability(
        id="exclude-styles",
        title="Exclude-Styles Generator",
        phase="phase-2",
        summary=(
            "Builds the negative style string: curated categories of what a genre should "
            "avoid, capped to the field limit, with per-genre suggestions."
        ),
        sources=("extension/src/lib/excludeStyles.ts",),
        symbols=("EXCLUDE_CATEGORIES", "EXCLUDE_LIMIT", "buildExclude", "suggestFor"),
        behaviours=(
            "Groups exclusions by category so the UI can offer toggles instead of a text box.",
            "Joins selected exclusions and enforces the character budget while reporting what was dropped.",
            "`suggestFor` proposes a starting set from a genre keyword.",
        ),
        edge_cases=(
            "No selection yields an empty string, not a dangling separator.",
            "A selection over budget is trimmed in list order and reported — never silently.",
        ),
        tests=("extension/src/lib/excludeStyles.test.ts",),
        related=("clean-style", "model-limits"),
    ),
    Capability(
        id="model-limits",
        title="Per-Model Limit Table",
        phase="core",
        summary=(
            "The single source of per-model character budgets used by every other module, "
            "with grapheme-aware counting and a non-destructive truncation helper."
        ),
        sources=("extension/src/lib/limits.ts",),
        symbols=("MODEL_LIMITS", "FIELD_LIMITS", "checkBudget", "truncateGraphemes", "charCount"),
        behaviours=(
            "Encodes style and lyric budgets per model id (v3.5 through v5.5).",
            "Counts grapheme clusters, so emoji and combining marks cost one character.",
            "`checkBudget` returns a structured overflow report instead of a boolean.",
            "`truncateGraphemes` is opt-in and returns what it cut; nothing truncates by default.",
        ),
        edge_cases=(
            "An unknown model id falls back to the default model rather than throwing.",
            "A lone surrogate is counted as one grapheme; the regex avoids `isWellFormed` for older engines.",
            "Budgets follow the selected model, not the account tier — documented in the field guide.",
        ),
        tests=("extension/src/lib/limits.test.ts",),
        related=("clean-style", "duration-estimator"),
    ),
    Capability(
        id="prompt-storage",
        title="Local Prompt Library",
        phase="phase-2",
        summary=(
            "Records saved prompts in `chrome.storage.local` behind a small typed store, "
            "with schema migration and an in-memory implementation for tests."
        ),
        sources=("extension/src/lib/storage.ts",),
        symbols=("SCHEMA_VERSION", "PromptStore", "migrateRecord", "MemoryStorage", "chromeStorage"),
        behaviours=(
            "`PromptStore` is the only writer; the popup reads through the same API.",
            "Records carry a schema version and migrate forward on read.",
            "`MemoryStorage` makes the store testable without a browser.",
            "Nothing leaves the device: there is no sync, no fetch, no account.",
        ),
        edge_cases=(
            "A corrupt record is skipped and reported rather than crashing the popup.",
            "Writes are read-modify-write safe within a single service worker instance.",
            "Quota exhaustion surfaces as an error the UI can show, not a silent drop.",
        ),
        tests=("extension/src/lib/storage.test.ts",),
        related=("prompt-builder", "csv-export"),
    ),
    Capability(
        id="csv-export",
        title="CSV / JSON Export",
        phase="phase-4",
        summary=(
            "Serialises the local library to CSV or JSON and reads it back, with quoting "
            "that survives commas, quotes and newlines in lyrics."
        ),
        sources=("extension/src/lib/csv.ts",),
        symbols=("escapeCell", "toCsv", "parseCsv", "toJsonExport", "exportFilename"),
        behaviours=(
            "Quotes cells only when needed and doubles embedded quotes.",
            "`parseCsv` handles quoted newlines, so multi-line lyrics survive a round trip.",
            "`exportFilename` stamps a deterministic, sortable name.",
            "JSON export carries the schema version for future migration.",
        ),
        edge_cases=(
            "A cell containing the delimiter, a quote or a newline round-trips exactly.",
            "An empty record set exports a header-only file.",
            "Parsing foreign CSV does not assume our column order.",
        ),
        tests=("extension/src/lib/csv.test.ts",),
        related=("prompt-storage",),
    ),
    Capability(
        id="link-parser",
        title="Batch Link Parser",
        phase="phase-4",
        summary=(
            "Turns a pasted list of Suno links into unique, canonical references — "
            "song, playlist and profile — while explaining every line it could not read."
        ),
        sources=("extension/src/lib/parseLinks.ts",),
        symbols=("parseLinks", "summarizeLinks", "canonicalUrl", "ParseLinksResult"),
        behaviours=(
            "Accepts `suno.com/song/<uuid>`, `app.suno.com` variants, playlist links, `@handle` profiles and bare UUIDs.",
            "Pulls the URL out of markdown links, HTML anchors and chat exports before judging it.",
            "Deduplicates case-insensitively on (kind, id) and keeps the first occurrence, so batch order survives.",
            "Returns rejected lines with a reason instead of silently dropping them.",
        ),
        edge_cases=(
            "A non-Suno host is rejected by name, not coerced into a song id.",
            "`/song` or `/playlist` without an id is invalid; a UUID that is not v4 still parses.",
            "Blank and whitespace-only lines are ignored and not counted as entries.",
        ),
        tests=("extension/src/lib/parseLinks.test.ts",),
        related=("batch-planner", "csv-export"),
    ),
    Capability(
        id="batch-planner",
        title="Batch Fetch Planner",
        phase="phase-4",
        summary=(
            "Plans polite batches for the Phase-4 downloaders: bounded concurrency, "
            "a gap between batches, a hard item cap and exponential retry."
        ),
        sources=("extension/src/lib/batchPlan.ts",),
        symbols=("planBatches", "chunk", "retryDelay", "isRetryableStatus", "hasBudget"),
        behaviours=(
            "Splits work into batches of `concurrency` (default 3) with a `gapMs` idle gap (default 750).",
            "Deduplicates and trims input before planning, and caps the plan at 500 items by default.",
            "Reports `dropped` so the UI can explain the cap instead of pretending nothing was lost.",
            "Backs off 500 ms → 8 s exponentially and retries only 408/429/5xx.",
        ),
        edge_cases=(
            "A nonsense concurrency (0, NaN, negative) falls back to 1 rather than hanging.",
            "An empty plan costs zero milliseconds and reports no batches.",
            "`hasBudget` refuses to schedule when the caller's time budget is already spent.",
        ),
        tests=("extension/src/lib/batchPlan.test.ts",),
        related=("link-parser", "privacy-model"),
    ),
    Capability(
        id="song-capture",
        title="Public Page Capture",
        phase="phase-4",
        summary=(
            "Reads a public Suno page into a typed capture record using only what the "
            "page publishes — Open Graph tags, `<title>` and JSON-LD — and records how "
            "complete that reading is instead of guessing the gaps."
        ),
        sources=("extension/src/lib/htmlMeta.ts", "extension/src/lib/capture.ts"),
        symbols=("extractSongFromHtml", "parseMetaTags", "buildCapture", "mergeCaptures", "captureStats"),
        behaviours=(
            "Parses `<meta>` attributes with single quotes, double quotes and no quotes.",
            "Prefers JSON-LD `Song`/`MusicRecording` over Open Graph, and falls back to `<title>` with the Suno suffix stripped.",
            "Converts ISO-8601 (`PT3M12S`) and bare-second durations to seconds.",
            "Classifies a capture as `ok` (JSON-LD), `partial` (OG only), `manual` (playlist/profile) or `failed` (nothing readable).",
            "Merges duplicates by (kind, id), keeping the more complete record.",
        ),
        edge_cases=(
            "Malformed JSON-LD is skipped, not fatal — an OG-only page still captures.",
            "A page with no title yields `found: false` and a reason; nothing is invented.",
            "A record without an id is keyed by URL so two different songs never collapse.",
        ),
        tests=("extension/src/lib/htmlMeta.test.ts", "extension/src/lib/capture.test.ts"),
        related=("link-parser", "batch-backend"),
    ),
    Capability(
        id="batch-backend",
        title="Batch Capture Backend",
        phase="phase-4",
        summary=(
            "The service-worker job runner behind the batch panel: a pure state machine "
            "for scheduling and retries, wrapped by a single-flight queue that persists "
            "after every item so a killed worker loses nothing."
        ),
        sources=("extension/src/backend/jobs.ts", "extension/entrypoints/background.ts"),
        symbols=("createJob", "nextDispatch", "applyOutcome", "jobStats", "shouldContinue", "class BatchQueue"),
        behaviours=(
            "Dispatches at most `concurrency` items, with a gap between batches.",
            "Retries 408/429/5xx with exponential backoff (500 ms → 8 s); a 404 fails immediately.",
            "Gives up after `maxAttempts` and records the HTTP status or network error per item.",
            "Fetches public pages with `credentials: 'omit'` — no cookie, no session, no account.",
            "Persists the job and the capture list after every item and resumes on worker start.",
        ),
        edge_cases=(
            "Playlist and profile refs are marked `manual` instead of being fetched and half-parsed.",
            "A second `batch:start` while one is running is refused rather than interleaved.",
            "Cancelling clears the timer and keeps the captures already collected.",
        ),
        tests=("extension/src/backend/jobs.test.ts",),
        related=("song-capture", "popup-ui"),
    ),
    Capability(
        id="popup-ui",
        title="Popup and Options UI",
        phase="ui",
        summary=(
            "The four-tab popup (Builder, Batch, Library, Tools) and the options page, "
            "built on a small zustand store and presentational primitives, with every "
            "number on screen coming from the same library the tools use."
        ),
        sources=(
            "extension/entrypoints/popup/App.tsx",
            "extension/src/components/BuilderPanel.tsx",
            "extension/src/components/BatchPanel.tsx",
            "extension/src/components/LibraryPanel.tsx",
            "extension/src/components/ToolsPanel.tsx",
        ),
        symbols=("BuilderPanel", "BatchPanel", "LibraryPanel", "ToolsPanel", "useBuilder"),
        behaviours=(
            "Builder: five pillars with per-pillar locks, seeded re-roll, raw editor and a live budget meter.",
            "Batch: paste → parse summary → run → live progress → CSV export, with rejected lines explained.",
            "Library: search, load into the builder, fill the Suno create form, delete.",
            "Tools: tag normaliser, lyric diff, duration estimate, exclude builder — each reusing the tested library.",
        ),
        edge_cases=(
            "The UI never truncates text for the user; it shows the overflow instead.",
            "A closed popup does not stop a batch: the worker owns the job and the panel re-reads it on open.",
            "No panel makes a network call; only the background worker does.",
        ),
        tests=(),
        related=("batch-backend", "prompt-builder"),
    ),
    Capability(
        id="lyrics-timestamps",
        title="Lyrics Timestamps (LRC / SRT / WebVTT)",
        phase="phase-5",
        summary=(
            "Turns plain lyrics into a timed subtitle file. Cues are distributed by "
            "syllable weight between the real duration the user supplies — an estimate, "
            "labelled as one — or taken from taps and imported LRC files, which are real "
            "timings and say so."
        ),
        sources=("extension/src/lib/timestamps.ts", "extension/src/components/StudioPanel.tsx"),
        symbols=("distributeCues", "toLrc", "toSrt", "toVtt", "parseLrc", "cuesFromTaps"),
        behaviours=(
            "Distributes lines in proportion to estimated syllables, with a minimum cue floor that gives way rather than overflowing the track.",
            "Writes LRC (`[mm:ss.xx]`), SRT (`HH:MM:SS,mmm`) and WebVTT (`HH:MM:SS.mmm`), each with the numbering or header their format requires.",
            "Embeds an `[re:…]` comment in generated LRCs stating the timings are estimated, not transcribed.",
            "Imports an existing `.lrc` and can shift or rescale it onto a different audio duration.",
            "Converts taps recorded in the popup into cues marked `estimated: false`.",
        ),
        edge_cases=(
            "Section tags, blank lines and CRLF endings are dropped before timing; nothing is invented for an empty lyric.",
            "A duration the parser cannot read blocks export instead of producing a file with zero-length cues.",
            "If the minimum-cue floor cannot fit, the floor shrinks — a short cue beats a timestamp past the end of the song.",
        ),
        tests=("extension/src/lib/timestamps.test.ts",),
        related=("duration-estimator", "lyric-video"),
    ),
    Capability(
        id="random-style",
        title="Random Style Generator with Locks",
        phase="phase-5",
        summary=(
            "Deterministic style rolls: a seed produces the same five pillars every time, "
            "and any pillar can be pinned so a re-roll moves only what the user wants moved."
        ),
        sources=("extension/src/lib/randomStyle.ts",),
        symbols=("SEED_POOL", "generateStyle", "mulberry32", "nextSeed", "shuffle"),
        behaviours=(
            "Uses a small seeded PRNG (mulberry32) so a roll is reproducible across browsers and sessions.",
            "Locks are used verbatim and reported in `lockedKeys`; unlocked pillars are drawn from the pool.",
            "User extras are appended to a pool rather than replacing it.",
            "Skips a pillar whose pool is empty instead of emitting an empty comma-separated slot.",
        ),
        edge_cases=(
            "Deleting every value for a pillar still yields a usable style string.",
            "The same seed with different locks is a different style — the lock set, not the seed alone, defines the roll.",
        ),
        tests=("extension/src/lib/randomStyle.test.ts",),
        related=("prompt-builder", "style-library"),
    ),
    Capability(
        id="structure-tags",
        title="Structure Tag Helper",
        phase="phase-5",
        summary=(
            "Places `[Verse]` / `[Chorus]` headings into an untagged lyric using a named "
            "song shape, weighting verses above choruses, and reports what it left empty "
            "instead of pretending every section was filled."
        ),
        sources=("extension/src/lib/structure.ts",),
        symbols=("TEMPLATES", "applyTemplate", "detectSections", "suggestTemplate"),
        behaviours=(
            "Six templates (pop, rock, ballad, EDM, hip hop, folk) with per-section line weights.",
            "Repeated sections get their own chunk — every chorus receives its own lines.",
            "Instrumental sections (Intro, Drop, Solo, Outro) are emitted as empty headings on purpose.",
            "Refuses to touch a lyric that already has tags and says so.",
        ),
        edge_cases=(
            "Fewer lines than lyric sections produces empty sections plus an explicit warning.",
            "CJK and parenthesised tags are detected as existing structure, not as lyrics.",
        ),
        tests=("extension/src/lib/structure.test.ts",),
        related=("tag-normalizer", "lyrics-timestamps"),
    ),
    Capability(
        id="style-library",
        title="Searchable Style Library",
        phase="phase-5",
        summary=(
            "A local, searchable library of style prompts: twelve seed entries in the "
            "bundle plus the user's own, scored by name, tag and style text."
        ),
        sources=("extension/src/lib/styleLibrary.ts", "extension/src/lib/storage.ts"),
        symbols=("SEED_STYLES", "searchStyles", "upsertStyle", "removeStyle", "userStyleId"),
        behaviours=(
            "Scores a query against name (3), tags (2) and style text (1), then sorts by score.",
            "An empty query returns everything so the panel is browsable, not blank.",
            "User entries are stored under `userStyles` in `chrome.storage.local`; seeds ship in the bundle.",
            "Saving the same name replaces the entry rather than duplicating it.",
        ),
        edge_cases=(
            "One-character terms are ignored so a stray keypress does not filter the list to nothing.",
            "A corrupt stored entry is skipped instead of breaking the panel.",
        ),
        tests=("extension/src/lib/styleLibrary.test.ts",),
        related=("random-style", "prompt-storage"),
    ),
    Capability(
        id="media-save",
        title="Public Media Save",
        phase="phase-5",
        summary=(
            "Saves the audio, video or cover art that a public song page already publishes. "
            "One click, one file: the URL comes from the page's own Open Graph / JSON-LD "
            "tags and is handed to `chrome.downloads`."
        ),
        sources=(
            "extension/src/lib/mediaTargets.ts",
            "extension/src/lib/download.ts",
            "extension/entrypoints/content/index.tsx",
        ),
        symbols=("findMediaTargets", "safeFilename", "downloadText", "bestTarget"),
        behaviours=(
            "Collects candidates from `og:audio`, `og:video`, `og:image`, JSON-LD `contentUrl` and `<audio>/<video>` sources.",
            "Rejects every non-http(s) scheme — `data:` and `blob:` are never passed to the downloader.",
            "De-duplicates by origin + path so the same file linked twice does not download twice.",
            "Ranks known Suno/CDN hosts above unknown ones and Open Graph above guesswork.",
            "Sanitises filenames for the OS and falls back by media kind when the URL has no extension.",
        ),
        edge_cases=(
            "Playlist and profile pages render client-side, so the UI explains that instead of returning an empty list.",
            "The batch queue has no route to the download handlers: there is no bulk download path by design.",
            "A page that requires a session simply yields no targets — the fetcher sends `credentials: 'omit'`.",
        ),
        tests=("extension/src/lib/mediaTargets.test.ts",),
        related=("song-capture", "privacy-model"),
    ),
    Capability(
        id="lyric-video",
        title="Lyric Video Studio",
        phase="phase-5",
        summary=(
            "A full-page canvas renderer that turns cues into a video file through "
            "`MediaRecorder`. It lives on its own page because a popup closes mid-recording, "
            "and it records only what this device draws."
        ),
        sources=("extension/src/lib/videoPlan.ts", "extension/entrypoints/studio/App.tsx"),
        symbols=("planLyricVideo", "wrapLine", "activeCue", "THEMES", "clock"),
        behaviours=(
            "Plans keyframes plus cue changes, capped at 30,000 frames, and warns when the cap bites.",
            "Wraps lyric text to the canvas width rather than clipping it.",
            "Four themes and four canvas sizes (720p, 1080p, vertical, square).",
            "Optionally muxes a **local** audio file the user selects into the recording.",
            "Warns that estimated timings will drift against the real vocal.",
        ),
        edge_cases=(
            "No cues produces an empty plan with an explicit warning, not a crash.",
            "A browser without MediaRecorder video support reports that instead of rendering an empty file.",
            "Audio is never fetched from Suno: without a user-supplied file the export is silent video.",
        ),
        tests=("extension/src/lib/videoPlan.test.ts",),
        related=("lyrics-timestamps", "popup-ui"),
    ),
    Capability(
        id="library-analytics",
        title="Capture Analytics",
        phase="phase-5",
        summary=(
            "Summarises the captures already on disk: duration distribution, median and "
            "range, tag frequency, creator counts and duplicate titles — computed locally "
            "with no upload and a small-sample warning."
        ),
        sources=("extension/src/lib/analytics.ts", "extension/entrypoints/options/App.tsx"),
        symbols=("analyzeSongs", "durationBuckets", "tally", "formatDuration"),
        behaviours=(
            "Splits comma-separated style strings into individual tags before counting.",
            "Bins durations into six buckets with an open top bucket.",
            "Counts missing durations separately instead of treating them as zero.",
            "Flags samples under five songs as thin rather than presenting them as a pattern.",
        ),
        edge_cases=(
            "An empty library returns zeros, not a division by zero.",
            "Duplicate detection is case- and whitespace-insensitive.",
        ),
        tests=("extension/src/lib/analytics.test.ts",),
        related=("song-capture", "csv-export"),
    ),
    Capability(
        id="zip-export",
        title="ZIP Export",
        phase="phase-5",
        summary=(
            "A store-only ZIP writer, about 120 lines, used to bundle a playlist's subtitle "
            "files or a style library into one download without adding a compression "
            "dependency to a 300 kB extension."
        ),
        sources=("extension/src/lib/zip.ts", "extension/entrypoints/background.ts"),
        symbols=("buildZip", "crc32", "readZipDirectory", "isSafeEntryName"),
        behaviours=(
            "Writes local headers, a central directory and an end-of-central-directory record per APPNOTE.TXT.",
            "Computes real CRC-32 values (verified against the `123456789` check vector).",
            "Refuses entry names that escape the archive root.",
            "Produces byte-identical output for a fixed timestamp, so exports are reproducible.",
        ),
        edge_cases=(
            "An empty entry list produces a valid, empty archive.",
            "Directory traversal, absolute paths and Windows drive prefixes are rejected before writing.",
        ),
        tests=("extension/src/lib/zip.test.ts",),
        related=("csv-export", "media-save"),
    ),
    Capability(
        id="privacy-model",
        title="Zero-Trust Privacy Model",
        phase="core",
        summary=(
            "The extension's permission and data-flow contract: no network egress, "
            "no telemetry, host access limited to Suno, and a service worker that only "
            "moves records."
        ),
        sources=("extension/wxt.config.ts", "extension/entrypoints/background.ts"),
        symbols=("permissions: ['storage']", "host_permissions", "chrome.runtime.onMessage"),
        behaviours=(
            "Manifest V3 with `storage` as the only declared permission.",
            "Host permissions are limited to the two Suno origins.",
            "CSP forbids remote script; the bundle is self-contained.",
            "The background worker never receives or logs lyric text for processing.",
        ),
        edge_cases=(
            "Adding a permission requires a written justification in the PR body — enforced by review, not by code.",
            "The content script cannot run on non-Suno pages, so no silent site-wide injection.",
        ),
        tests=(),
        related=("prompt-storage",),
    ),
    Capability(
        id="loop-engine",
        title="Autonomous Loop Engine",
        phase="ops",
        summary=(
            "The `/loop` engine: select a subgoal, find skills, research, delegate, act, "
            "verify against gates, improve, then persist `/goal` and `/subgoals`."
        ),
        sources=("agent/suno_helper/engine.py", "agent/suno_helper/state.py"),
        symbols=("class Engine", "def cycle", "def run", "class StateStore", "def select_next"),
        behaviours=(
            "Nine-step turn recorded as one ledger line, with evidence and gate outcomes.",
            "Selection scores priority, staleness, freshness and recoverable failures.",
            "A subgoal that fails three times is blocked, not retried (see the incident report).",
            "Splitting happens once per subgoal; children never re-split.",
            "Every completed subgoal passed its gates on the turn it completed.",
        ),
        edge_cases=(
            "An empty queue triggers a generated wave, then an audit rotation — never a silent spin.",
            "A crashed tool fails the turn instead of killing the run.",
            "Determinism: the heuristic provider plus a seed replays the same decisions.",
        ),
        tests=("agent/tests/test_engine.py", "agent/tests/test_state.py"),
        related=("capability-docs", "self-improvement"),
    ),
    Capability(
        id="capability-docs",
        title="Generated Tool Reference",
        phase="ops",
        summary=(
            "The generator behind these pages: it verifies that each capability's source "
            "files expose the promised symbols before rendering the reference doc."
        ),
        sources=("agent/suno_helper/capabilities.py", "agent/suno_helper/tools.py"),
        symbols=("class Capability", "CAPABILITIES", "def capability_docs", "def render_capability"),
        behaviours=(
            "Checks every declared source file exists before writing anything.",
            "Checks every declared symbol appears in the source text.",
            "Writes only pages that carry the generated marker; hand-edited pages are left alone.",
            "Fails the gate when a doc is missing, too short, or missing a required section.",
        ),
        edge_cases=(
            "A capability whose source was deleted fails loudly rather than producing an empty page.",
            "Re-running the generator on unchanged sources is a no-op (byte-identical output).",
        ),
        tests=("agent/tests/test_capabilities.py",),
        related=("loop-engine", "research-desk"),
    ),
    Capability(
        id="research-desk",
        title="Research Desk",
        phase="ops",
        summary=(
            "Keeps a dated, sourced corpus under `docs/research/` and answers open "
            "questions from it before spending a network call."
        ),
        sources=("agent/suno_helper/research.py",),
        symbols=("class ResearchDesk", "def ask", "def run", "def render_index"),
        behaviours=(
            "Answers a question from the local corpus when trust ≥ 0.8.",
            "Flags sources older than 180 days as stale instead of treating them as current.",
            "Renders `docs/research/README.md` as a generated index.",
        ),
        edge_cases=(
            "With `allow_network=False` an unanswerable question stays open — it is never fabricated.",
            "A missing corpus file is reported as zero sources, not an exception.",
        ),
        tests=("agent/tests/test_tools_and_ledger.py",),
        related=("loop-engine", "capability-docs"),
    ),
    Capability(
        id="self-improvement",
        title="Self-Improvement Loop",
        phase="ops",
        summary=(
            "Reflects on the ledger, proposes bounded parameter changes, auto-applies only "
            "those inside a gate, and keeps rollback snapshots."
        ),
        sources=("agent/suno_helper/selfimprove.py",),
        symbols=("class Improver", "def reflect", "def auto_apply", "def rollback"),
        behaviours=(
            "Proposals are deduplicated by (kind, title); evidence is merged, not repeated.",
            "Auto-apply is gated by a cooldown and by the failure streak.",
            "Every applied change records before/after and can be rolled back.",
            "Structural proposals (split, research, prune, promote) are rate-limited.",
        ),
        edge_cases=(
            "No failures means no tuning proposals — silence is a valid outcome.",
            "Rollback with no snapshots is a no-op that reports why.",
        ),
        tests=("agent/tests/test_engine.py",),
        related=("loop-engine",),
    ),
)


def by_id(capability_id: str) -> Capability | None:
    for cap in CAPABILITIES:
        if cap.id == capability_id:
            return cap
    return None


def ids() -> tuple[str, ...]:
    return tuple(cap.id for cap in CAPABILITIES)


def readiness(project: Path, capability_id: str | None = None) -> dict[str, list[str]]:
    """Split the registry into ``ready`` / ``missing`` for a given project tree.

    "Ready" means the source files and tests exist *and* the sources contain
    every declared symbol. The loop uses this before queueing work: claiming a
    capability whose evidence is absent would only manufacture a failing turn.
    """
    from pathlib import Path as _Path

    project = _Path(project)
    ready: list[str] = []
    missing: list[str] = []
    for cap in CAPABILITIES:
        if capability_id is not None and cap.id != capability_id:
            continue
        absent = [rel for rel in cap.sources if not (project / rel).exists()]
        absent += [rel for rel in cap.tests if not (project / rel).exists()]
        if not absent:
            corpus = "\n".join((project / rel).read_text(encoding="utf-8", errors="replace") for rel in cap.sources)
            absent = [symbol for symbol in cap.symbols if symbol not in corpus]
        (missing if absent else ready).append(cap.id)
    return {"ready": ready, "missing": missing}
