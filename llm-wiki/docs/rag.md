# RAG Architecture (Retrieval-Augmented Generation)

Combining external knowledge retrieval with LLM generation for accurate, up-to-date responses.

## What is RAG?

RAG enhances LLMs by:
1. **Retrieving** relevant information from external sources
2. **Augmenting** the prompt with this context
3. **Generating** responses based on retrieved knowledge

```
User Query → Retrieve Relevant Docs → Combine Context + Query → LLM → Grounded Response
```

## Why Use RAG?

| Challenge | RAG Solution |
|-----------|-------------|
| Knowledge cutoff | Access current data |
| Hallucinations | Ground responses in facts |
| Private data | Keep sensitive info in your DB |
| Long documents | Retrieve only relevant chunks |
| Cost | Reduce prompt token count |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG System                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Document   │      │   Vector     │      │   LLM     │ │
│  │   Ingestion  │─────▶│   Database   │─────▶│ Generator │ │
│  │   Pipeline   │      │   (Index)    │      │           │ │
│  └──────────────┘      └──────▲───────┘      └─────▲─────┘ │
│                               │                      │       │
│                               │ Retrieval            │       │
│                               └──────────────────────┘       │
│                                      │                       │
│                                      ▼                       │
│                                 User Query                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Document Ingestion

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

# Load and split documents
def ingest_documents(documents):
    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " "]
    )
    chunks = splitter.split_documents(documents)
    
    # Create embeddings and store
    embeddings = OpenAIEmbeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )
    
    return vectorstore
```

### Step 2: Retrieval

```python
def retrieve_context(vectorstore, query, top_k=5):
    """Find most relevant document chunks"""
    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": top_k, "score_threshold": 0.7}
    )
    
    relevant_docs = retriever.get_relevant_documents(query)
    
    # Combine into single context string
    context = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
    
    return context, relevant_docs
```

### Step 3: Augmented Generation

```python
def generate_response(query, context, llm):
    """Generate answer using retrieved context"""
    
    prompt = f"""You are a helpful assistant. Use the following context to answer the question.
If the answer cannot be found in the context, say "I don't have enough information."

Context:
{context}

Question: {query}

Answer:"""
    
    response = llm.generate(prompt, max_tokens=500)
    return response
```

### Step 4: Complete RAG Pipeline

```python
class RAGSystem:
    def __init__(self, documents, llm):
        self.llm = llm
        self.vectorstore = ingest_documents(documents)
    
    def query(self, user_query):
        # Retrieve
        context, sources = retrieve_context(
            self.vectorstore, 
            user_query, 
            top_k=5
        )
        
        # Generate
        answer = generate_response(user_query, context, self.llm)
        
        # Return with citations
        return {
            "answer": answer,
            "sources": [doc.metadata for doc in sources]
        }

# Usage
rag = RAGSystem(documents=my_docs, llm=my_llm)
result = rag.query("What is the company's remote work policy?")
print(result["answer"])
```

## Advanced Techniques

### Hybrid Search

Combine semantic + keyword search:

```python
retriever = vectorstore.as_retriever(
    search_type="mmr",  # Maximal Marginal Relevance
    search_kwargs={
        "k": 5,
        "fetch_k": 20,
        "lambda_mult": 0.5  # Balance diversity vs relevance
    }
)
```

### Query Transformation

Improve retrieval with query enhancement:

```python
def enhance_query(query, llm):
    """Expand query for better retrieval"""
    prompt = f"""Generate 3 alternative versions of this question 
    that might help find relevant information:
    
    Original: {query}
    
    Alternatives:"""
    
    alternatives = llm.generate(prompt).split("\n")
    return [query] + alternatives  # Search all versions
```

### Multi-Hop Retrieval

For complex questions requiring multiple lookups:

```python
def multi_hop_rag(query, vectorstore, llm, max_hops=3):
    context = []
    remaining_query = query
    
    for hop in range(max_hops):
        # Retrieve
        docs = retrieve_context(vectorstore, remaining_query)
        context.extend(docs)
        
        # Check if we have enough info
        synthesis_prompt = f"""Based on this information, can you answer the original question?
        
        Context so far: {context}
        Original question: {query}
        
        If yes, provide the answer. If no, what specific information is still missing?"""
        
        response = llm.generate(synthesis_prompt)
        
        if "answer" in response.lower():
            break
        
        # Use missing info as next query
        remaining_query = extract_missing_info(response)
    
    return synthesize_final_answer(query, context, llm)
```

## Chunking Strategies

| Strategy | Best For | Considerations |
|----------|----------|----------------|
| Fixed size | General purpose | May split sentences |
| Sentence-based | Coherent text | Variable chunk sizes |
| Paragraph-based | Articles, docs | Good semantic units |
| Semantic | Technical content | Requires embedding clustering |
| Overlapping | Critical contexts | Increases token usage |

## Evaluation Metrics

```python
def evaluate_rag(rag_system, test_queries, ground_truths):
    metrics = {
        "retrieval_precision": [],
        "answer_accuracy": [],
        "faithfulness": []
    }
    
    for query, truth in zip(test_queries, ground_truths):
        result = rag_system.query(query)
        
        # Check if retrieved docs contain answer
        precision = check_retrieval_precision(result["sources"], truth)
        metrics["retrieval_precision"].append(precision)
        
        # Check answer correctness
        accuracy = semantic_similarity(result["answer"], truth)
        metrics["answer_accuracy"].append(accuracy)
        
        # Check if answer is grounded in context
        faithfulness = check_faithfulness(result["answer"], result["sources"])
        metrics["faithfulness"].append(faithfulness)
    
    return {k: sum(v)/len(v) for k, v in metrics.items()}
```

## Common Pitfalls

❌ **Too many chunks**: Retrieving 20+ chunks overwhelms the model
❌ **Poor chunking**: Splitting mid-sentence loses meaning
❌ **No re-ranking**: First results aren't always best
❌ **Ignoring metadata**: Filter by date, source, type
❌ **No evaluation**: Measure retrieval quality regularly

## Tools & Libraries

| Tool | Purpose |
|------|---------|
| **LangChain** | RAG orchestration framework |
| **LlamaIndex** | Data indexing & retrieval |
| **Chroma** | Lightweight vector database |
| **Pinecone** | Managed vector database |
| **Weaviate** | GraphQL vector database |
| **Haystack** | End-to-end RAG pipeline |

## Next Steps

- [Function Calling](../guides/function-calling.md) - Extend RAG with tool use
- [Evaluation Guide](../guides/evaluation.md) - Test RAG quality
- [Cost Optimization](../guides/cost-optimization.md) - Reduce RAG expenses
