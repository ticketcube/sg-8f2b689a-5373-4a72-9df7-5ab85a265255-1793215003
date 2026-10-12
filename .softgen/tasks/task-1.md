---
title: Consolidate User Profiles Table
status: done
priority: urgent
type: chore
tags: [database, ai, auth, refactor]
---

## Notes
The application currently suffers from a split-brain profile architecture. The frontend (signup, dashboard, profile UI, storage) uses the `profiles` table, while the backend AI features (smart-conversation, web-search, supabase-admin) use the `user_profiles` table. This means UI updates aren't properly reflected in the AI context. We need to consolidate entirely onto the `profiles` table.

## Checklist
- [x] Inspect schemas for both `profiles` and `user_profiles` in Supabase using the database tools.
- [x] Write and execute an SQL migration to add any missing AI-specific columns from `user_profiles` to `profiles`.
- [x] Write and execute a data migration script to copy existing AI settings/data from `user_profiles` into `profiles`.
- [x] Refactor `src/pages/api/smart-conversation.ts` to replace all `.from("user_profiles")` queries with `.from("profiles")`.
- [x] Refactor `src/pages/api/web-search.ts` to query `profiles`.
- [x] Refactor `src/lib/supabase-admin.ts` to query `profiles`.
- [x] Regenerate Supabase Types using the `supabase_generate_types` tool so the codebase recognizes the merged schema.
- [x] (Optional/Safe) Execute SQL to drop the `user_profiles` table if all dependencies have been successfully moved.

## Acceptance
- The AI chat can successfully retrieve the user's name and role using the unified `profiles` table.
- A user can sign up, modify their profile in the UI, and the AI agent immediately recognizes the updated information.
- No references to `user_profiles` remain in the codebase API routes.