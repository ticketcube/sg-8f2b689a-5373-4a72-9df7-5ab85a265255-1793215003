---
title: Family Authentication & User Management
status: todo
priority: high
type: feature
tags: [auth, supabase, users]
created_by: agent
created_at: 2026-09-28T17:49:00Z
position: 2
---

## Notes
Multi-user authentication system where each family member has their own private account. Supabase Auth with email/password. User profiles with RLS to ensure data isolation.

## Checklist
- [ ] Create user_profiles table with RLS policies
- [ ] Build login/signup pages with email/password
- [ ] Add profile management page
- [ ] Implement session management and protected routes
- [ ] Add user settings (name, preferences)

## Acceptance
- Family members can create accounts and log in
- Each user sees only their own data
- Profile information is editable