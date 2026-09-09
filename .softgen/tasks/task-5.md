---
title: Event Economics Dashboard Section
status: todo
priority: high
type: feature
tags: [ui, dashboard, event-economics]
created_by: agent
created_at: 2026-09-09T19:05:41Z
position: 5
---

## Notes

Build Section 1: Event Economics input form and calculations display. This is the foundation that drives all downstream calculations.

Form inputs:
- Event details (name, artist, market, venue, date)
- Capacity and target sell-through
- Current tickets sold
- Ticket pricing (average, premium %, premium/standard prices)
- Revenue figures

Auto-calculated displays:
- Total revenue potential
- Target tickets
- Tickets remaining
- Current sell-through %
- Revenue remaining

Use large KPI cards for calculated metrics. Design should be "sophisticated executive dashboard" not "consumer ticket site".

## Checklist

- [ ] Create `src/components/EventEconomics/` directory
- [ ] Build `EventDetailsForm.tsx` (event name, artist, market, venue, date)
- [ ] Build `TicketEconomicsForm.tsx` (capacity, pricing, current sales)
- [ ] Build `EconomicsKPICards.tsx` (calculated metrics display)
- [ ] Integrate calculation engine from task-3
- [ ] Add form validation (capacity > 0, prices > 0, sold <= capacity)
- [ ] Connect to Supabase for save/load
- [ ] Add auto-save with debounce
- [ ] Style with executive dashboard aesthetic (clean, premium, number-focused)
- [ ] Make fully responsive (mobile/tablet/desktop)

## Acceptance

- User can enter all event economic inputs
- Calculated metrics update in real-time as inputs change
- Data persists to Supabase
- Form validates inputs appropriately
- Design matches premium executive dashboard aesthetic