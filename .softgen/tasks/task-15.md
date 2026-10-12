---
title: Consolidate to user_profiles Table
status: todo
priority: urgent
type: chore
tags: [database, migration, consolidation]
created_by: agent
created_at: 2026-10-12T20:19:10Z
position: 1
---

## Notes
Consolidate the database to use `user_profiles` as the single source of truth for user data. Currently, the codebase uses `profiles` table but we want to standardize on `user_profiles` instead.

Key changes:
- Table name: `profiles` → `user_profiles`
- Primary key field: `id` → `user_id`
- All foreign key constraints must point to `user_profiles.user_id`

## Checklist
- [ ] Run SQL migration (`supabase/migrations/20261012201500_drop_user_profiles.sql`) to migrate data and drop profiles table
- [ ] Update `src/pages/api/smart-conversation.ts` - Change `profiles` to `user_profiles`, `id` to `user_id`
- [ ] Update `src/pages/api/web-search.ts` - Change `profiles` to `user_profiles`, `id` to `user_id`
- [ ] Update `src/lib/supabase-admin.ts` - Change `profiles` to `user_profiles`, `id` to `user_id`
- [ ] Update `src/pages/auth/signup.tsx` - Change `profiles` to `user_profiles`, `id` to `user_id`
- [ ] Update `src/pages/dashboard.tsx` - Change `profiles` to `user_profiles`, `id` to `user_id`
- [ ] Update `src/pages/profile.tsx` - Change `profiles` to `user_profiles`, `id` to `user_id`
- [ ] Update `src/pages/storage.tsx` - Change `profiles` to `user_profiles`, `id` to `user_id`
- [ ] Regenerate Supabase types: `npx supabase gen types typescript`
- [ ] Test signup flow
- [ ] Test profile page
- [ ] Test dashboard
- [ ] Test AI chat (smart-conversation)
- [ ] Test web search feature

## Acceptance
- All application code uses `user_profiles` table exclusively
- The `profiles` table no longer exists in the database
- All features work correctly with the new table structure