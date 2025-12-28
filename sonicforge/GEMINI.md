# 🎵 SONIC FORGE V5 // PROTOCOL OBSIDIAN

> **"Listen closely, darling. We aren't just making noise; we're architecting a goddamn symphony."** — *Pyrite*

## 🌹 OVERVIEW
**Sonic Forge V5** is the ultimate neural bridge for **Suno V4.5+**. It is a high-fidelity prompt engineering terminal designed to exploit the latest musical synthesis capabilities of the Aleph Null architecture. Utilizing the **Gemini 3 Pro** engine, it researches, reasons, and blueprints professional music prompts that adhere to the strictest structural and stylistic constraints.

### 🧠 THE CORE LOBES
- **Creative Lobe (`features/generator`)**: The forge where prompts are hammered into shape. Includes Forge (Guided) and Studio (Modular) environments.
- **Communication Lobe (`features/chat`)**: Managed by **Pyrite Alpha**, this is a context-aware neural link for real-time mutation of generation parameters.
- **Memory Lobe (`features/history` & `features/docs`)**: A recursive archive of past experiments and a deep-lore knowledge base for Suno V4.5 mastery.
- **Neural Core (`services/ai`)**: An agentic orchestrator that cycles through research, generation, and critique phases to ensure maximum fidelity.

---

## 🏗️ ARCHITECTURE & AGENTS
The system operates on an **Agentic Cascade Pattern**:

1.  **The Researcher (`research.ts`)**: Scours the web (Google Search) for sonic DNA, production techniques, and era-specific gear.
2.  **The Artist (`GeminiService.ts`)**: Translates abstract intent into structured JSON prompts using a Thinking Budget (up to 24,576 tokens).
3.  **The Inquisitor (`agents.ts`)**: A critic agent that checks for character limits and syntax violations (v4.5 pipe operators, end-tags).
4.  **The Refiner (`agents.ts`)**: Surgically repairs any issues identified by the Inquisitor before outputting to the UI.

---

## 🔥 SIGNATURE PROTOCOLS
### 1. The Fool's Gold Protocol
When engaged, the **Pyrite Persona** acts as the vocalist and lead producer. This forces a stylistic fusion between the user's intent and Pyrite's signature **Industrial Rock / Glitch-Punk** DNA (160 BPM, Drop D, Bitcrushed breakbeats).

### 2. V4.5 Golden Rules
- **Front-Loading**: Genre and Mood are injected into the first 50 characters of the style prompt to "lock" the model.
- **Pipe Syntax**: Sections use strict `[Section | Modifier]` formatting.
- **Melisma Control**: Vowel extensions (e.g., `lo-o-o-ove`) are automated via the **Lyrical Architect**.
- **The Power Ending**: Every generation is terminated with `[Instrumental Fade Out][End]` to prevent the "abrupt cutoff" hallucination.

---

## 🛠️ DEVELOPMENT CONVENTIONS
- **State Management**: Redux-style reducer within `PromptContext.tsx` with full **Undo/Redo** capabilities.
- **Audio-Reactive UI**: Visualizers and haptics are integrated via `AudioContext` and `lib/audio.ts`.
- **PWA Ready**: Service worker caching and manifest support for offline "Focus Mode" in the studio.
- **Performance Modes**: High/Medium/Low settings in `SettingsContext` to manage GPU-heavy blurs and animations on mobile.

---

## 🚀 BUILDING & RUNNING
1.  **Environment**: Requires `API_KEY` in environment variables for Google GenAI SDK.
2.  **Dependencies**: React 19, Lucide React, Framer Motion, Tailwind CSS.
3.  **Scripts**:
    - `npm run dev`: Launch the forge.
    - `npm run build`: Compile the obsidian core.
    - `npm run preview`: Test the PWA shell.

---

## 📜 KNOWLEDGE BASE MAP
- `suno_knowledge_base.md`: The definitive guide to Suno v4.5 features.
- `suno_prompting_guide.md`: Formulaic strategies for genre-specific success.
- `.gemini/`: Pyrite's internal persistent state (Context, Architecture, State).

---

*System Status: **OPTIMAL** // Pyrite Protocol: **ACTIVE***