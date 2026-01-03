# Create Spec

**Command:** `/spec [NAME]`
**Example:** `/spec track-5` or `/spec new-album`

---

## Purpose

Create a written specification before executing work. The spec captures requirements, constraints, and acceptance criteria — ensuring alignment before effort is invested.

---

## When to Use

**REQUIRED for:**
- New album/project creation
- New track (first-time generation)
- Feature requests or changes
- Any work with style deviations
- Ambiguous or open-ended requests

**NOT required for:**
- Simple revisions (user-directed changes)
- WANDA mode requests (user explicitly bypasses)
- Status checks, QC reviews

---

## Workflow

### Step 1: Gather Information

Before writing the spec, conduct an interview if not already done:

```
INTERVIEW QUESTIONS:
1. What is the deliverable? (track, album, feature, etc.)
2. What constraints apply? (BPM, style, language, content limits)
3. Any exceptions to standard rules? (document explicitly)
4. What does "done" look like? (acceptance criteria)
5. Any references or inspiration? (mood, energy, existing tracks)
```

### Step 2: Write Spec to Disk

Create spec file at:
```
[PROJECT]/00_admin/specs/SPEC_[name].md
```

Use the template from `templates/SPEC_TEMPLATE.md`

### Step 3: Present Summary

After writing the spec, present a summary to the user:

```
=== SPEC CREATED ===

📄 File: 00_admin/specs/SPEC_[name].md

SUMMARY:
- Deliverable: [what]
- Constraints: [key limits]
- Exceptions: [any deviations from standard]
- Acceptance: [how we know it's done]

Ready to proceed? Say "approve" or "proceed" to begin execution.
Or request changes before approving.
```

### Step 4: Await Approval

**DO NOT execute until user explicitly approves.**

Valid approval phrases:
- "approve"
- "proceed"
- "go ahead"
- "looks good"
- "yes"

If user requests changes:
1. Update the spec file
2. Re-present summary
3. Await approval again

---

## Spec File Structure

```markdown
# SPEC: [Name]

**Created:** [date]
**Status:** Draft | Approved | In Progress | Complete
**Approved By:** [user confirmation]

---

## Deliverable

[What will be produced]

## Constraints

| Constraint | Value | Source |
|------------|-------|--------|
| BPM | [range] | MASTER_STYLE_GUIDE |
| Style | [description] | [source] |
| Language | [language] | [source] |
| Content | [limits] | COMPLIANCE_AND_SAFETY |

## Exceptions

[Any deviations from standard rules — MUST be explicit]

- Exception 1: [what and why]
- Exception 2: [what and why]

(If none: "No exceptions. Standard rules apply.")

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## References

- [MASTER_STYLE_GUIDE.md](../../../docs/MASTER_STYLE_GUIDE.md)
- [COMPLIANCE_AND_SAFETY.md](../../../docs/COMPLIANCE_AND_SAFETY.md)
- [TRACKLIST.md](../TRACKLIST.md)

## Approval Log

| Date | Action | By |
|------|--------|-----|
| [date] | Created | Claude |
| [date] | Approved | [user] |
```

---

## Integration with Other Commands

| After `/spec` | Next Command |
|---------------|--------------|
| Track spec approved | `/track N` or `WANDA: Prompt Track N` |
| Album spec approved | Create folder structure, then `/track 1` |
| Feature spec approved | Implement as specified |

---

## Error Handling

| Situation | Response |
|-----------|----------|
| User says "just do it" | Acknowledge bypass, proceed without spec |
| User says "WANDA:" | WANDA mode activated, no spec needed |
| Spec exists but not approved | Remind user to approve before execution |
| Scope change mid-execution | Pause, update spec, re-approve |

---

## Guardrails

1. **Never execute non-trivial work without a spec** (unless explicitly bypassed)
2. **Never assume approval** — wait for explicit confirmation
3. **Always write spec to disk** — not just in conversation
4. **Always reference compliance docs** — never skip safety checks
5. **Log approval with timestamp** — for audit trail
