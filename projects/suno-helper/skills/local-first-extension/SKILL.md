---
name: local-first-extension
description: Use when adding any browser-extension feature - enforces Manifest V3 patterns, minimal permissions, client-side text processing and chrome.storage discipline
tags: [chrome, extension, mv3, wxt, storage, privacy, local-first]
stages: [ultraplan, ultrawork, verify]
---

# Local-First Extension

## The mandate

User prompts, lyrics and library entries are **processed on the device**. The
only network egress allowed is a fetch of a *public* URL the user explicitly
supplied, and even then through an allowlist.

```
text tools   → 100 % client-side, no network code path exists
link tools   → fetch public URL → parse → keep local → never upload
storage      → chrome.storage.local, versioned, exportable
telemetry    → none. Not "anonymised". None.
```

## Architecture

| Surface | Job | May touch |
|---------|-----|-----------|
| `popup/` | dashboard, builder, library | storage, message passing |
| `options/` | import/export, settings | storage |
| `content/` | inject buttons on suno.com, read/write fields | DOM of the active page |
| `background/` | message hub, network fetches | `fetch`, storage |
| `src/lib/` | **pure functions** | nothing |

The pure layer is the product. Everything else is plumbing.

## Permissions

Start from `["storage"]` and add **`activeTab`** only. Then justify any further
grant in the PR body:

| permission | when justified |
|------------|----------------|
| `storage` | always (that is the library) |
| `activeTab` | injecting the save button on the current tab |
| `downloads` | writing a generated CSV/ZIP |
| `scripting` | programmatic injection instead of declared content scripts |
| `tabs` | almost never — it reads every tab's URL |
| `*://*/*` | **never** |
| `cookies` | **never** |

## Storage discipline

```ts
type PromptRecord = {
  id: string; title: string; style: string; lyrics: string;
  tags: string[]; createdAt: number; updatedAt: number; schemaVersion: 1;
};
```

- One `chrome.storage.local` area, keyed collections, a `schemaVersion`.
- Batch writes: assemble one object, one `set()`.
- Debounce search inputs; never read storage on every keystroke.
- `onChanged` for cross-surface sync, not polling.
- ~10 MB is the practical budget — archive or prune, do not request
  `unlimitedStorage` to dodge a design problem.

## Content script rules

- Inject only on the exact host needed (`https://suno.com/*`), never `*`.
- Selectors live in **one** module (`selectors.ts`) with a version comment;
  a DOM change should be a one-file fix.
- Never `eval`, never remote code, never a second copy of React.
- Read-then-write: confirm the field exists before setting `.value`, and dispatch
  the events the framework listens for (`input`, `change`).
- Fail visibly: if the field is missing, show a toast, do not silently no-op.

## Review gates

- [ ] `manifest` has ≤ 2 permissions
- [ ] no `fetch(` inside `src/lib`
- [ ] every network call has an allowlist check and a user-visible reason
- [ ] storage writes go through one wrapper with a schema version
- [ ] `npm run compile` + `npm test` green
- [ ] no remote code, no analytics, no third-party script tag
