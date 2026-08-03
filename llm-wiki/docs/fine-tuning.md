# Fine-tuning vs Prompting

Choosing the right approach for customizing LLM behavior.

## Quick Decision Guide

| Use Prompting When | Use Fine-tuning When |
|-------------------|---------------------|
| Task is well-defined | Need consistent style/format |
| Few examples suffice | Have 100+ training examples |
| Requirements change often | Task is stable long-term |
| Budget is limited | Can invest in training |
| Need quick iteration | Latency matters at scale |

## Prompting (In-Context Learning)

### Advantages
✅ **Fast**: No training required
✅ **Flexible**: Change behavior instantly
✅ **Cost-effective**: Pay only per use
✅ **No data prep**: Use examples directly

### Limitations
❌ **Limited by context window**
❌ **Inconsistent results** with complex tasks
❌ **Higher per-request cost** at scale
❌ **Example quality varies**

### Best Practices

```python
# Zero-shot (simplest)
prompt = "Classify sentiment: 'I love this product!'"

# Few-shot (better accuracy)
prompt = """
Text: 'Amazing experience!' → Positive
Text: 'Terrible service.' → Negative  
Text: 'It was okay.' → Neutral
Text: 'Best purchase ever!' →
"""

# With reasoning (best for complex tasks)
prompt = """
Q: John has 5 apples, buys 3 more, gives away 2. How many left?
A: Let's think step by step:
   - Start: 5 apples
   - Buys 3: 5 + 3 = 8
   - Gives 2: 8 - 2 = 6
   Answer: 6 apples

Q: Sarah reads 10 pages/day for a week. Total pages?
A: Let's think step by step:
"""
```

## Fine-tuning

### What It Does

Adjusts model weights on your specific data to:
- Learn domain-specific language
- Adopt consistent formatting
- Reduce prompt length needed
- Improve task accuracy

### When to Fine-tune

**Good Candidates:**
- Customer support responses (brand voice)
- Code generation (your codebase patterns)
- Medical/legal document analysis
- Consistent JSON output formats
- Multi-step workflows

**Poor Candidates:**
- One-off tasks
- Rapidly changing requirements
- Tasks needing external knowledge (use RAG instead)
- Limited training data (<50 examples)

### Fine-tuning Process

```python
# 1. Prepare training data
training_data = [
    {
        "messages": [
            {"role": "system", "content": "You are a helpful coding assistant."},
            {"role": "user", "content": "Write a Python function to sort a list"},
            {"role": "assistant", "content": "def sort_list(lst):\n    return sorted(lst)"}
        ]
    },
    # ... 100+ more examples
]

# 2. Upload and train (provider-specific)
# OpenAI example:
# job = client.fine_tuning.jobs.create(
#     training_file="file-abc123",
#     model="gpt-3.5-turbo"
# )

# 3. Use fine-tuned model
response = llm.generate(
    model="ft-your-model-abc123",
    messages=[{"role": "user", "content": "Sort this: [3,1,2]"}]
)
```

### Data Requirements

| Model Size | Minimum Examples | Recommended |
|------------|-----------------|-------------|
| Small (1B) | 50 | 200-500 |
| Medium (7B) | 100 | 500-1000 |
| Large (70B+) | 200 | 1000-5000 |

### Cost Comparison

**Scenario**: 10,000 classification requests/month

| Approach | Setup Cost | Monthly Cost | Total/Year |
|----------|-----------|--------------|------------|
| Prompting (few-shot) | $0 | $50 | $600 |
| Fine-tuning | $20 | $15 | $200 |
| Fine-tuning (at scale) | $20 | $5 | $80 |

*Fine-tuning becomes economical at ~5K+ requests/month*

## Hybrid Approaches

### Fine-tune + Prompt

Use fine-tuning for base behavior, prompting for specifics:

```python
# Fine-tuned model learns your format
# Prompt provides task-specific context

model = "ft-company-format-abc123"

prompt = f"""
Analyze this customer feedback using our standard framework:

Feedback: "{feedback_text}"

Provide analysis in our standard JSON format."""
```

### Fine-tune + RAG

Combine fine-tuned style with retrieved knowledge:

```
Fine-tuned Model (learns format/style)
         +
RAG System (provides current facts)
         ↓
Accurate, On-brand Responses
```

## Evaluation Framework

Test both approaches on your use case:

```python
def compare_approaches(test_cases, base_model, fine_tuned_model):
    results = {
        "prompting": {"accuracy": [], "latency": [], "cost": []},
        "fine_tuning": {"accuracy": [], "latency": [], "cost": []}
    }
    
    for case in test_cases:
        # Test prompting
        prompt_response = query_with_prompting(base_model, case)
        results["prompting"]["accuracy"].append(
            evaluate_output(prompt_response, case.expected)
        )
        
        # Test fine-tuned
        ft_response = query_fine_tuned(fine_tuned_model, case)
        results["fine_tuning"]["accuracy"].append(
            evaluate_output(ft_response, case.expected)
        )
    
    return calculate_metrics(results)
```

## Common Mistakes

### Prompting Mistakes
❌ Too few examples (use 3-5 minimum)
❌ Inconsistent example quality
❌ No output format specification
❌ Ignoring token costs

### Fine-tuning Mistakes
❌ Too little training data
❌ Poor quality examples
❌ Not validating on held-out data
❌ Expecting it to learn facts (use RAG)

## Decision Matrix

```
                    ┌─────────────────┬──────────────────┐
                    │  Simple Task    │  Complex Task    │
        ┌───────────┼─────────────────┼──────────────────┤
        │ < 1K reqs │    Prompting    │    Prompting     │
  Volume├───────────┼─────────────────┼──────────────────┤
        │ > 10K reqs│    Either       │   Fine-tuning    │
        └───────────┴─────────────────┴──────────────────┘
```

## Recommendations

**Start with Prompting:**
1. Build working prototype
2. Gather usage data
3. Identify pain points

**Consider Fine-tuning If:**
- Consistency issues persist
- Prompts exceed 50% of context window
- Monthly API costs > $500
- Latency is critical

**Always Consider RAG for:**
- Factual queries
- Private data access
- Frequently updated information

## Next Steps

- [Prompt Engineering](prompt-engineering.md) - Master prompting techniques
- [RAG Architecture](rag.md) - For knowledge-intensive tasks
- [Cost Optimization](../guides/cost-optimization.md) - Reduce expenses either way
