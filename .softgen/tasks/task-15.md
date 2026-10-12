---
title: Consolidate to user_profiles Table
status: done
priority: urgent
type: chore
tags: [database, migration]
created_by: agent
created_at: 2026-10-12T20:22:35Z
position: 15
---

## Notes
Consolidate all user profile data to use `user_profiles` as the single source of truth, eliminating the split-brain architecture between frontend (`profiles`) and backend (`user_profiles`).

## Checklist
- [x] Run SQL migration to add `full_name` column to `user_profiles`
- [x] Migrate data from `profiles` → `user_profiles`
- [x] Update foreign key constraints to point to `user_profiles.user_id`
- [x] Drop the `profiles` table
- [x] Update `src/pages/api/smart-conversation.ts` to use `user_profiles` and `user_id`
- [x] Update `src/pages/api/web-search.ts` to use `user_profiles` and `user_id`
- [x] Update `src/lib/supabase-admin.ts` to use `user_profiles` and `user_id`
- [x] Update `src/pages/auth/signup.tsx` to use `user_profiles` and `user_id`
- [x] Update `src/pages/dashboard.tsx` to use `user_profiles` and `user_id`
- [x] Update `src/pages/profile.tsx` to use `user_profiles` and `user_id`
- [x] Update `src/pages/storage.tsx` to use `user_profiles` and `user_id`
- [x] Regenerate Supabase types
- [x] Run check_for_errors to verify no build/lint issues
- [x] Test signup flow
- [x] Test profile updates

## Acceptance
- All code uses `user_profiles` table exclusively
- The `profiles` table no longer exists in the database
- All features work correctly with the new table structure