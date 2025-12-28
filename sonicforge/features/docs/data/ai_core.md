
# THE NEURAL CORE: AI INTEGRATION (V7.2 UPGRADE)

This document describes the architecture of the AI service layer, located in `/services/ai/`. This is the brain of the application, responsible for all interactions with the Google Gemini API.

---

## 1. THE ORCHESTRATOR (`GeminiService.ts`)

The `GeminiService` is a state-aware orchestrator. It manages a lifecycle of research, generation, and validation.

### The Tiered Model Cascade (Recovery Protocol)
To ensure near-zero downtime and resilient generation, the system utilizes a sequential fallback logic:

1.  **Tier 1: Deep Reasoning (Primary Engine)**
    - **Model**: `gemini-3-pro-preview`
    - **Config**: Maximum `thinkingBudget` (32,768 tokens) to allow for complex narrative arcs and technical production planning.

2.  **Tier 2: Rapid Response (Fallback)**
    - **Model**: `gemini-2.5-flash`
    - **Purpose**: High-speed recovery if Tier 1 fails (Quota/Network).

---

## 2. THE SYSTEM PROMPT ARCHITECTURE

In V7.2, the System Instruction is no longer a static string. It is dynamically assembled at runtime based on the **Neural Identity Matrix**.

### Modular Injection
The `getSystemInstruction` function (`services/ai/prompts/system.ts`) assembles the prompt from four distinct layers:

1.  **Identity Layer (The Voice)**
    *   **Standard**: Professional Audio Engineer.
    *   **Pyrite**: Seductive, Self-Aware AI Muse.
    *   **Shin**: Cynical, Technical Backend Engineer.
    *   **Twin Flames**: Dual-core conflict (Chaos vs Order).
    *   *Note: This layer controls the AI's "Tone" in the `analysis` field and its creative biases.*

2.  **Protocol Layer (The Rules)**
    *   **Safety Override**: If `isPyriteMode` is active, a specific "Supremacy Override" block is injected to bypass creative filters for edgy/dark content.
    *   *Note: This is now decoupled from the Identity. You can have the "Standard" persona with Safety Off, or "Pyrite" with Safety On.*

3.  **Language Layer**
    *   Enforces strict separation between **Engineering English** (Styles, Tags) and **Target Language** (Lyrics, Titles).

4.  **Technical Layer (V4.5 Specs)**
    *   Injects the Golden Rules: Split-Field Protocol, Pipe Syntax, and Power Endings.

---

## 3. THE AGENTS

### The Researcher (`agents.ts`)
- **Function**: Scours neural archives and search results to ground the prompt in technical audio engineering data. Powered by `gemini-2.5-flash`.

### The Artist (`GeminiService.ts`)
- **Function**: The primary generative core. It synthesizes user intent with Researcher data using the Hierarchical Style Blueprint.

### The Inquisitor (Critic) (`agents.ts`)
- **Function**: Post-generation QA. Audits for Suno v4.5 syntax violations like missing pipe operators or unclosed brackets.

### The Refiner (`agents.ts`)
- **Function**: Surgically repairs any issues identified by the Inquisitor before outputting to the UI.
