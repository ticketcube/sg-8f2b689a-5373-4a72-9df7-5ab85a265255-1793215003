# Database Consolidation Plan: profiles → user_profiles

## Goal
Consolidate to `user_profiles` as the single source of truth for user data.

## Current State

### Code Currently Using `profiles`
**Backend API:**
- `src/pages/api/smart-conversation.ts` (line 483): Checks `profiles.role`
- `src/pages/api/web-search.ts` (line 49): Checks `profiles.role`
- `src/lib/supabase-admin.ts` (line 33): Checks `profiles.is_admin`

**Frontend UI:**
- `src/pages/auth/signup.tsx` (line 53): Inserts into `profiles`
- `src/pages/dashboard.tsx` (line 41): Queries `profiles`
- `src/pages/profile.tsx` (line 40): Queries `profiles`
- `src/pages/storage.tsx` (line 60): Queries `profiles`

## Migration Plan

### Phase 1: Database Migration (SQL)
1. Ensure `user_profiles` has all necessary columns
2. Migrate data from `profiles` to `user_profiles`
3. Update foreign key constraints (currently point to `profiles.id` → change to `user_profiles.user_id`)
4. Drop `profiles` table

### Phase 2: Code Migration (TypeScript)
Update all code references from `profiles` to `user_profiles`:

**Key Changes:**
- Primary key field: `id` → `user_id`
- Table name: `profiles` → `user_profiles`

**Files to Update:**
1. `src/pages/api/smart-conversation.ts` - Change `profiles` → `user_profiles`, `id` → `user_id`
2. `src/pages/api/web-search.ts` - Change `profiles` → `user_profiles`, `id` → `user_id`
3. `src/lib/supabase-admin.ts` - Change `profiles` → `user_profiles`, `id` → `user_id`
4. `src/pages/auth/signup.tsx` - Change `profiles` → `user_profiles`, `id` → `user_id`
5. `src/pages/dashboard.tsx` - Change `profiles` → `user_profiles`, `id` → `user_id`
6. `src/pages/profile.tsx` - Change `profiles` → `user_profiles`, `id` → `user_id`
7. `src/pages/storage.tsx` - Change `profiles` → `user_profiles`, `id` → `user_id`

### Phase 3: Verification
1. Regenerate Supabase types: `npx supabase gen types typescript`
2. Run build to catch any TypeScript errors
3. Test all features (signup, profile, dashboard, AI chat)

## Benefits
✅ Single source of truth (`user_profiles`)  
✅ Consistent naming convention (`user_id` as FK)  
✅ All existing foreign key relationships preserved  
✅ No split-brain architecture