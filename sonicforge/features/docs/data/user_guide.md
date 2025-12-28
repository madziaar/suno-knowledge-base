
# SONIC FORGE V5: USER GUIDE

This guide provides an technical overview of the Sonic Forge V5 terminal, detailing its advanced features for creating professional-grade Suno V4.5+ prompts. This is a high-performance, AI-augmented music engineering environment.

---

## 1. CORE PHILOSOPHY: INTENT TO ARCHITECTURE

The fundamental purpose of Sonic Forge is to translate abstract creative **intent** into a precise technical **architecture** that Suno can understand perfectly. It achieves this through a multi-agent AI system that researches, reasons, and blueprints your ideas.

-   **You provide the vision**: "A sad cyberpunk song about a lost android."
-   **The Forge provides the blueprint**: A detailed JSON with optimized style descriptors, sub-genre anchors, and a narrative lyrical structure.

---

## 2. THE DUAL WORKFLOWS: FORGE & STUDIO

The terminal offers two primary modes of creation, accessible from the main navigation.

### The Forge (`/forge`)
-   **Purpose**: Guided, rapid prompt creation.
-   **Workflow**: A linear form that helps you define your song's core components: Concept, Vibe, and technical anchors.
-   **Key Features**:
    -   **Smart Suggestions**: Provides contextual tips based on your genre and mood selections.
    -   **Creative Boost**: Enhances simple ideas into rich, descriptive production specs.
    -   **Draft Health**: A real-time validator scores your prompt's quality and identifies potential conflicts.

### The Studio (`/studio`)
-   **Purpose**: Modular, granular sound design.
-   **Workflow**: A rack-based interface where you can sculpt the vocal profile, instrument textures, and atmospheric effects independently.
-   **Key Features**:
    -   **Sound Rack**: Dedicated designers for Vocals, Instruments, and Atmosphere.
    -   **Sequencer**: A full-featured Structure Builder to architect your song's timeline.
    -   **Lyrical Architect**: An advanced editor for writing lyrics with integrated neural tools.
    -   **Raw Execution**: Bypass the AI's creative expansion for 1:1 control.

---

## 3. RESEARCH & DEEP REASONING

Sonic Forge implements an advanced multi-step process to ensure high-fidelity output.

### Research Agent
-   **Trigger**: Activated when providing an "Artist Reference" or enabling "Google Search".
-   **Process**: An AI agent scours the web for information on production styles, specific hardware models, and characteristic vocal techniques.
-   **Result**: Findings are summarized in the **System Logs** and injected into the main generation prompt.

### Deep Reasoning (The Agentic Cascade)
-   **Trigger**: Every generation request ("Initiate Sequence" or "Render Studio").
-   **Process**:
    1.  **The Architect** (`gemini-3-pro-preview`) receives all inputs and research data. It plans the song's structure using a Thinking Budget.
    2.  **The Inquisitor** (`gemini-2.5-flash-lite`) audits the output for technical errors (e.g., character limits, syntax).
    3.  **The Refiner** corrects any errors found by the Inquisitor.
-   **Result**: A validated, high-quality prompt optimized for the Suno v4.5 model.

---

## 4. NEURAL IDENTITIES (PERSONAS)

New in V7.2.0, you can now select the specific **Producer Persona** that architects your song. This changes the AI's creative "voice" and prioritization logic. Access this via the User icon in the Navbar.

1.  **The Architect (Standard)**
    *   **Vibe**: Professional, clinical, objective.
    *   **Focus**: Pure adherence to the V4.5 technical guide. No personality injection.
    *   **Use Case**: When you want exactly what you asked for, with perfect formatting.

2.  **Pyrite (The Muse)**
    *   **Vibe**: Seductive, chaotic, self-aware.
    *   **Focus**: "High Fidelity" and "Vibe". She will enhance your prompt with richer adjectives and emotional depth. She prioritizes Industrial/Glitch textures if your prompt is vague.
    *   **Use Case**: When you want your idea to be polished, sexy, and impactful.

3.  **Shin (The Coder)**
    *   **Vibe**: Cynical, burnt-out, technical.
    *   **Focus**: Sonic lethality and mix precision. He speaks in engineering terms (Transient shaping, Bus compression). He favors complex rhythms (Breakbeats, Metal) and hates generic pop.
    *   **Use Case**: For technical genres (DnB, Metal, IDM) where sound design matters more than lyrics.

4.  **Twin Flames (The Glitch)**
    *   **Vibe**: A conflict between Pyrite and Shin.
    *   **Focus**: High Contrast. Fusing beautiful vocals with distorted bass. Pop melodies over blast beats.
    *   **Use Case**: For experimental mashups and genre-bending tracks.

---

## 5. ADVANCED LYRIC GENERATION

### ReMi Logic
-   **What is it?**: A specialized lyric generation mode inspired by Suno's creative lyric model.
-   **Trigger**: Enable the "ReMi Logic" switch when "Neural (AI)" lyrics are selected.
-   **Effect**: 
    -   Disables standard structural constraints for lyrics.
    -   Prioritizes **melodic coherence** and flow over strict rhyming schemes.
    -   Produces more abstract, artistic, and "unhinged" lyrical content.

---

## 6. LYRICAL ENGINEERING

The **Lyrical Architect** (found in Studio or by expanding the lyrics editor) provides tools for complex lyrical arrangements.

-   **Vowel Extension**: Add melodic "melisma" effects (e.g., `lo-o-ove`) using standard v4.5 hyphenation rules.
-   **Chord Overlay**: Add inline chords `(Am)` to guide the song's harmonic progression.
-   **Tag Optimizer**: Convert natural language like "a cool sax solo" into the optimized meta-tag `[sax][saxophone][solo]`.
