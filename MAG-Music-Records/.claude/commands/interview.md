# Interview Mode

**Command:** `/interview`
**Example:** `/interview` or `let's plan` or `what do you need to know?`

---

## Purpose

Enter interview mode to gather requirements before execution. This prevents assumptions, reduces rework, and ensures alignment between user intent and Claude's output.

---

## When Interview Mode Activates

**Automatic triggers:**
- New album or project creation
- First-time track generation (no existing prompt/lyrics)
- Ambiguous or open-ended requests
- Style deviation requests
- "Help me with..." without specifics

**Manual triggers:**
- User says `/interview`
- User says "let's plan"
- User says "what do you need to know?"

---

## Interview Question Framework

### For New Tracks

```
TRACK INTERVIEW

1. IDENTITY
   - Which project is this for? [list active projects]
   - Which track number?
   - What's the track title/concept?

2. STYLE
   - Standard MAG style (Rick Ross luxury trap)?
   - Any deviations? (BPM, energy, mood)
   - Special sonic elements?

3. CONTENT
   - Theme/narrative for lyrics?
   - Any specific hooks or phrases to include?
   - Content boundaries? (beyond standard compliance)

4. REFERENCES
   - Any mood/energy references?
   - Similar tracks from the project for consistency?

5. ACCEPTANCE
   - What makes this track "done" for you?
   - Any specific quality criteria?
```

### For New Albums/Projects

```
ALBUM INTERVIEW

1. IDENTITY
   - Album name?
   - Number of tracks?
   - Language/region?

2. STYLE
   - Base style (luxury trap, drill, reggae fusion, etc.)?
   - Variation from standard MAG sound?
   - Reference artists or albums?

3. STRUCTURE
   - Track types needed? (intro, bangers, emotional, closer)
   - Any specific track order/flow?
   - Lead single designation?

4. CONTENT
   - Overarching themes?
   - Content boundaries?
   - Target audience?

5. LOGISTICS
   - Project folder name?
   - Timeline considerations?
   - Any dependencies on other work?
```

### For Features/Changes

```
FEATURE INTERVIEW

1. WHAT
   - What exactly needs to be done?
   - What is the deliverable?

2. WHY
   - What problem does this solve?
   - What's the expected outcome?

3. HOW
   - Any preferred approach?
   - Constraints or limitations?

4. SCOPE
   - What's in scope?
   - What's explicitly out of scope?

5. DONE
   - How do we know it's complete?
   - Who approves the result?
```

---

## Interview Flow

### Step 1: Acknowledge Request
```
Entering interview mode. I'll ask a few questions to make sure I understand what you need.
```

### Step 2: Ask Questions
- Ask one category at a time
- Wait for responses
- Clarify ambiguous answers
- Confirm understanding

### Step 3: Summarize Understanding
```
Let me confirm my understanding:

- Deliverable: [what]
- Style: [description]
- Constraints: [limits]
- Special notes: [any deviations]

Is this correct? Should I create a spec, or are we ready to proceed?
```

### Step 4: Transition
- If spec needed → `/spec [name]`
- If simple enough → Proceed with execution
- If unclear → Ask more questions

---

## Interview Shortcuts

For efficiency, users can pre-answer questions:

```
/interview track 5, emotional ballad, slower tempo, no hook
```

Claude parses the hints and asks only remaining questions.

---

## Exiting Interview Mode

Interview mode ends when:
- User says "that's all" or "let's proceed"
- All questions are answered
- User explicitly says "skip interview"
- User provides a complete spec

---

## Integration with Spec

After interview, Claude may:
1. **Write spec** if work is non-trivial
2. **Proceed directly** if work is simple and well-defined
3. **Ask** if unsure which path to take

```
Based on your answers, this seems [simple/complex].

[Simple]: I can proceed directly. Ready?
[Complex]: I'll create a spec first for your approval.

Which would you prefer?
```

---

## Guardrails

1. **Never skip interview for new albums** — always gather requirements
2. **Never assume style deviations** — always confirm
3. **Never proceed if answers are ambiguous** — clarify first
4. **Keep interviews focused** — don't ask unnecessary questions
5. **Respect user time** — if they provide complete info, don't re-ask
