---
title: Event Economics Dashboard Section
status: done
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

- [x] Create `src/components/EventEconomics/` directory
- [x] Build `EventDetailsForm.tsx` (event name, artist, market, venue, date)
- [x] Build `TicketEconomicsForm.tsx` (capacity, pricing, current sales)
- [x] Build `EconomicsKPICards.tsx` (calculated metrics display)
- [x] Integrate calculation engine from task-3
- [x] Add form validation (capacity > 0, prices > 0, sold <= capacity)
- [x] Connect to Supabase for save/load
- [x] Create new calculator page at /calculator
- [x] Style with executive dashboard aesthetic (clean, premium, number-focused)
- [x] Make fully responsive (mobile/tablet/desktop)

## Acceptance

- User can enter all event economic inputs
- Calculated metrics update in real-time as inputs change
- Data persists to Supabase
- Form validates inputs appropriately
- Design matches premium executive dashboard aesthetic