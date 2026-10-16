# Project Structure & Launch Strategy (Prepared for Claude)

## 1. Project Overview & Scope
This project is a multi-faceted web application built on a modern serverless stack. It appears to have evolved into a hybrid platform serving distinct but potentially intersecting use cases:
1. **Family AI Assistant:** A voice-first, highly accessible AI agent designed for seniors and families to manage shopping lists, schedules, and conversations.
2. **FanDragon Identity Hub:** A central identity and authentication hub positioned as an "AI Ticket Agent" (Protect and Serve).
3. **Live Event Market Calculator:** A sophisticated B2B educational and decision-engine tool for senior live entertainment executives to calculate event economics, sales pacing, media mix, and marketing ROAS.

## 2. Historical Evolution of FanDragon (Placeholder)
*Current Context from Codebase:* FanDragon is positioned in the application as a "Central Identity Hub" ("One identity for all your digital experiences") and an "AI Ticket Agent." The platform integrates a specialized `fandragon.tsx` interface and specific OAuth flows (`fandragonAuthService.ts`, `/api/auth/fandragon/*`). 

> **Action Required for Claude/User:** Inject the LinkedIn company history here to provide context on FanDragon's founding, its evolution in the ticketing/identity space, and the strategic pivot that led to this specific product mix.

## 3. Technical Architecture
- **Framework:** Next.js v15.2 (Page Router architecture: `src/pages/`)
- **UI & Styling:** React 18.3, Tailwind CSS v3.4, shadcn/ui components
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **AI Integration:** OpenAI API for conversational intelligence (`/api/smart-conversation`), Speech-to-Text (STT), and Text-to-Speech (TTS). 
- **Key Design Patterns:** 
  - Voice-first interactions via Web Speech API and custom TTS hooks.
  - Complex state management for the B2B event marketing calculator.

## 4. Core Modules & Code Structure
### A. The AI Assistant (B2C)
- **Primary Files:** `chat-senior.tsx`, `chat-simple.tsx`, `dashboard.tsx`, `calendar.tsx`
- **Functionality:** Voice-activated command processing. Users can update shopping lists, check calendars, and converse naturally. Features a highly simplified UI tailored for seniors/accessibility.

### B. FanDragon Identity & Auth
- **Primary Files:** `fandragon.tsx`, `fandragon-consent.tsx`, `fandragonAuthService.ts`
- **Functionality:** Provides a secure portal for user identity, likely acting as a passport for ticketing and event access.

### C. Live Event Market Calculator (B2B)
- **Primary Files:** `calculator.tsx`, `EventEconomics/` folder, `lib/calculations/`
- **Functionality:** A rigorous decision engine that allows users to input venue capacity, ticket prices, and media budgets to generate pacing statuses, ROAS, and marketing reallocation recommendations.

## 5. Launch Strategy & Roadmap (For Claude's Management)

### Phase 1: Product Positioning & Narrative Consolidation
**Objective:** Define the primary go-to-market narrative. Is this launching as a suite of FanDragon tools, or are the AI Assistant and the Event Calculator separate products targeting different audiences?
- **Action for Claude:** Help the user draft a clear Value Proposition for the launch. If it's a unified launch, connect the "AI Ticket Agent" (FanDragon) to the "Live Event Calculator" (B2B tool) and the "List Assistant" (B2C tool).

### Phase 2: MVP Hardening & QA
**Objective:** Ensure the core flows are production-ready.
- **B2C Flow:** Test the voice-to-text accuracy in `chat-senior.tsx` across devices (especially mobile Safari/Chrome). Ensure Supabase RLS policies are strictly enforcing family-data privacy.
- **B2B Flow:** Validate the math in `lib/calculations/` for the Event Calculator. Ensure the "Optimize Media Mix" algorithms provide sane, constrained recommendations.
- **Auth Flow:** Verify FanDragon consent and token handoffs.

### Phase 3: Soft Launch & Beta Testing
**Objective:** Get real user feedback before a massive push.
- **Audience:** Invite a small cohort of live-event marketers for the Calculator, and a controlled group of families/seniors for the AI Assistant.
- **Analytics:** Monitor the OpenAI API costs heavily. Ensure `api-costs.ts` and the `ApiCostsTable.tsx` are correctly logging token usage to prevent budget overruns during the beta.

### Phase 4: Full Market Release
- **Marketing:** Leverage FanDragon's historical industry presence (using the LinkedIn data) to push the Event Calculator to industry executives.
- **Support:** Provide clear documentation and onboarding flows (which are currently being supported by the `HelpModal.tsx` and `HelpCard.tsx` in the app).

---
*Note to Claude: Use this document to track completion of QA milestones, align on the marketing copy once the FanDragon history is provided, and coordinate the Vercel/Supabase production deployment checks.*