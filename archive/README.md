# Archive

Projects in this directory are no longer active. They were moved out of
[`projects/`](../projects) because they duplicated, superseded, or were absorbed
into an active project. Everything here is preserved in Git history regardless,
so nothing is lost.

## Contents

| Project | Archived because | Use instead |
|---------|------------------|-------------|
| [`coherence-system`](coherence-system) | ~81% byte-identical to `claude-ai-music-skills` (same v0.91.0 codebase, fewer CI files) | [`../projects/claude-ai-music-skills`](../projects/claude-ai-music-skills) |
| [`SUNO-AI-Music-Skills-codex`](SUNO-AI-Music-Skills-codex) | ~73% byte-identical; a Codex port of `claude-ai-music-skills` with minor variant docs (zh-CN README, `SKILL.md`, `AGENTS.md`) | [`../projects/claude-ai-music-skills`](../projects/claude-ai-music-skills) |

## Notes

- `claude-ai-music-skills` is the canonical copy — it contains the full
  plugin, `.claude-plugin`, `CLAUDE.md`, all CI workflows, and pre-commit
  config. The archived copies were triplicates of the same album-production
  pipeline (~15 MB each).
- If you need the Codex-specific variants (e.g. `README.zh-CN.md`,
  `使用说明.md`, `AGENTS.md`), they remain available in
  [`SUNO-AI-Music-Skills-codex`](SUNO-AI-Music-Skills-codex) here.
