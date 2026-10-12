# AI Assistant Role-Based Access Control

## Overview
The Family AI Agent now requires users to have the `aiassist` role in their user profile to access AI features.

## Role Field Structure
- Location: `user_profiles.role` (TEXT field)
- Default: `'fan'`
- Allowed values: Any text (no constraint)
- **Currently single-role**: Each user has ONE role at a time

## Supported Roles
- `fan` - Default role, no AI assistant access
- `artist` - Artist features access
- `admin` - Full admin access + AI assistant access
- `aiassist` - AI assistant access (new role for this feature)

## Granting AI Assistant Access

### Method 1: Direct SQL Update
```sql
-- Grant aiassist role to a specific user by email
UPDATE user_profiles 
SET role = 'aiassist' 
WHERE email = 'user@example.com';

-- Grant aiassist role to a specific user by user_id
UPDATE user_profiles 
SET role = 'aiassist' 
WHERE user_id = 'user-uuid-here';
```

### Method 2: Bulk Grant to Rakov Family
```sql
-- Grant aiassist role to all users in the rakov family (matching avatar_url)
UPDATE user_profiles 
SET role = 'aiassist' 
WHERE avatar_url = 'https://your-rakov-family-avatar-url.com/image.jpg';
```

## Checking User Roles

### View all users with aiassist role
```sql
SELECT user_id, email, username, role, created_at 
FROM user_profiles 
WHERE role = 'aiassist'
ORDER BY created_at DESC;
```

### View rakov family members
```sql
SELECT user_id, email, username, role, avatar_url 
FROM user_profiles 
WHERE avatar_url = 'https://your-rakov-family-avatar-url.com/image.jpg';
```

## Protected Endpoints
These API endpoints now require `aiassist` or `admin` role:
- `/api/smart-conversation` - Main AI chat interface
- `/api/web-search` - Brave Search API access

## Family Sharing (Rakov Architecture)
Users with matching `avatar_url` can now:
- View each other's conversations
- View and manage shared shopping lists
- View and manage shared inventory items
- Access each other's search cache

This is independent of the `aiassist` role requirement. To use these features, users must:
1. Have `aiassist` or `admin` role (for AI access)
2. Share the same `avatar_url` value (for family sharing)

## Migration Notes
- Role field is currently single-value TEXT
- To support multiple roles per user, would need to migrate to TEXT[] array
- Current implementation is sufficient for most use cases (one primary role + admin override)

## Example: Complete Setup for Rakov Family

```sql
-- Step 1: Set the family avatar URL for all family members
UPDATE user_profiles 
SET avatar_url = 'https://fandragon.com/family-avatars/rakov-family.jpg'
WHERE email IN ('lois@rakov.com', 'michael@rakov.com', 'sarah@rakov.com');

-- Step 2: Grant aiassist role to family members
UPDATE user_profiles 
SET role = 'aiassist' 
WHERE email IN ('lois@rakov.com', 'michael@rakov.com', 'sarah@rakov.com');

-- Step 3: Verify setup
SELECT username, email, role, avatar_url 
FROM user_profiles 
WHERE email IN ('lois@rakov.com', 'michael@rakov.com', 'sarah@rakov.com');
```

## Testing Access

After granting `aiassist` role, users should be able to:
- ✅ Access `/chat` page and use AI assistant
- ✅ Perform web searches via AI
- ✅ Save shopping lists, inventory, email drafts
- ✅ View family members' saved items (if same avatar_url)
- ❌ Access should fail with 403 if role is 'fan' or other value

## Error Messages

### 403 Access Denied - Missing Role
```json
{
  "error": "Access denied - AI assistant requires 'aiassist' role",
  "currentRole": "fan"
}
```

### 401 Authentication Required
```json
{
  "error": "Authentication required"
}
```