# Building Chat Applications

A practical guide to creating LLM-powered chat applications.

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│    LLM API  │
│  (React/    │◀────│  (FastAPI/   │◀────│  (OpenAI/   │
│   Vue/etc)  │     │   Flask)     │     │  Anthropic) │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │   Database   │
                    │  (Messages,  │
                    │   Users)     │
                    └──────────────┘
```

## Core Components

### 1. Message Management

```python
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Optional
import uuid

@dataclass
class Message:
    id: str
    role: str  # "user", "assistant", "system"
    content: str
    timestamp: datetime
    conversation_id: str
    
    @classmethod
    def create(cls, role: str, content: str, conversation_id: str):
        return cls(
            id=str(uuid.uuid4()),
            role=role,
            content=content,
            timestamp=datetime.utcnow(),
            conversation_id=conversation_id
        )

class ConversationManager:
    def __init__(self, max_tokens: int = 4000):
        self.max_tokens = max_tokens
        self.conversations = {}  # conversation_id -> [Message]
    
    def add_message(self, conversation_id: str, role: str, content: str):
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        message = Message.create(role, content, conversation_id)
        self.conversations[conversation_id].append(message)
        
        # Trim if exceeds token limit
        self._trim_conversation(conversation_id)
        
        return message
    
    def get_messages(self, conversation_id: str) -> List[Message]:
        return self.conversations.get(conversation_id, [])
    
    def _trim_conversation(self, conversation_id: str):
        """Keep conversation within token limits"""
        messages = self.conversations.get(conversation_id, [])
        if len(messages) <= 2:
            return
        
        # Keep system message and recent exchanges
        while self._count_tokens(messages) > self.max_tokens and len(messages) > 2:
            messages.pop(1)  # Remove oldest user message
            if len(messages) > 1:
                messages.pop(1)  # Remove oldest assistant response
    
    def _count_tokens(self, messages: List[Message]) -> int:
        # Simplified token counting
        return sum(len(m.content.split()) * 1.3 for m in messages)
```

### 2. LLM Integration

```python
import openai
from typing import AsyncGenerator

class ChatBot:
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        openai.api_key = api_key
        self.model = model
    
    def format_messages(self, messages: List[Message]) -> List[dict]:
        """Convert Message objects to API format"""
        return [
            {"role": m.role, "content": m.content}
            for m in messages
        ]
    
    async def generate_response(
        self, 
        messages: List[Message],
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate a complete response"""
        formatted = self.format_messages(messages)
        
        if system_prompt:
            formatted.insert(0, {"role": "system", "content": system_prompt})
        
        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=formatted,
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    
    async def stream_response(
        self,
        messages: List[Message],
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response token by token"""
        formatted = self.format_messages(messages)
        
        if system_prompt:
            formatted.insert(0, {"role": "system", "content": system_prompt})
        
        stream = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=formatted,
            temperature=0.7,
            max_tokens=1000,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.get("content"):
                yield chunk.choices[0].delta.content
```

### 3. Backend API (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
conv_manager = ConversationManager()
chatbot = ChatBot(api_key="your-api-key")

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Create or get conversation
    conv_id = request.conversation_id or str(uuid.uuid4())
    
    # Add user message
    conv_manager.add_message(conv_id, "user", request.message)
    
    # Get conversation history
    messages = conv_manager.get_messages(conv_id)
    
    try:
        # Generate response
        response_text = await chatbot.generate_response(
            messages,
            system_prompt=request.system_prompt
        )
        
        # Add assistant response
        conv_manager.add_message(conv_id, "assistant", response_text)
        
        return ChatResponse(
            response=response_text,
            conversation_id=conv_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    messages = conv_manager.get_messages(conversation_id)
    return {"messages": [asdict(m) for m in messages]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 4. Frontend Component (React)

```jsx
import React, { useState, useEffect, useRef } from 'react';

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversation_id: conversationId
        })
      });

      const data = await response.json();
      
      // Set conversation ID on first message
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Sorry, something went wrong.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="content">{msg.content}</div>
            <div className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && <div className="message assistant typing">...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={3}
        />
        <button onClick={sendMessage} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatApp;
```

## Best Practices

### 1. Error Handling

```python
class RobustChatBot(ChatBot):
    async def generate_response(self, messages, system_prompt=None, retries=3):
        for attempt in range(retries):
            try:
                return await super().generate_response(messages, system_prompt)
            except openai.error.RateLimitError:
                if attempt == retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
            except openai.error.APIError as e:
                logging.warning(f"API error (attempt {attempt + 1}): {e}")
                if attempt == retries - 1:
                    raise
```

### 2. Rate Limiting

```python
from slowapi import SlowApi, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = SlowApi(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/chat")
@limiter.limit("10/minute")  # 10 requests per minute per IP
async def chat(request: Request, chat_request: ChatRequest):
    # ... existing code
```

### 3. Message Persistence

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db():
    conn = sqlite3.connect('chat.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def save_message(message: Message):
    with get_db() as conn:
        conn.execute(
            """INSERT INTO messages 
               (id, role, content, timestamp, conversation_id) 
               VALUES (?, ?, ?, ?, ?)""",
            (message.id, message.role, message.content, 
             message.timestamp, message.conversation_id)
        )
        conn.commit()
```

## Deployment Checklist

- [ ] Set up environment variables for API keys
- [ ] Configure CORS for production domain
- [ ] Implement user authentication
- [ ] Add message persistence (database)
- [ ] Set up rate limiting
- [ ] Enable HTTPS
- [ ] Monitor API usage and costs
- [ ] Implement logging and error tracking
- [ ] Add content moderation filters
- [ ] Set up auto-scaling for traffic spikes

## Next Steps

- [Function Calling](function-calling.md) - Add tool integration
- [Security Guide](security.md) - Protect your application
- [Evaluation](evaluation.md) - Test chat quality
