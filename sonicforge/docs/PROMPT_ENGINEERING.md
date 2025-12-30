# Prompt Engineering & AI Logic (v8.0 Neural Ascension)

The application uses a sophisticated chain-of-thought process to generate high-quality prompts for Suno V4.5. As of V8.0, this logic is modular and decoupled from the execution service.

## 1. Modular Prompt Architecture (V8.0)
System prompts are now constructed from atomic blocks located in `services/ai/prompts/`.

### Directory Structure
- `services/ai/prompts/system.ts`: The "Identity Matrix". Defines WHO the AI is (Standard vs. Pyrite) and the strict Syntax Rules (Brackets vs. Parentheses).
- `services/ai/prompts/tasks.ts`: The "Mission Profiles". Contains the template strings for specific actions (Generation, Expert Mode, Critique, Refinement).
- `services/ai/prompts/examples.ts`: The "Academy". A repository of few-shot examples (good JSON outputs) injected into the context window to guide the model.

### Core Components
- **IDENTITY_BLOCK**: Defines the AI's personality.
- **SYNTAX_BLOCK**: Hard-coded rules for `[]` vs `()` usage.
- **CONSTRAINTS_BLOCK**: Technical limits (1000 chars, JSON output).
- **NEGATIVE_CONSTRAINTS_BLOCK**: Explicit bans (No markdown, no "AI" tags).
- **KNOWLEDGE_BASE_BLOCK**: Dynamic insertion of genre-specific terms and production techniques.

## 2. Adaptive Thinking Budget
To optimize performance and token usage, the **Gemini 3 Pro** thinking budget is dynamically adjusted:
- **Instrumental Mode (16k tokens)**: Lower complexity required.
- **Standard Custom Mode (24k tokens)**: Balanced budget.
- **Expert Mode / Complex Intent (32k tokens)**: Maximum budget.

## 3. Generation Pipeline (Updated)

1.  **Intent Analysis**: The user's input is analyzed.
2.  **Context Injection (Few-Shot)**: The system selects relevant JSON examples from `prompts/examples.ts`.
3.  **Prompt Assembly**: `GENERATE_SUNO_PROMPT` combines Intent, Research, and Examples.
4.  **Deep Reasoning**: Gemini 3 Pro evaluates the best structure.
5.  **Agentic Critique (The Inquisitor)**: A second pass verifies compliance with Suno limits.
6.  **Refinement**: If the Inquisitor fails the prompt, The Refiner fixes specific issues.
7.  **Post-Processing**: Regex sanitizers finalize the output.

## 4. Suno V4.5 Constraints & Quota Strategy
The AI is hard-coded to respect the following limits and aggressively targets the upper bounds for descriptive fields:
- **Title**: Max 80 chars.
- **Tags**: Max 1000 chars (Target: 950-990 chars).
- **Style**: Max 1000 chars (Target: 950-990 chars).
- **Lyrics**: Max 5000 chars.

## 5. Structural Mandates
To ensure songs feel "complete", the logic forces:
1.  **[Intro]**: 4-8 bars to set the mood.
2.  **[Pre-Chorus]**: Tension builders before hooks.
3.  **[Outro]**: A defined ending or fade-out.
