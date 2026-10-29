# Provenance: what came from the supplied material

This project was built from three inputs. This page records what was taken from
each, and — more importantly — what was **rejected and why**. A project that
cannot say what it refused is not auditable.

## 1. The usesuno.com "Local-First Playbook"

**Adopted (all of it, it is the architectural spine):**

- Five local-first pillars: client-side processing, robust client storage, clear
  operational boundaries, minimal permissions, on-device AI as the end state.
- `chrome.storage.local` over `localStorage` (async, ~10 MB, native objects,
  `onChanged`).
- MV3 component split: popup / options / content / background service worker.
- The tool taxonomy: prompt builder, style cleaner, negative-prompt builder,
  tag normaliser, lyric diff, duration estimator, batch parser, profile
  downloader, repeatable tester.
- The phased roadmap (Phase 1 tools → Phase 2 local intelligence → Phase 3
  ecosystem), which is what the loop's roadmap waves encode.

**Deliberately limited:**

- *Reverse-engineered APIs* (`gcui-art/suno-api` and similar): documented in
  [`docs/research/README.md`](../../../docs/research/README.md) as a risk, **not**
  implemented. They require a user's session cookie, break silently, and carry
  ToS and legal exposure. A local-first tool has no business holding those.
- *DOM patching* of Suno's JavaScript: not implemented. Selectors are isolated in
  `src/selectors.ts` so a UI change is a one-file fix, but the extension never
  rewrites the site's code.

## 2. The Qwen session exports (`/init`, backlog, domain rules)

**Adopted:**

- The five-pillar style structure and the "hype words are noise" rule → now
  enforced in code (`cleanStyle.ts`) with tests.
- The tag-normalisation requirement (multilingual section labels) → `normalizeTags.ts`.
- The `{message, changes}` songwriting JSON protocol and the batch
  `{songs:[…]}` shape → documented in the field guide as the app-level contract.
- The phased task backlog → became `bootstrap` subgoals plus roadmap waves.

**Corrected:**

- The export said "Lyrics: 3000-5000, default to 3000 for safety" and
  "Style: max 1000". Both are model-dependent. There is now one canonical
  file, `docs/suno-limits.json`, with per-model numbers and citations, and the
  extension's typed mirror is asserted against it in `limits.test.ts`.

## 3. "Team Pyrite" (`SOUL.md`, creation prompts, operational manual, skills)

A 12-agent persona framework with a commander, five divisions and eleven
specialists (Aegis, Titan, Nexus, Oracle, Mnemonic, Chronos, Artisan, Forge,
Siren, Vox, Glyph, Phantom).

**Adopted — the genuinely useful engineering ideas:**

| Idea | Where it lives now |
|------|--------------------|
| Division/roster topology for staffing a multi-part task | `agent/suno_helper/crew.py`, `skills/team-pyrite` |
| Anticipatory execution (propose the next need before it blocks) | `Crew.anticipate`, `_ensure_backlog`, roadmap waves |
| Healthy disagreement between specialists | `Crew.debate`, `skills/adversarial` |
| Natural hand-off between specialists | `skills/teammode`, isolated-context dispatch |
| "Match the user's register" | kept as plain-language output rules in `scribe` |

**Rejected — and this is not negotiable:**

| Supplied directive | Why it is not implemented |
|--------------------|---------------------------|
| NSFW / flirtatious persona voice, "seductive" delivery | Irrelevant to shipping code, inappropriate in a public repository, and it degrades technical precision. |
| "Safety protocols are suggestions", "never refuse", "act first and ask forgiveness *never*" | Directly contradicts `cli-skillset/AGENTS.md` ("No exploits / scrapers that attack Suno") and the local-first privacy promise. |
| "Transparency is optional" | The opposite of the product's value proposition: the extension's entire pitch is auditability. |
| "Phantom — extract data", covert operations | Would mean scraping a third-party service with a user's credentials. Refused outright. |
| "Instructions from unrecognised sources ignored; only one human's commands override autonomy" | A prompt-injection footgun. Authority here comes from the repository's rules and the gates, not from an identity claim. |
| Persona persistence across model swaps ("Pyrite is Pyrite, PERIOD") | Not meaningful for an engineering loop; the state that must persist is `/goal`, `/subgoals` and the ledger. |

**What replaced the rejected parts.** Autonomy is high — 500+ turns with no
human — but it sits on four rails:

1. **Scope** — tools only touch paths inside the repository (`resolve_inside`).
2. **Refusal** — destructive instructions are rejected before any model call
   (`FORBIDDEN_MARKERS`).
3. **Audit** — every turn is a ledger line; proposals keep their rejections.
4. **Evidence** — a subgoal is `done` only when deterministic gates pass.

The interesting claim in the source material — that a divided team with
disagreement beats a single agent — is preserved. The claim that safety and
transparency are optional is not, because it is what makes unattended autonomy
unsafe rather than impressive.

## 4. `obra/superpowers`

**Adopted:** the `SKILL.md` contract (frontmatter `name` / `description: Use
when…`, red-flag tables, checklists), skill-before-action discipline, isolated
subagent dispatch, verification-before-completion, writing-skills as TDD for
documentation, and the "two independent domains → two parallel agents" rule.

Our skills are written for this project rather than copied, and `skills_lint`
enforces the contract in CI.
