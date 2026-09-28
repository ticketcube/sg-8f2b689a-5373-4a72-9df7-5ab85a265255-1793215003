# Family AI Agent Service

## Vision
A private AI assistant platform where each family member has their own secure agent for searching, storing, and organizing their personal information. Professional executive secretary interface that's trustworthy, organized, and competent.

## Design
**Personal Secretary aesthetic — sharp, professional, executive assistant vibe**

### Color System
- `--primary: 220 80% 20% (navy)` — authority, trust
- `--secondary: 210 15% 30% (charcoal)` — structured, professional  
- `--accent: 40 95% 50% (gold)` — premium touch, highlights
- `--muted: 220 10% 96% (light gray)` — backgrounds, cards
- `--background: 0 0% 100% (white)` — clean slate
- `--foreground: 220 15% 15% (dark slate)` — primary text
- `--border: 220 10% 88% (soft gray)` — subtle divisions

### Typography
- **Headings**: Cormorant Garamond (serif, authoritative, refined)
- **Body**: Inter (sans-serif, readable, modern professional)
- **Monospace**: JetBrains Mono (data, code, technical details)

### Style Direction
Crisp layouts, generous whitespace, structured information hierarchy. Sharp corners on primary elements, subtle borders for definition. Executive dashboard aesthetic — nothing playful, everything purposeful. Gold accents used sparingly for key actions and status indicators.

## Features
### Core Functionality
- **Private Family Accounts** — each member has isolated, secure space
- **AI Agent Chat** — conversational interface for questions and tasks
- **Smart Search** — semantic search across stored information
- **Personal Storage** — save important information, conversations, documents
- **Organization** — tags, categories, collections for stored items
- **Dashboard** — overview of recent activity and quick access

## Implementation Status
✅ All core features implemented and tested:
- Authentication system with family member accounts (/auth/signup, /auth/login)
- AI chat interface with conversation management (/chat)
- Personal storage with search and tagging (/storage)
- Dashboard with quick actions and statistics (/dashboard)
- Profile management (/profile)