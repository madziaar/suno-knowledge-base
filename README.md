# Suno Knowledge Base 🎵

A personal, working knowledge base for **Suno AI** music generation — prompt
engineering guides, best practices, reference material, and a collection of
projects for writing prompts, producing tracks, and shipping releases.

**Curated by:** Ralph Madziar ([@madziaar](https://github.com/madziaar))
**Location:** Warsaw, Poland

---

## Start here

| Document | What it is |
|----------|------------|
| [`docs/Suno-Knowledge-Base.md`](docs/Suno-Knowledge-Base.md) | The main guide: latest features, best practices, prompt engineering, pricing, resources |
| [`docs/README.md`](docs/README.md) | Song-syntax guide and prompt templates (ES) |
| [`WORKSPACE_STATUS.md`](WORKSPACE_STATUS.md) | Maintenance dashboard: project status and known debt |

## Repository layout

```
.
├── docs/        # Core knowledge base and prompt guides
├── projects/    # Tools, apps, plugins and skills (12 projects)
├── resources/   # Vendored "awesome" lists, prompt collections, PDFs
└── llm-wiki/    # Small LLM-development wiki (separate topic)
```

## Projects

| Project | Type | Description |
|---------|------|-------------|
| [`claude-ai-music-skills`](projects/claude-ai-music-skills) | Claude Code plugin (Python) | Conversation → album production pipeline: concept, lyrics, Suno prompts, mastering, release. **Canonical copy.** |
| [`coherence-system`](projects/coherence-system) | Python | Near-duplicate of `claude-ai-music-skills` — *needs merge* |
| [`SUNO-AI-Music-Skills-codex`](projects/SUNO-AI-Music-Skills-codex) | Python | Codex-ready port of `claude-ai-music-skills` — *needs merge* |
| [`MAG-Music-Records`](projects/MAG-Music-Records) | Workflow/tooling | Music label workflow for Suno content: mixtapes, playbooks, QA tools |
| [`SunoSync`](projects/SunoSync) | Desktop (Python) | Bulk downloader, music library, prompt vault, radio, mobile bridge |
| [`sonicforge`](projects/sonicforge) | Web app | "Sonic Forge V5" — AI music prompt generator for Suno V4.5 |
| [`suno-prompting`](projects/suno-prompting) | Desktop (Electrobun/TS) | Turns plain-English song ideas into Suno V5-ready prompts |
| [`Suno-Architect`](projects/Suno-Architect) | Web (Vite + CF Workers) | Auto-generates Suno prompts using Gemini |
| [`Sumini-Pro-Suno-Architect`](projects/Sumini-Pro-Suno-Architect) | Web app | "Sumini — Pro Suno Architect": lyric structures + style prompts |
| [`Cynaps3-OpenClaw-Plugin`](projects/Cynaps3-OpenClaw-Plugin) | TypeScript plugin | `@cynaps3/openclaw-plugin` for AI music creation |
| [`suno-song-creator-skill`](projects/suno-song-creator-skill) | Agent skill (`SKILL.md`) | Cross-platform co-writing skill for Suno songs |
| [`pseuno-ai`](projects/pseuno-ai) | Web (Docker) | Suno prompt generation with optional Spotify taste personalization — *incomplete* |

## Resources

- [`resources/awesome-suno-prompts`](resources/awesome-suno-prompts) — curated prompt collections by genre
- [`resources/Awesome-Suno`](resources/Awesome-Suno) and [`resources/awesome-suno-ai`](resources/awesome-suno-ai) — community "awesome" lists
- [`resources/sunopormpten`](resources/sunopormpten) — prompt tricks, tag cheat sheets, and models reference (ES/EN)

## License

[CC0 1.0 Universal](LICENSE) for this repository. Individual projects may carry
their own licenses — check each project's `LICENSE` file.

---

> ⚠️ **Known issue:** `claude-ai-music-skills`, `coherence-system`, and
> `SUNO-AI-Music-Skills-codex` are ~75–80% byte-identical duplicates
> (~45 MB combined). See `WORKSPACE_STATUS.md` for the consolidation plan.
