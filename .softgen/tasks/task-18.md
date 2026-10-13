---
title: Personal & Shared Events/Items System
status: in_progress
priority: urgent
type: feature
tags: [sharing, calendar, storage, mvp]
created_by: agent
created_at: 2026-10-13T20:56:49Z
position: 1
---

## Notes
MVP for personal and shared event/item tracking:
- Users own their events and items (user_id)
- Users can share specific events/items with other users
- Users can share with "family" (all users in account)
- Calendar shows: my events + events shared with me
- Storage shows: my items + items shared with me
- Display owner's name/avatar on shared items

## Checklist
- [ ] Add shared_with_users (uuid[]) and shared_with_family (boolean) to family_events
- [ ] Add shared_with_users (uuid[]) and shared_with_family (boolean) to saved_items
- [ ] Update RLS policies to allow viewing shared items
- [ ] Fix calendar query to filter by user_id OR shared_with_users OR shared_with_family
- [ ] Fix storage query similarly
- [ ] Add owner display (avatar/name) on calendar and storage items
- [ ] Add share UI controls to calendar event cards
- [ ] Add share UI controls to storage item cards
- [ ] Update smart-conversation.ts to save events with proper user_id
- [ ] Test sharing flow end-to-end

## Acceptance
- User sees only their own events by default
- User can share an event with specific family members
- Shared events show owner's name
- Same functionality works for storage items