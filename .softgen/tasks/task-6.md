---
title: Media Planning Interface with AI Assistant
status: in_progress
priority: high
type: feature
tags: [ui, media-planning, ai-assistant]
created_by: agent
created_at: 2026-09-09T20:24:00Z
position: 6
---

## Notes

Build Section 3: Media Plan - 8 paid channels + CRM with integrated AI teaching assistant. Users can ask questions about any channel, metric, or strategy and get expert guidance.

**8 Paid Media Channels:**
1. TV/CTV (Television & Connected TV)
2. Radio/Audio (Broadcast & Streaming)
3. OOH (Out of Home - Billboards, Transit)
4. Paid Social (Facebook, Instagram, TikTok)
5. Paid Search (Google, Bing)
6. Display/Programmatic
7. YouTube/Video
8. Retargeting/Remarketing

**CRM/Email Marketing:**
- Audience size
- Open rate
- Click rate
- Conversion rate

**AI Assistant Features:**
- Contextual help buttons on each channel/metric
- "What is this?" explanations
- Benchmark comparisons
- Budget optimization suggestions
- Strategy recommendations based on user's event data

## Checklist

- [x] Create `MediaChannelForm.tsx` component (reusable for all 8 channels)
- [ ] Create `CRMMarketingForm.tsx` for email/CRM section
- [ ] Create `MediaMixSummary.tsx` (aggregate metrics dashboard)
- [x] Create `AIAssistantModal.tsx` (teaching/help interface)
- [x] Create `/api/media-insights` endpoint (OpenAI integration)
- [ ] Add media calculations to calculate aggregate CPT, ROAS, tickets from media
- [x] Add "Ask AI" buttons throughout media planning interface
- [ ] Build media budget allocation pie chart
- [ ] Build ticket contribution by channel bar chart
- [x] Integrate all components into calculator page
- [x] Add sample media plan data for DroneArt

## Acceptance

- User can configure all 8 paid media channels plus CRM
- AI assistant answers questions about channels, metrics, and strategy
- Media calculations update in real-time
- Budget allocation visualized clearly
- Tickets attributed to each channel displayed
- Design maintains executive dashboard aesthetic