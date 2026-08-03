# Prompt Engineering

The art and science of crafting inputs to get optimal outputs from LLMs.

## Core Principles

### 1. Clarity & Specificity
❌ **Vague**: "Write something about AI"
✅ **Specific**: "Write a 300-word blog intro explaining how transformer models revolutionized NLP in 2017"

### 2. Role Assignment
Give the model a persona to shape its response style:
```
You are an expert Python developer with 10 years of experience. 
Explain async/await patterns to a junior developer.
```

### 3. Context Provision
Provide relevant background information:
```
Context: We're building a music generation app for indie artists.
Task: Suggest 5 features that would help users create radio-ready tracks.
```

## Prompt Patterns

### Zero-Shot Prompting
Direct request without examples:
```
Translate to French: "Hello, how are you?"
```

### Few-Shot Prompting
Provide examples to demonstrate the pattern:
```
Convert these to formal business language:

Input: "hey, wanna meet tomorrow?"
Output: "Would you be available for a meeting tomorrow?"

Input: "this is broken, fix it"
Output: "Could you please address this issue when convenient?"

Input: "send me the files"
Output: "Please forward the documents at your earliest convenience."

Input: "what's the deal with the budget?"
Output:
```

### Chain-of-Thought (CoT)
Encourage step-by-step reasoning:
```
Q: A bat and ball cost $1.10 together. The bat costs $1 more than the ball. How much does the ball cost?

Let's think through this step by step:
1. Let x = cost of ball
2. Then x + 1 = cost of bat
3. Total: x + (x + 1) = 1.10
4. Simplify: 2x + 1 = 1.10
5. Subtract 1: 2x = 0.10
6. Divide by 2: x = 0.05

The ball costs $0.05.
```

### Tree-of-Thought
Explore multiple reasoning paths:
```
Consider three different approaches to solve this problem. 
For each approach, list pros and cons, then recommend the best option.
```

## Advanced Techniques

### Delimiters
Use clear boundaries for different sections:
```
"""
Document: [paste document here]
"""

---

Extract all action items from the document above.
Format as a bulleted list with assignee and due date if mentioned.
```

### Output Formatting
Specify exact output structure:
```
Respond in JSON format:
{
  "summary": "...",
  "key_points": ["...", "..."],
  "sentiment": "positive|neutral|negative",
  "confidence": 0.0-1.0
}
```

### Constraint Setting
Define boundaries for the response:
```
- Maximum 200 words
- Use simple language (8th grade reading level)
- Include exactly 3 examples
- Do not mention competitors
```

### Iterative Refinement
Build complex outputs through conversation:
```
Turn 1: "Generate an outline for a tutorial on RAG systems"
Turn 2: "Expand section 3 with code examples"
Turn 3: "Add troubleshooting tips for common issues"
```

## Common Pitfalls

| Mistake | Solution |
|---------|----------|
| Too vague | Add specific constraints and context |
| Multiple tasks | Break into separate prompts |
| No examples | Use few-shot prompting |
| Unclear format | Specify output structure explicitly |
| Ignoring token limits | Chunk large inputs |

## Quick Reference Template

```markdown
# Role
[Define the AI's persona/expertise]

# Context
[Background information needed]

# Task
[Clear, specific instruction]

# Constraints
- [Constraint 1]
- [Constraint 2]

# Output Format
[Desired structure/format]

# Examples (optional)
[Input/Output pairs demonstrating pattern]
```

## Next Steps

- [Templates](../templates/system-prompts.md) - Ready-to-use prompt templates
- [Function Calling](../guides/function-calling.md) - Structured tool usage
- [Evaluation](../guides/evaluation.md) - Testing prompt effectiveness
