
# Pyrite's Sonic Forge (Suno V4.5)

An advanced, AI-powered music prompt generator optimized for Suno V4.5, driven by the chaotic and hyper-intelligent "Pyrite" persona.

## Overview

Pyrite's Sonic Forge is a web application designed to bridge the gap between creative intent and technical execution in AI music generation. It leverages Google's Gemini models to research artists, analyze intent, and structure professional-grade prompts that adhere strictly to Suno's character limits and tag systems.

## Key Features

- **Complete App Assembly (Protocol V53)**: The entire application is now fully assembled and integrated, providing a responsive, polished, and performant user experience across all devices.
- **State Management (Protocol V50)**: Comprehensive, modular state management using React Context API for Prompt, UI, History, and Settings. Includes **Undo/Redo** functionality for prompt building.
- **Multi-Model Intelligence**:
  - **Gemini 3 Pro Preview** for deep reasoning, structural logic, and prompt generation (Thinking Mode enabled).
  - **Gemini 2.5 Flash** for real-time web research on artists and genres, and multimodal audio analysis.
  - **Gemini 2.5 Flash-Lite** for low-latency tag enhancement, chat functions, and quick lyrical rewrites.
- **Riffusion Protocol**: Full Fuzz-1.1 support with a dedicated UI for Strength, Weirdness, Seed, and Model selection, plus specialized technical prompt generation. Includes Riffusion-specific validation.
- **Template Library**: A browsable, searchable "Templates" tab with over 20 pre-built, high-quality genre starters to bootstrap the creative process.
- **Sonic Mirror (Audio Analysis)**:
  - Upload MP3/WAV reference tracks (up to 10MB, 5 min).
  - Uses **Gemini 2.5 Flash Multimodal** capabilities to "listen" to the audio.
  - Reverse-engineers the BPM, Key, Instrumentation, and Production Style to populate the forge automatically.
- **Advanced Lyric Editor (The Lyrical Forge)**: The editor features:
  - Real-time linter with structural validation and suggestions.
  - Syntax highlighting for Suno meta tags, ad-libs, and chord notations.
  - AI rewrite tools: **Flow**, **Edgy**, **Rhyme**, **Vowel Extension** (`goo-o-o-odbye`), and **Chord Annotation** (`(Am)`).
  - **Rhyme Assistant**: Context-aware AI tool to suggest rhymes.
  - Auto-format (Pop, Hip Hop, EDM, Ballad) and fullscreen mode.
- **Expert Protocol (The Structure Builder)**:
  - **Genre Matrix**: Intuitive multi-select genre picker with categorized tabs, search, and dynamic BPM/Key recommendations.
  - **Vocal Style Designer**: Multi-dimensional interface for gender/voice type, vocal quality, delivery, and emotional tone.
  - **Instrument & Atmosphere Designer**: Granular control over primary instruments, modifiers, atmospheric textures, and sound effects.
  - **Lyrical Alchemy Lab**: Panel for vowel extension slider, background vocal helper, and chord annotation assistant (with piano keyboard UI).
  - Drag-and-drop song section builder with smart suggestions.
  - Story Arc templates (e.g., "Hero's Journey").
  - Custom Agent Persona management (save/load AI identities).
- **Prompt Analysis Suite (Protocol V52)**:
  - **Prompt Parser**: Deconstructs raw style strings into structured components.
  - **Lyric Analyzer**: Detects meta tags, counts sections, checks structure balance, estimates duration.
  - **Prompt Scorer**: Rates prompt quality (0-100), identifies missing elements, and suggests improvements.
  - **Prompt Comparer**: Highlights differences between two prompts (useful for A/B testing variations).
  - **Template Extractor**: Converts existing prompts into reusable templates.
- **Batch Generation Matrix (Protocol V48)**:
  - Base prompt input with variation count (1-10) and level (light/medium/heavy).
  - Constraint toggles (keep genre, keep structure, randomize mood/vocals) to guide AI brainstorming.
  - Comparison grid with quality scores, highlighted element differences, and selection checkboxes.
  - Batch export of selected variations.
- **Export & Share Hub (Protocol V51)**:
  - Format selector (plain text, JSON, Markdown) and batch export.
  - Copy-to-clipboard for individual fields or full prompts.
  - **Neural Link**: QR code generator and shareable URL for mobile transfer or collaboration.
  - Social media sharing buttons.
- **Neural Chat 2.0 (Pyrite Alpha)**: A context-aware chat assistant that can modify the prompt, load history, apply automated fixes, and debug prompts.
- **v4.5-all Free Tier Support**: Defaults to v4.5-all capabilities, including 8-minute song support and enhanced quality. UI indicators confirm active version.
- **Ghost Protocol (Offline PWA)**:
  - Fully installable as a native app on iOS, Android, and Desktop.
  - Offline access to History, Guide, Docs, and saved templates.
- **Bilingual UI**: Full support for English and Polish interfaces.

## Localization (New Protocol V57)
The application now supports full bilingual operations:
- **Language Switcher**: Toggle between English and Polish in the Settings modal.
- **Localized Validation**: Error messages, quality scores, and health checks respond in the selected language.
- **Dynamic HTML Attributes**: The `<html>` lang attribute updates dynamically for accessibility.
- **Localized Dialogs**: All confirmation prompts (reset, purge, delete) are translated.

## Upcoming Features (Protocol V53 - v4.5+ Integrations)
- **Add Vocals Workflow**: UI for uploading instrumentals and generating vocals.
- **Add Instrumentals Workflow**: UI for uploading vocals and generating backing tracks.
- **Inspire Feature Interface**: UI for generating songs from playlists.
- **Remaster Feature**: UI for upgrading old tracks to v4.5 quality.
- **Enhanced Covers**: UI for reimagining songs in different genres.
- **ReMi Lyrics Toggle**: Explicit toggle for the creative ReMi lyrics model.
- **Version Selector**: More detailed version selection with tier indicators.

## Quick Start

1.  **Access the App**: Open `index.html` via a local server or hosted environment.
2.  **Choose a Path**: 
   - Start from scratch in the **Forge**.
   - Browse the **Templates** tab to load a pre-built genre starter.
   - Use the **Import** button in the Forge to analyze an existing prompt.
3.  **Configure**:
   - **Sonic Mirror**: Drop an MP3 file to steal its vibe instantly.
   - **Artist Reference**: Type an artist name to fetch their production style.
   - **Lyric Source**: Let AI write lyrics or paste your own for restructuring.
4.  **Forge**: Click **INITIATE SEQUENCE**.
5.  **Copy/Download/Share**: Use the **Export & Share** hub to transfer the Title, Style, and Lyrics into Suno, download a `.txt` file, or generate a shareable Neural Link.

## Technologies

- React 19
- Google GenAI SDK
- Tailwind CSS
- Lucide React Icons
- Zod (for validation)
- Web Workers (for performance)
- Service Worker & PWA Manifest

## Directory Structure (Updated)

```text
.
├── config/              # Central Config
│   └── appConfig.ts
├── contexts/            # React Contexts (State)
│   ├── SettingsContext.tsx
│   ├── UIContext.tsx
│   ├── HistoryContext.tsx
│   └── PromptContext.tsx    
├── data/                # Static Data & Databases
│   ├── genreDatabase.ts
│   ├── genreTemplates.ts
│   ├── sunoMetaTags.ts
│   └── ... (other data files)
├── features/            # Feature Modules
│   ├── generator/       # Core Forge Logic
│   ├── chat/            # Neural Chat
│   ├── history/         # Archive System
│   └── templates/       # Template Explorer
├── services/
│   ├── ai/              # AI Service Layer
│   │   ├── GeminiService.ts # Main Service Class
│   │   ├── agents.ts        # Agent Logic
│   │   ├── classifier.ts    # Intent Classification
│   │   ├── tools.ts         # Helper Tools
│   │   └── ...
├── components/          # Shared UI Components
├── hooks/               # Custom React Hooks
├── lib/                 # Utilities
├── workers/             # Web Workers
└── types/               # TypeScript Definitions
```
