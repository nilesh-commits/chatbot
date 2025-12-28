# AI Support Agent - Live Chat Widget

A mini AI support agent for a live chat widget that simulates customer support using OpenAI's GPT-4o-mini.

![Chat Preview](docs/preview.png)

## 🚀 Features

- **Real-time AI Chat**: Powered by OpenAI GPT-4o-mini
- **Conversation Persistence**: Messages stored in PostgreSQL
- **Session Management**: Resume conversations across page reloads
- **Beautiful UI**: Dark theme with smooth animations
- **Typing Indicators**: Visual feedback while AI responds
- **Input Validation**: Handles empty messages, long text, and edge cases
- **Error Handling**: Graceful error messages for API failures

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express + TypeScript |
| Frontend | SvelteKit |
| Database | PostgreSQL |
| LLM | OpenAI GPT-4o-mini |

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  SvelteKit UI   │────▶│  Express API    │────▶│   PostgreSQL    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │   OpenAI API    │
                        │                 │
                        └─────────────────┘
```

### Backend Structure
```
backend/
├── src/
│   ├── index.ts              # Express server entry
│   ├── routes/
│   │   └── chat.ts           # Chat API endpoints
│   ├── services/
│   │   ├── llm.service.ts    # OpenAI integration
│   │   └── chat.service.ts   # Business logic
│   ├── models/
│   │   └── database.ts       # PostgreSQL connection
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── config/
│       ├── knowledge.ts      # Store FAQ/policies
│       └── index.ts          # Environment config
├── migrations/
│   └── 001_initial.sql       # Database schema
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── routes/
│   │   ├── +page.svelte      # Main chat page
│   │   └── +layout.svelte    # Root layout
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ChatWidget.svelte
│   │   │   ├── MessageList.svelte
│   │   │   ├── MessageBubble.svelte
│   │   │   └── ChatInput.svelte
│   │   ├── stores/
│   │   │   └── chat.ts       # State management
│   │   └── api/
│   │       └── chat.ts       # API client
│   └── app.css               # Global styles
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key

### 1. Clone & Install Dependencies

```bash
# Clone the repository
cd chatbot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create the database
createdb chatbot

# Or using psql
psql -U postgres -c "CREATE DATABASE chatbot;"
```

The database tables will be created automatically when the backend starts.

Alternatively, you can run the migration manually:
```bash
psql -U postgres -d chatbot -f backend/migrations/001_initial.sql
```

### 3. Environment Variables

```bash
# Backend - create .env from example
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatbot
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3001
NODE_ENV=development
```

> ⚠️ **Important**: Never commit your `.env` file or API keys to version control!

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## 📡 API Endpoints

### POST /api/chat/message

Send a message and receive an AI reply.

**Request:**
```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid"
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### GET /api/chat/:sessionId/history

Get conversation history for a session.

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "uuid",
      "sender": "user",
      "text": "What is your return policy?",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    {
      "id": "uuid",
      "sender": "ai",
      "text": "We offer a 30-day return policy...",
      "timestamp": "2024-01-01T12:00:01Z"
    }
  ]
}
```

### GET /api/health

Health check endpoint.

## 🤖 LLM Integration

### Provider: OpenAI (GPT-4o-mini)

**Why GPT-4o-mini?**
- Cost-effective: $0.15/1M input, $0.60/1M output
- Fast response times
- Good quality for support conversations

### Prompt Design

The system prompt includes:
- Store identity (TechStyle Store)
- Shipping policy
- Return/refund policy
- Support hours
- Product information
- Response guidelines

### Cost Control Measures

- Max response tokens: 500
- Conversation history limited to last 10 messages
- Long messages truncated to 1000 characters in context
- Request timeout: 30 seconds

### Error Handling

| Scenario | Response |
|----------|----------|
| API timeout | Friendly "try again" message |
| Rate limited | "Busy, try again" message |
| Invalid API key | Generic error, logged internally |
| Network error | Graceful fallback message |

## 🔒 Security

- API keys stored in environment variables
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- CORS configured for allowed origins
- No secrets in version control

## 🧪 Testing the App

1. **Basic Flow**: Send "What's your return policy?" and verify the response includes "30 days"
2. **Session Persistence**: Refresh the page and verify history loads
3. **Empty Message**: Try sending an empty message (should be prevented)
4. **Long Message**: Send a very long message (should work, truncated if needed)
5. **Error Handling**: Kill the backend and try sending a message (should show error)

## ⚖️ Trade-offs & Decisions

| Decision | Rationale |
|----------|-----------|
| Express over Fastify | Simpler, more familiar ecosystem |
| PostgreSQL over SQLite | Better production readiness, UUID support |
| GPT-4o-mini over GPT-4 | Cost-effective for support use case |
| Hardcoded knowledge | Faster development, easily extensible |
| No Redis cache | Keeping scope manageable |
| No authentication | Per assignment requirements |

## 🚧 If I Had More Time...

- [ ] **Streaming responses** - SSE for real-time typing effect
- [ ] **Redis caching** - Cache common questions/answers
- [ ] **WebSocket** - Real-time updates instead of polling
- [ ] **Rate limiting** - Per-session request limits
- [ ] **Analytics dashboard** - Track common questions
- [ ] **RAG implementation** - Vector DB for knowledge retrieval
- [ ] **Multi-channel support** - Abstract messaging interface
- [ ] **Admin panel** - Review and improve AI responses
- [ ] **Feedback system** - Thumbs up/down on AI responses
- [ ] **Unit tests** - Jest tests for services
- [ ] **E2E tests** - Playwright for full flow testing

## 📝 License

MIT

---

Built with ❤️ as a take-home assignment for Spur
