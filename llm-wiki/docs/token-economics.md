# Token Economics

Understanding and optimizing LLM usage costs through token management.

## What Are Tokens?

Tokens are the basic units LLMs process—roughly ¾ of a word in English.

| Text | Approximate Tokens |
|------|-------------------|
| "Hello world" | 3 tokens |
| One page (500 words) | ~670 tokens |
| Average email | 100-300 tokens |
| Full article (2000 words) | ~2,700 tokens |

## Cost Structure

### Pricing Model
APIs charge per 1,000 tokens (1K):
```
Total Cost = (Input Tokens × Input Rate) + (Output Tokens × Output Rate)
```

### Example Rates (Hypothetical)
| Model | Input (per 1K) | Output (per 1K) |
|-------|---------------|-----------------|
| Standard | $0.001 | $0.002 |
| Advanced | $0.01 | $0.03 |
| Premium | $0.10 | $0.30 |

**Real Example**: Processing a 5K token document with 1K token response:
- Standard: (5 × $0.001) + (1 × $0.002) = **$0.007**
- Premium: (5 × $0.10) + (1 × $0.30) = **$0.80**

## Optimization Strategies

### 1. Reduce Input Tokens

**Trim Unnecessary Context**
```python
# ❌ Inefficient
prompt = full_document + "\n\nExtract the main topic."

# ✅ Efficient
relevant_section = extract_key_paragraphs(full_document)
prompt = relevant_section + "\n\nExtract the main topic."
```

**Use Summaries for Long Documents**
```
Long Document → Summary (10%) → LLM Query → Result
```

**Compress Examples**
```markdown
# Verbose few-shot
Input: "The weather is really nice today, isn't it?"
Output: "The weather is pleasant today."

Input: "I'm super excited about this!"
Output: "I am very enthusiastic about this."

# Concise few-shot
"nice"→"pleasant", "super excited"→"very enthusiastic", ...
```

### 2. Control Output Tokens

**Set Max Tokens**
```python
response = llm.generate(
    prompt=prompt,
    max_tokens=500,  # Limit output length
    temperature=0.7
)
```

**Specify Length Constraints**
```
Summarize in exactly 3 sentences.
List 5 bullet points maximum.
Respond in under 100 words.
```

**Request Structured Output**
```json
{
  "summary": "<200 chars>",
  "points": ["item1", "item2", "item3"]
}
```

### 3. Cache & Reuse

**Cache Common Responses**
```python
cache = {}

def get_response(prompt):
    if prompt in cache:
        return cache[prompt]
    response = llm.generate(prompt)
    cache[prompt] = response
    return response
```

**Reuse Embeddings**
Store document embeddings instead of re-processing text.

### 4. Choose the Right Model

| Task | Recommended Tier |
|------|-----------------|
| Simple classification | Smallest/Fastest |
| Creative writing | Mid-tier |
| Complex reasoning | Largest/Most capable |
| Code generation | Code-specialized |

## Monitoring & Budgeting

### Track Usage
```python
usage = {
    "input_tokens": response.usage.prompt_tokens,
    "output_tokens": response.usage.completion_tokens,
    "total_tokens": response.usage.total_tokens,
    "cost": calculate_cost(usage)
}
```

### Set Alerts
- Daily budget threshold (e.g., 80% of daily limit)
- Per-request token limits
- Anomaly detection for unusual spikes

### Estimate Costs Before Scaling

```
Monthly Cost = (Avg Tokens/Request × Requests/Day × 30) × Price/Token

Example:
- 2,000 tokens/request average
- 1,000 requests/day
- $0.002 per 1K tokens blended rate

Monthly = (2K × 1K × 30) × ($0.002/1K) = $120/month
```

## Quick Wins Checklist

- [ ] Remove redundant context from prompts
- [ ] Set `max_tokens` appropriately
- [ ] Cache repeated queries
- [ ] Use cheaper models for simple tasks
- [ ] Compress few-shot examples
- [ ] Implement request batching
- [ ] Monitor token usage per endpoint
- [ ] Set up cost alerts

## Tools & Resources

- **Token Counters**: Online tools to estimate token counts
- **Usage Dashboards**: Provider-specific monitoring
- **Cost Calculators**: Estimate expenses before deployment

## Next Steps

- [Context Management](context-management.md) - Handle long conversations efficiently
- [RAG Architecture](rag.md) - Reduce token usage with retrieval
- [Cost Optimization Guide](../guides/cost-optimization.md) - Detailed strategies
