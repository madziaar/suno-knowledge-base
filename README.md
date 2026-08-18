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
├── docs/          # Core knowledge base and prompt guides
├── cli-skillset/  # Skills for CLI coding agents (Claude Code, Codex, Gemini CLI, …)
├── projects/      # Active tools, apps, plugins and skills (10 projects)
├── archive/       # Retired/duplicate projects (see archive/README.md)
├── resources/     # Vendored "awesome" lists, prompt collections, PDFs
└── llm-wiki/      # Small LLM-development wiki (separate topic)
```

CLI agents should start at [`cli-skillset/AGENTS.md`](cli-skillset/AGENTS.md).

## Projects

| Project | Type | Description |
|---------|------|-------------|
| [`claude-ai-music-skills`](projects/claude-ai-music-skills) | Claude Code plugin (Python) | Conversation → album production pipeline: concept, lyrics, Suno prompts, mastering, release. **Canonical copy** of the album toolkit. |
| [`MAG-Music-Records`](projects/MAG-Music-Records) | Workflow/tooling | Music label workflow for Suno content: mixtapes, playbooks, QA tools |
| [`SunoSync`](projects/SunoSync) | Desktop (Python) | Bulk downloader, music library, prompt vault, radio, mobile bridge |
| [`sonicforge`](projects/sonicforge) | Web app | "Sonic Forge V5" — AI music prompt generator for Suno V4.5 |
| [`suno-prompting`](projects/suno-prompting) | Desktop (Electrobun/TS) | Turns plain-English song ideas into Suno V5-ready prompts |
| [`Suno-Architect`](projects/Suno-Architect) | Web (Vite + CF Workers) | Auto-generates Suno prompts + full Suno API integration (history, LRC/SRT, lyric video) using Gemini |
| [`Sumini-Pro-Suno-Architect`](projects/Sumini-Pro-Suno-Architect) | Web app | "Sumini — Pro Suno Architect": chat-style prompt engine for lyric structures + style prompts |
| [`Cynaps3-OpenClaw-Plugin`](projects/Cynaps3-OpenClaw-Plugin) | TypeScript plugin | `@cynaps3/openclaw-plugin` for AI music creation |
| [`suno-song-creator-skill`](projects/suno-song-creator-skill) | Agent skill (`SKILL.md`) | Cross-platform co-writing skill for Suno songs |
| [`pseuno-ai`](projects/pseuno-ai) | Web (Docker) | Suno prompt generation with optional Spotify taste personalization — *incomplete* |

### Archived

Duplicates of the album-production toolkit were consolidated into
`claude-ai-music-skills` and moved to [`archive/`](archive/README.md):

- `coherence-system` (~81% identical)
- `SUNO-AI-Music-Skills-codex` (~73% identical, Codex port)

## Resources

- [`resources/awesome-suno-prompts`](resources/awesome-suno-prompts) — curated prompt collections by genre
- [`resources/Awesome-Suno`](resources/Awesome-Suno) and [`resources/awesome-suno-ai`](resources/awesome-suno-ai) — community "awesome" lists
- [`resources/sunopormpten`](resources/sunopormpten) — prompt tricks, tag cheat sheets, and models reference (ES/EN)

## License

[CC0 1.0 Universal](LICENSE) for this repository. Individual projects may carry
their own licenses — check each project's `LICENSE` file.
