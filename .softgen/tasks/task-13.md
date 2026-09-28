---
title: Shared Family Calendar
status: in_progress
priority: high
type: feature
tags: [calendar, shared, events]
created_by: agent
created_at: 2026-09-28T17:58:00Z
position: 6
---

## Notes
Shared family calendar page showing reminders, milestones, and events that any family member can add. Displays in calendar view with month/list toggle. Family members can add events through their AI agent chat or directly on the calendar page.

## Checklist
- [ ] Create family_events table with RLS for family-wide visibility
- [ ] Build calendar page with month view visualization
- [ ] Add event creation form (title, date, type, description)
- [ ] Integrate with AI chat to parse and create events
- [ ] Add list view toggle for upcoming events
- [ ] Display who created each event
- [ ] Add edit/delete functionality with creator restrictions

## Acceptance
- All family members can see the shared calendar
- Events can be added from chat or calendar page
- Calendar displays month view with clear event indicators
- Upcoming events are easily visible in list view