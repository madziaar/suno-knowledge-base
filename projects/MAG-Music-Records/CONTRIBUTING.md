# Contributing to MAG Music Records

## Large File Policy

### Prohibited Files (Auto-blocked by hooks)

**NEVER commit these file types:**

| Type | Extensions | Reason |
|------|------------|--------|
| Audio | `.wav`, `.mp3`, `.flac`, `.aiff`, `.m4a`, `.ogg` | Too large, use local storage |
| Video | `.mp4`, `.mov`, `.avi`, `.mkv` | Too large |
| Archives | `.zip`, `.rar`, `.7z`, `.tar.gz` | Unpredictable contents |
| Secrets | `.env`, `.pem`, `.key`, `credentials.*` | Security risk |

### If You Must Share Audio

1. **Upload to cloud storage** (Google Drive, Dropbox)
2. **Share link in relevant issue/PR**
3. **Never commit the file itself**

### File Size Guidelines

| File Type | Max Size | Action if Exceeded |
|-----------|----------|-------------------|
| Text/Markdown | 100 KB | Split into multiple files |
| Images (artwork) | 5 MB | Optimize/compress |
| Any single file | 10 MB | Do not commit, use cloud storage |

## Commit Guidelines

### Before Committing

1. Run hooks setup (one-time):
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
   ```

2. Verify no audio files staged:
   ```powershell
   git status
   ```

3. Check file sizes:
   ```powershell
   git diff --cached --stat
   ```

### Commit Message Format

```
[TYPE] Short description

- Detail 1
- Detail 2
```

**Types:**
- `[TRACK]` — Track-related changes (prompts, lyrics, metadata)
- `[DOCS]` — Documentation updates
- `[TEMPLATE]` — Template changes
- `[CONFIG]` — Configuration/hooks/scripts
- `[RELEASE]` — Release preparation

**Examples:**
```
[TRACK] Add Track 2 prompt and lyrics

- Created suno prompt for lead single
- Added verse/chorus structure
- Marked as explicit

[DOCS] Update workflow playbook

- Added QC checklist
- Clarified WANDA commands
```

## Branch Strategy

### Main Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, released content |
| `dev` | Active development |

### Feature Branches

```
feature/track-[N]-[name]
feature/docs-[topic]
fix/[issue-description]
```

**Examples:**
- `feature/track-02-lead-single`
- `feature/docs-strip-club-playbook`
- `fix/template-typo`

## Pull Request Process

1. Create feature branch from `dev`
2. Make changes
3. Verify hooks pass
4. Push branch
5. Create PR to `dev`
6. Merge after review

## Directory Ownership

| Directory | Owner | Purpose |
|-----------|-------|---------|
| `docs/` | Anyone | Documentation |
| `templates/` | Maintainers | Template standards |
| `projects/` | Anyone | Project work |
| `scripts/` | Maintainers | Automation |
| `.claude/` | Maintainers | Agent definitions |

## Questions?

Open an issue or check existing documentation in `docs/playbooks/`.
