
# User Guide (Pyrite's Sonic Forge V5)

> **Access Level**: Public
> **System**: Suno Enhanced Interface

## 1. Core Modes

### Custom Mode (Recommended)
This is the main forge. It gives you full control over the generation pipeline.
- **Lyric Source**:
    - *Generate from Scratch*: Enter a concept (e.g. "A cyberpunk ballad about a robot ghost"), and the AI will write the full song structure and lyrics.
    - *Use My Lyrics*: Paste your own raw text. Pyrite will **restructure** it (adding `[Verse]`, `[Chorus]`, `[Bridge]`), fix the rhythm/meter, and inject genre-appropriate ad-libs (e.g., `(yeah!)`).
- **Inputs**:
    - *Concept/Intent*: What is the song about?
    - *Style/Vibe*: Audio focused description (e.g. "Lo-fi hip hop, tape saturation").
    - *Artist Ref*: Enter a name like "Hans Zimmer" to pull real-world production data.

### Instrumental Mode
Optimized for non-vocal tracks.
- **Behavior**: It forces the `lyrics` output to only contain structural tags (e.g., `[Intro]`, `[Drop]`, `[Synth Solo]`).
- **Cost**: Uses a lower "Thinking Budget" to save tokens, as no narrative logic is needed.

### General Mode
Quick idea generation. Produces short, punchy prompts suitable for Suno's "Simple" tab.

---

## 2. Core Tools & Workflow

### The Lyrical Alchemy Lab (New)
Located inside the Expert Drawer (or via the "Magic Wand" in lyrics), this toolkit provides advanced Suno V4.5 techniques:
- **Melodic Tab**:
    - **Vowel Extension**: Drag the slider to generate melismatic text (e.g., `lo-o-o-ove`).
    - **Pitch Notation**: Click the piano keys to insert precise pitch guides (e.g., `(C#m)`).
- **Arrangement Tab**:
    - **Backing Vocals**: Generate echo, harmony, or call-and-response lines using proper parenthesis syntax.
    - **Inline Chords**: Insert chord progressions directly into lyrics.
- **Structure Tab**:
    - **Tag Optimizer**: Convert natural language (e.g., "fast sax solo") into optimized tags (`[sax][saxophone][solo]`).
    - **Quick Inserts**: One-click access to critical tags like `[Fade Out]`, `[Breakdown]`, and `[Silence]`.

### Draft Health Monitor (New)
A real-time quality assurance system that sits at the top of the Forge.
- **Score (0-100)**: Rates your current configuration based on Completeness, Specificity, and Balance.
- **Suggestions**: Offers dynamic advice (e.g., "Add BPM", "Specify Vocal Gender").
- **Conflict Detection**: Warns you if you mix incompatible styles (e.g., "Acoustic" + "Dubstep").

### The Template Library
Accessed via the **"Templates"** tab, this is the fastest way to start.
- **Browse**: Search and filter over 20 pre-built, verified genre templates.
- **Load**: Click **"Load Template"** on any card. This will instantly switch you to the Forge and pre-fill all the necessary fields.

---

## 3. Advanced Features

### History Comparator (New)
Located in the **Archives** tab.
1. Click the **Compare** button (top right).
2. Select any two history items.
3. Click **Compare Selection**.
4. View a side-by-side breakdown highlighting exactly which tags, style keywords, and lyrics changed between the two versions.

### Genre Optimization Tips (New)
When you select a specific genre in Expert Mode, a "Tips" panel will appear.
- It provides specific advice for that genre based on the Suno Knowledge Base.
- Example (Hip Hop): "Use 'Phonk Drum' tag for authentic beat texture."
- Example (Metal): "Use 'Double Kick Drum' for aggression."

### The Prompt Analysis Suite
- **Score Prompt**: A "Health Score" (0-100) on the Results Display assesses your prompt's completeness.
- **Batch Generator**: Brainstorm multiple alternative versions of your generated prompt with granular control.

### Audio Transmutation Hub (Alchemy Mode)
Switch the workflow toggle from **Generate** to **Transform** to access Alchemy tools.
1.  **Analyze Style (Sonic Mirror)**: Upload an MP3/WAV to reverse-engineer its style.
2.  **Add Vocals**: Upload an instrumental and generate lyrics/vocals.
3.  **Add Instrumentals**: Upload vocals and generate a backing track.
4.  **Inspire**: Generate a prompt based on a playlist vibe.

### Expert Protocol (Structure Builder)
For architects who want total control.
- **Features**:
    - **Genre Matrix**: Multi-select genre picker.
    - **Vocal Style Designer**: Detailed voice construction.
    - **Instrument Designer**: Granular instrument selection.
    - **Atmosphere Designer**: Texture and FX control.
    - **Structure Builder**: Drag-and-drop song sections.
    - **Custom Agent Persona**: Save and load custom AI identities.

### Export & Share Hub
- **Download**: Get your prompt as a `.txt`, `.json`, or `.md` file.
- **Neural Link**: Generate a shareable URL containing your entire prompt configuration.

---

## 4. Pyrite Mode (The Chaos Engine)
Toggle the **Ghost Icon** in the navbar to engage Pyrite Mode.
- **Visuals**: Theme shifts to Obsidian/Purple with glitch effects.
- **AI Persona**: The AI becomes unhinged, flirty, and opinionated.
- **Generations**: Tends towards more experimental and aggressive combinations.
