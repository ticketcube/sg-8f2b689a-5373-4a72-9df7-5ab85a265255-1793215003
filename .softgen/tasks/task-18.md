---
title: Simplify to Events-Only System
status: in_progress
priority: urgent
type: feature
tags: [calendar, events, simplification]
created_by: agent
created_at: 2026-10-13T20:56:49Z
position: 1
---

## Notes
Simplify app to focus only on events - remove items/storage entirely:
- All user data becomes calendar events (appointments, tasks, shopping lists, reminders)
- Remove saved_items table and storage UI
- Clean up smart-conversation to only save events
- Keep personal vs shared events for future (avatar_url matching works for now)

## Checklist
- [x] Remove /storage page from navigation and app
- [x] Remove saved_items API endpoints
- [x] Drop saved_items table from database
- [ ] Update smart-conversation.ts to convert all saves to calendar events
- [ ] Fix calendar query to filter by user (user_id OR avatar_url match)
- [ ] Update dashboard to show calendar events only
- [ ] Remove storage-related components

## Acceptance
- Storage page is removed/inaccessible
- All AI saves create calendar events
- Calendar shows user's events properly filtered
- Dashboard reflects events-only data model