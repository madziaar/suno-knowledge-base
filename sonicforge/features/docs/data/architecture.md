
# THE CONSTRUCT: SYSTEM ARCHITECTURE (V7.0 AETHER)

This document outlines the high-level architecture of the Sonic Forge V5 application, focusing on its design patterns, agentic workflow, and core principles.

---

## 1. CORE PRINCIPLE: AGENTIC ORCHESTRATION

The system is not a monolithic AI call. It is a multi-step, agentic pipeline designed to ensure maximum fidelity and reliability. Each agent has a specialized role, passing its output to the next in a cascade.

**The Workflow:**
1.  **User Input**: The user provides a song concept in the UI.
2.  **Agent: The Researcher**: (`runResearchAgent`) Scours the web via Google Search for sonic DNA related to artist references or complex genres. This phase is critical for grounding the AI in real-world audio engineering techniques.
3.  **Agent: The Artist**: (`generateSunoPrompt`/`generateExpertPrompt`) The primary creative engine. It takes the user input and the Researcher's findings, synthesizes them through a "Thinking Mode" pass, and architects the final JSON prompt.
4.  **Agent: The Inquisitor**: (`runCriticAgent`) A fast, low-cost QA agent. It checks the Artist's output for violations of Suno's constraints (character limits, syntax errors, formatting).
5.  **Agent: The Refiner**: (`runRefinerAgent`) If the Inquisitor finds flaws, this agent is activated. It receives the flawed prompt and the list of issues, then surgically corrects them.
6.  **UI Output**: The final, validated, and refined JSON is displayed to the user.

---

## 2. GROUNDING LAYER (VERIFIED ANCHORS)

To prevent AI "drift" and ensure technical accuracy, the system implements **Search Grounding**.
- **Data Extraction**: The Researcher agent extracts real-time metadata from verified audio engineering journals and production archives.
- **Source Verification**: Grounding chunks are returned from the API, allowing the system to verify the legitimacy of its stylistic choices.
- **UI Reflection**: Verified sources are displayed in the `StatusLog` as "Neural Anchors", giving the user transparency into the AI's "thought process."

---

## 3. RELIABILITY: MODEL FALLBACK CASCADE

To handle API quota limits or server errors, the generation process uses a sequential model fallback system (`executeGenerationCascade`).

1.  **Primary Attempt (Pro)**: The initial request is sent to `gemini-3-pro-preview`, leveraging its superior reasoning and deep thinking budget for complex tasks.
2.  **Secondary Fallback (Flash)**: If the Pro model fails for any reason, the system automatically retries with `gemini-2.5-flash`.
3.  **Emergency Fallback (Lite)**: A final attempt is made with `gemini-2.5-flash-lite` for simple tasks.

This cascade is wrapped in a **Circuit Breaker** (`globalCircuitBreaker`) which will temporarily halt requests if multiple consecutive failures occur.
