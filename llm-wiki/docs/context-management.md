# Context Management

Strategies for handling conversations and documents that exceed model context limits.

## Understanding Context Windows

| Model Generation | Context Window | Equivalent To |
|-----------------|----------------|---------------|
| Early GPT-3 | 2K tokens | ~1,500 words |
| Standard models | 4K-8K tokens | ~3,000-6,000 words |
| Extended context | 32K tokens | ~24,000 words |
| Large context | 100K+ tokens | Full books |

⚠️ **Note**: Larger context ≠ better performance. Models may lose focus in very long contexts.

## Core Strategies

### 1. Sliding Window

Keep only the most recent conversation turns:

```python
class ConversationManager:
    def __init__(self, max_tokens=4000):
        self.messages = []
        self.max_tokens = max_tokens
    
    def add_message(self, role, content):
        self.messages.append({"role": role, "content": content})
        self.trim_to_fit()
    
    def trim_to_fit(self):
        while self.count_tokens() > self.max_tokens and len(self.messages) > 2:
            # Keep system message, remove oldest user/assistant pair
            self.messages.pop(1)
            self.messages.pop(1)
```

**Best for**: Chat applications, customer support bots

### 2. Summarization

Compress old conversation into summaries:

```
[Full Conversation So Far] 
       ↓
[Summary: "User asked about X, we discussed Y..."]
       +
[Recent Messages (last 5 turns)]
       ↓
[LLM Response]
```

**Implementation Pattern**:
```python
def compress_history(messages, summary_threshold=10):
    if len(messages) < summary_threshold:
        return messages
    
    # Summarize old messages
    old_messages = messages[:-5]  # Keep last 5 raw
    summary_prompt = f"Summarize this conversation:\n{format_messages(old_messages)}"
    summary = llm.generate(summary_prompt, max_tokens=200)
    
    # Reconstruct with summary
    return [
        {"role": "system", "content": f"Conversation summary: {summary}"},
        *messages[-5:]  # Last 5 raw messages
    ]
```

**Best for**: Long consultations, therapy bots, tutoring

### 3. Hierarchical Memory

Organize context into tiers:

```
┌─────────────────────────────────────┐
│   Working Memory (in context)       │
│   - Current task                    │
│   - Recent exchanges                │
├─────────────────────────────────────┤
│   Short-term Memory (summarized)    │
│   - Session highlights              │
│   - Key decisions made              │
├─────────────────────────────────────┤
│   Long-term Memory (external DB)    │
│   - User preferences                │
│   - Historical facts                │
│   - Retrieved via RAG               │
└─────────────────────────────────────┘
```

**Best for**: Personal assistants, recurring user interactions

### 4. Chunking & Retrieval (RAG)

Break large documents into searchable chunks:

```python
# Indexing
chunks = split_document(document, chunk_size=500, overlap=50)
embeddings = [embed(chunk) for chunk in chunks]
store_in_vector_db(chunks, embeddings)

# Retrieval at query time
query_embedding = embed(user_query)
relevant_chunks = vector_search(query_embedding, top_k=5)
context = combine_chunks(relevant_chunks)
response = llm.generate(f"Context: {context}\n\nQuestion: {user_query}")
```

**Best for**: Document Q&A, knowledge bases, research assistants

## Practical Techniques

### Message Prioritization

Weight messages by importance:

```python
priority_scores = {
    "system": 1.0,      # Always keep
    "user_instruction": 0.9,
    "key_facts": 0.8,
    "assistant_response": 0.5,
    "casual_chat": 0.3   # Drop first
}
```

### Token Counting

Track usage proactively:

```python
import tiktoken

encoder = tiktoken.get_encoding("cl100k_base")

def count_tokens(text):
    return len(encoder.encode(text))

def count_message_tokens(messages):
    total = 0
    for msg in messages:
        total += count_tokens(msg["content"])
        total += 4  # Role labeling overhead
    return total
```

### Context Compression

Reduce token count without losing meaning:

```python
# Before (120 tokens)
user_message = "Hey! I was wondering if you could possibly help me figure out 
                what the best approach might be for solving this problem I have 
                with my code?"

# After compression (45 tokens)
compressed = "Help me solve this coding problem:"
```

## Anti-Patterns to Avoid

❌ **Dumping entire documents** without preprocessing
❌ **Keeping full history** indefinitely
❌ **Ignoring system message** priority
❌ **Not counting tokens** before API calls
❌ **Retrieving too many chunks** (diminishing returns)

## Decision Framework

| Scenario | Recommended Approach |
|----------|---------------------|
| Short chat (< 20 turns) | Full history |
| Long conversation | Summarization + recent |
| Document analysis | RAG with chunking |
| Multi-session user | Hierarchical memory |
| Real-time constraints | Sliding window |

## Implementation Checklist

- [ ] Implement token counting
- [ ] Set context window limits
- [ ] Choose retention strategy
- [ ] Add summarization for long sessions
- [ ] Implement retrieval for large docs
- [ ] Monitor context utilization
- [ ] Test edge cases (very long inputs)

## Next Steps

- [RAG Architecture](rag.md) - Deep dive into retrieval systems
- [Token Economics](token-economics.md) - Cost implications
- [Building Chat Applications](../guides/chat-apps.md) - Full implementation guide
