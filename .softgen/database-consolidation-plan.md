# Database Consolidation Plan: user_profiles → profiles

## ✅ CODE MIGRATION COMPLETE

All application code has been successfully migrated to use the `profiles` table exclusively:

### Backend API (All Using `profiles`)
- `src/pages/api/smart-conversation.ts` - Checks `profiles.role` for aiassist access
- `src/pages/api/web-search.ts` - Checks `profiles.role` for aiassist access
- `src/lib/supabase-admin.ts` - Checks `profiles.is_admin` for admin functions

### Frontend UI (All Using `profiles`)
- `src/pages/auth/signup.tsx` - Inserts new users into `profiles`
- `src/pages/dashboard.tsx` - Queries `profiles` for user data
- `src/pages/profile.tsx` - Queries `profiles` for settings
- `src/pages/storage.tsx` - Queries `profiles` for user info

### Fields Currently Used
- `id` (primary key)
- `email`
- `full_name`
- `role` (aiassist/admin access)
- `is_admin` (admin flag)

## ⚠️ DATABASE CLEANUP NEEDED

The `user_profiles` table still exists in the database but is **no longer referenced by any code**.

### Cleanup Steps (SQL Migration Created)

A migration file has been created: `supabase/migrations/20261012201500_drop_user_profiles.sql`

**What it does:**
1. ✅ Verifies no data loss (checks for users in user_profiles not in profiles)
2. ✅ Updates foreign key constraints to point to profiles.id
3. ✅ Updates RLS policies (where applicable)
4. ✅ Drops the user_profiles table
5. ✅ Adds documentation comment

**Tables with Updated Foreign Keys:**
- minting_transactions (buyer_user_id, artist_user_id)
- cube_update_notifications (holder_user_id, artist_user_id)
- tcube_transactions (user_id)
- tcube_stakes (user_id)
- tcube_rewards (user_id)
- cube_face_unlocks (user_id)

### To Execute

1. Review the migration SQL file
2. Run via Supabase CLI or Dashboard SQL Editor
3. Regenerate types: `npx supabase gen types typescript`
4. Verify application still works correctly

## Benefits Achieved
✅ Single source of truth for user data  
✅ Consistent data model  
✅ Simpler foreign key references  
✅ No split-brain architecture  
✅ Easier maintenance