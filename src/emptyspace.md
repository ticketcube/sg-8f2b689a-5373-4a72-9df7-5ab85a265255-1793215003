# AI Loft Inventory - Project Documentation

**Version:** 1.0  
**Created:** 2026-10-12  
**Supabase Project:** `agyoehyzvergiiwdbzmz`

---

## 🎯 Project Overview

Professional video-to-inventory application that analyzes loft/property videos using AI to create structured inventories of physical objects.

**Target Users:** Estate managers, moving companies, insurance agents, property managers

**Current Status:** MVP Phase - UI complete, database schema deployed, video processing pipeline in development

---

## 🗄️ Database Schema

### Supabase Connection Details

```env
NEXT_PUBLIC_SUPABASE_URL=https://agyoehyzvergiiwdbzmz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW9laHl6dmVyZ2lpd2Riem16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzEzNjYsImV4cCI6MjA3NDkwNzM2Nn0.GWK4LrmIlU1VG1bVwL1yMaaXHIQzPPKdxuA-KT_oZ0Y
```

### Core Tables

**Database migrations already deployed to Supabase project:**

1. **projects** - Inventory projects (one per property/loft)
   - Fields: id, name, description, user_id, organization_id, visibility, timestamps
   - RLS: User-based access control with organization support

2. **videos** - Uploaded videos with processing status
   - Fields: id, project_id, filename, storage_url, duration, processing_status, processing_stage, error_message, timestamps
   - Processing statuses: pending, uploading, processing, complete, error

3. **video_frames** - Extracted frames from videos
   - Fields: id, video_id, timestamp, image_url, metadata (JSONB), created_at

4. **detections** - Individual object detections in frames
   - Fields: id, video_id, frame_id, object_type, tracking_id, confidence, bounding_box (JSONB), embedding (VECTOR), metadata (JSONB), created_at

5. **inventory_items** - Unique physical objects (deduplicated across videos)
   - Fields: id, project_id, item_number, name, category, subcategory, description, color, material, brand, model, condition, distinctive_features, notes
   - AI confidence scores: object_confidence, match_confidence, brand_confidence
   - Review workflow: review_status (needs_review, confirmed, flagged), review_notes

6. **item_images** - Selected best images for each inventory item
   - Fields: id, inventory_item_id, video_id, frame_id, image_url, timestamp, quality_score, selected, display_order

7. **item_detections** - Junction table linking inventory items to source detections

### Authentication & Authorization Tables

8. **user_profiles** - Extended user information
   - Links to auth.users(id)
   - Fields: email, full_name, company_name, role (user, team_member, admin, super_admin), avatar_url, phone, preferences (JSONB)

9. **organizations** - Companies/teams
   - Fields: id, name, slug, description, logo_url, settings (JSONB)

10. **organization_members** - Organization membership
    - Roles: owner, admin, member, viewer

11. **project_collaborators** - Project sharing
    - Permissions: view, edit, admin

12. **audit_logs** - Change tracking
    - Fields: user_id, action, resource_type, resource_id, old_data, new_data, ip_address, user_agent

### Key Database Features

- **Row Level Security (RLS):** Comprehensive policies for multi-tenant access control
- **Automatic Triggers:** updated_at timestamps, user profile creation on signup
- **Helper Functions:** `user_has_project_permission()`, `handle_new_user()`, `log_audit_entry()`
- **Vector Support:** Embedding column for object similarity matching
- **JSONB Fields:** Flexible metadata storage for detections, settings, preferences

---

## 🎨 Design System

### Theme: Industrial Data Workshop

**Aesthetic:** Utilitarian + modern AI interface, clean grids, visual-first layout, generous whitespace, tabular data emphasis

### Color Palette (HSL values in CSS variables)

```css
:root {
  --primary: 215 25% 27%;        /* deep slate */
  --secondary: 220 14% 96%;      /* cool light */
  --accent: 43 96% 56%;          /* amber */
  --success: 142 76% 36%;        /* emerald */
  --background: 220 14% 96%;     /* cool light */
  --foreground: 215 25% 27%;     /* deep slate */
  --muted: 220 14% 91%;          /* cool neutral */
  --border: 220 13% 83%;         /* subtle border */
  
  /* shadcn/ui semantic tokens preserved */
  --card: 220 14% 96%;
  --card-foreground: 215 25% 27%;
  --popover: 0 0% 100%;
  --popover-foreground: 215 25% 27%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;
  --input: 220 13% 83%;
  --ring: 215 25% 27%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
}
```

### Typography

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

font-family: {
  sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
  mono: ['IBM Plex Mono', 'Courier New', 'monospace']
}
```

**Usage:**
- Headings: IBM Plex Sans (600, 700)
- Body: IBM Plex Sans (400, 500)
- Data/Code: IBM Plex Mono (400, 500)

---

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 15.5 (Page Router)
- **React:** 19.2
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS 3.4 + shadcn/ui components
- **Database:** Supabase (PostgreSQL with RLS)
- **Storage:** Supabase Storage (for videos and images)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

### External Services

**Roboflow API (Object Detection):**
```env
ROBOFLOW_API_KEY=yxpEAYxnIFymIcquppznu
ROBOFLOW_MODEL=microsoft-coco/3
ROBOFLOW_VERSION=3
ROBOFLOWW_Workspace ID=alan-rakov
```

### Project Structure

```
src/
├── components/
│   ├── Navigation.tsx           # Main nav with project switcher
│   ├── AddItemDialog.tsx        # Manual item creation form
│   ├── SEO.tsx                  # SEO meta tags component
│   ├── ThemeSwitch.tsx          # Dark/light mode toggle
│   └── ui/                      # shadcn/ui components (44 components)
├── contexts/
│   └── ThemeProvider.tsx        # Theme context wrapper
├── hooks/
│   ├── use-mobile.tsx           # Mobile detection hook
│   └── use-toast.ts             # Toast notification system
├── lib/
│   ├── supabase.ts              # Supabase client + TypeScript types
│   ├── utils.ts                 # cn() utility for class merging
│   ├── videoFrameExtractor.ts   # Client-side video frame extraction
│   └── objectDetection.ts       # Roboflow API integration
├── pages/
│   ├── index.tsx                # Dashboard (project overview + stats)
│   ├── inventory.tsx            # Inventory grid view with filters
│   ├── project/[id].tsx         # Project detail page
│   └── api/
│       ├── hello.ts             # API health check
│       └── process-video.ts     # Video processing API endpoint
└── styles/
    └── globals.css              # Global styles + CSS variables

supabase/
└── migrations/
    ├── 001_initial_schema.sql   # Core database schema
    ├── 002_demo_data.sql        # Sample data for testing
    ├── 003_auth_system.sql      # Authentication & authorization
    └── 004_demo_auth_data.sql   # Demo users and projects
```

---

## 🔧 Key Implementation Patterns

### Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions aligned with database schema
export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Video = {
  id: string;
  project_id: string;
  filename: string;
  storage_url: string | null;
  duration: number | null;
  processing_status: "pending" | "uploading" | "processing" | "complete" | "error";
  processing_stage: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  project_id: string;
  item_number: number;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  // ... all fields as per schema
  review_status: "needs_review" | "confirmed" | "flagged";
  created_at: string;
  updated_at: string;
};

export type ItemImage = {
  id: string;
  inventory_item_id: string;
  video_id: string;
  frame_id: string | null;
  image_url: string;
  timestamp: number | null;
  quality_score: number | null;
  selected: boolean;
  display_order: number;
  created_at: string;
};

export type InventoryItemWithImages = InventoryItem & {
  images: ItemImage[];
  video_count?: number;
};
```

### Data Fetching Pattern

```typescript
// Fetch inventory items with images
const { data: items, error } = await supabase
  .from("inventory_items")
  .select(`
    *,
    images:item_images(*)
  `)
  .eq("project_id", projectId)
  .order("item_number");
```

### Video Processing Pipeline (Client-Side)

**Frame Extraction:** `src/lib/videoFrameExtractor.ts`
- Extracts frames at 1 FPS intervals
- Returns base64 encoded JPEGs
- Used for client-side preview and processing

**Object Detection:** `src/lib/objectDetection.ts`
- Integrates with Roboflow API
- Detects objects in video frames
- Returns bounding boxes, labels, confidence scores

**Processing Flow:**
1. User uploads video → Supabase Storage
2. Client extracts frames using HTML5 video element
3. Frames sent to Roboflow API for object detection
4. Detections stored in `detections` table
5. AI clusters detections into unique items → `inventory_items`
6. Best frame selected for each item → `item_images`

### API Route Pattern

```typescript
// src/pages/api/process-video.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoId } = req.body;

  try {
    // Update processing status
    await supabase
      .from("videos")
      .update({ 
        processing_status: "processing",
        processing_stage: "Extracting frames"
      })
      .eq("id", videoId);

    // Processing logic here...

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

## 📋 Feature Implementation Status

### ✅ Completed (Phase 1 - MVP UI)

- Database schema with full relational structure
- Authentication & authorization system
- Dashboard with project overview and stats
- Inventory grid view with filtering, search, sorting
- Project detail page with video upload interface
- Manual item creation form (AddItemDialog)
- Design system (Industrial Data Workshop aesthetic)
- Demo data (15 sample items, 3 videos, 2 demo users)

### 🚧 In Progress

- Video upload to Supabase Storage
- Client-side frame extraction pipeline
- Object detection integration with Roboflow
- Processing status tracking and UI feedback

### 📝 Planned (Future Phases)

- AI-powered item enrichment (descriptions, brands, materials)
- Smart duplicate detection algorithm
- Image quality scoring and best frame selection
- Human review workflow (edit, merge, delete items)
- Bulk operations (approve all, flag all, export selected)
- CSV/Excel/PDF export
- Team collaboration features
- Mobile-responsive views
- Advanced search with filters
- Item history and audit trail

---

## 🚀 Setup Instructions for New Project

### 1. Environment Variables

Create `.env.local` with:

```env
# Supabase Connection (SHARED DATABASE)
NEXT_PUBLIC_SUPABASE_URL=https://agyoehyzvergiiwdbzmz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW9laHl6dmVyZ2lpd2Riem16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzEzNjYsImV4cCI6MjA3NDkwNzM2Nn0.GWK4LrmIlU1VG1bVwL1yMaaXHIQzPPKdxuA-KT_oZ0Y

# Roboflow API
ROBOFLOW_API_KEY=yxpEAYxnIFymIcquppznu
ROBOFLOW_MODEL=microsoft-coco/3
ROBOFLOW_VERSION=3
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3. Database Access

**Important:** The database schema is already deployed. You don't need to run migrations.

**Existing Supabase project:** `agyoehyzvergiiwdbzmz`

**Database includes:**
- All tables with RLS policies
- Demo data (2 projects, 3 videos, 15 inventory items)
- 2 demo users:
  - demo@example.com / demo123456
  - admin@example.com / admin123456

### 4. Copy Core Files

**Required files to implement:**

1. **src/lib/supabase.ts** - Supabase client with full TypeScript types
2. **src/styles/globals.css** - Design system CSS variables
3. **tailwind.config.ts** - Tailwind configuration with custom colors

**Optional (for full feature parity):**

- **src/components/Navigation.tsx** - Main navigation
- **src/lib/videoFrameExtractor.ts** - Frame extraction utilities
- **src/lib/objectDetection.ts** - Roboflow integration
- **src/pages/api/process-video.ts** - Video processing endpoint

### 5. Authentication Setup

The project uses Supabase Auth with email/password:

```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "demo@example.com",
  password: "demo123456"
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

---

## 🔐 Security & Permissions

### Row Level Security (RLS) Model

**Projects:** Users see only:
- Projects they own (user_id = auth.uid())
- Organization projects (if they're a member)
- Shared projects (via project_collaborators)

**Videos, Frames, Detections:** Inherit project permissions

**Inventory Items:** Inherit project permissions

**User Profiles:** Users can view/edit their own profile, admins see all

### Permission Levels

**Project Collaborators:**
- `view` - Read-only access
- `edit` - Can modify items, upload videos
- `admin` - Can manage collaborators, delete project

**Organization Members:**
- `viewer` - View organization projects
- `member` - Edit organization projects
- `admin` - Manage members, settings
- `owner` - Full control

### Helper Function

```sql
-- Check if user has permission on a project
SELECT user_has_project_permission(
  'project-uuid'::UUID,
  auth.uid(),
  'edit' -- or 'view', 'admin'
);
```

---

## 📊 Database Queries Reference

### Common Queries

**Fetch user's projects:**
```typescript
const { data } = await supabase
  .from("projects")
  .select("*")
  .order("created_at", { ascending: false });
```

**Get project with video count:**
```typescript
const { data } = await supabase
  .from("projects")
  .select(`
    *,
    videos:videos(count)
  `)
  .eq("id", projectId)
  .single();
```

**Fetch inventory items with images:**
```typescript
const { data } = await supabase
  .from("inventory_items")
  .select(`
    *,
    images:item_images(*)
  `)
  .eq("project_id", projectId)
  .order("item_number");
```

**Get items needing review:**
```typescript
const { data } = await supabase
  .from("inventory_items")
  .select("*")
  .eq("project_id", projectId)
  .eq("review_status", "needs_review")
  .order("created_at", { ascending: false });
```

**Update item review status:**
```typescript
await supabase
  .from("inventory_items")
  .update({ review_status: "confirmed" })
  .eq("id", itemId);
```

---

## 🎯 Data Model Relationships

```
projects (1) ----< (N) videos
projects (1) ----< (N) inventory_items
projects (N) ----< (N) project_collaborators

videos (1) ----< (N) video_frames
videos (1) ----< (N) detections
videos (1) ----< (N) item_images

inventory_items (1) ----< (N) item_images
inventory_items (1) ----< (N) item_detections

detections (1) ----< (N) item_detections

user_profiles (1) ----< (N) projects
user_profiles (N) ----< (N) organization_members
user_profiles (N) ----< (N) project_collaborators

organizations (1) ----< (N) organization_members
organizations (1) ----< (N) projects
```

---

## 🧪 Testing with Demo Data

### Demo User Credentials

```
User 1 (Regular User):
- Email: demo@example.com
- Password: demo123456
- Projects: 1 project with 15 items

User 2 (Admin):
- Email: admin@example.com  
- Password: admin123456
- Projects: 1 project (empty)
```

### Demo Project Data

**Project:** "Sample Loft Inventory" (id in database)
- 15 inventory items across categories (Furniture, Electronics, Decor, etc.)
- 3 sample videos (metadata only, no actual video files)
- Multiple images per item

**Categories present:**
- Furniture (sofa, desk, chair, dining table, bookshelf)
- Electronics (TV, laptop, router)
- Decor (painting, floor lamp, wall clock)
- Kitchenware (coffee maker)
- Storage (filing cabinet)
- Outdoor (bike)
- Textiles (area rug)

---

## 📝 Notes & Best Practices

### State Management
- Use React hooks (useState, useEffect) for local state
- Supabase client handles auth state automatically
- No Redux/Zustand needed for this project scale

### Real-time Updates
- Supabase Realtime can be enabled for live collaboration
- Subscribe to table changes:
  ```typescript
  supabase
    .channel('inventory-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'inventory_items' },
      (payload) => console.log(payload)
    )
    .subscribe()
  ```

### Error Handling
- Always check `error` in Supabase responses
- Display user-friendly error messages
- Log errors for debugging

### Performance
- Use Supabase's built-in pagination for large datasets
- Index frequently queried columns (already configured)
- Lazy load images with Next.js Image component

### TypeScript
- All database types defined in `src/lib/supabase.ts`
- Use type inference from Supabase for query results
- Strict mode enabled in tsconfig.json

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/agyoehyzvergiiwdbzmz
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui Components:** https://ui.shadcn.com
- **Roboflow API Docs:** https://docs.roboflow.com

---

## 📄 License & Contact

This project documentation is provided for internal development use. The database and API credentials are shared between authorized team members only.

**Last Updated:** 2026-10-12
**Document Version:** 1.0
**Project Phase:** MVP (Phase 1 Complete)# AI Loft Inventory - Project Documentation

**Version:** 1.0  
**Created:** 2026-10-12  
**Supabase Project:** `agyoehyzvergiiwdbzmz`

---

## 🎯 Project Overview

Professional video-to-inventory application that analyzes loft/property videos using AI to create structured inventories of physical objects.

**Target Users:** Estate managers, moving companies, insurance agents, property managers

**Current Status:** MVP Phase - UI complete, database schema deployed, video processing pipeline in development

---

## 🗄️ Database Schema

### Supabase Connection Details

```env
NEXT_PUBLIC_SUPABASE_URL=https://agyoehyzvergiiwdbzmz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW9laHl6dmVyZ2lpd2Riem16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzEzNjYsImV4cCI6MjA3NDkwNzM2Nn0.GWK4LrmIlU1VG1bVwL1yMaaXHIQzPPKdxuA-KT_oZ0Y
```

### Core Tables

**Database migrations already deployed to Supabase project:**

1. **projects** - Inventory projects (one per property/loft)
   - Fields: id, name, description, user_id, organization_id, visibility, timestamps
   - RLS: User-based access control with organization support

2. **videos** - Uploaded videos with processing status
   - Fields: id, project_id, filename, storage_url, duration, processing_status, processing_stage, error_message, timestamps
   - Processing statuses: pending, uploading, processing, complete, error

3. **video_frames** - Extracted frames from videos
   - Fields: id, video_id, timestamp, image_url, metadata (JSONB), created_at

4. **detections** - Individual object detections in frames
   - Fields: id, video_id, frame_id, object_type, tracking_id, confidence, bounding_box (JSONB), embedding (VECTOR), metadata (JSONB), created_at

5. **inventory_items** - Unique physical objects (deduplicated across videos)
   - Fields: id, project_id, item_number, name, category, subcategory, description, color, material, brand, model, condition, distinctive_features, notes
   - AI confidence scores: object_confidence, match_confidence, brand_confidence
   - Review workflow: review_status (needs_review, confirmed, flagged), review_notes

6. **item_images** - Selected best images for each inventory item
   - Fields: id, inventory_item_id, video_id, frame_id, image_url, timestamp, quality_score, selected, display_order

7. **item_detections** - Junction table linking inventory items to source detections

### Authentication & Authorization Tables

8. **user_profiles** - Extended user information
   - Links to auth.users(id)
   - Fields: email, full_name, company_name, role (user, team_member, admin, super_admin), avatar_url, phone, preferences (JSONB)

9. **organizations** - Companies/teams
   - Fields: id, name, slug, description, logo_url, settings (JSONB)

10. **organization_members** - Organization membership
    - Roles: owner, admin, member, viewer

11. **project_collaborators** - Project sharing
    - Permissions: view, edit, admin

12. **audit_logs** - Change tracking
    - Fields: user_id, action, resource_type, resource_id, old_data, new_data, ip_address, user_agent

### Key Database Features

- **Row Level Security (RLS):** Comprehensive policies for multi-tenant access control
- **Automatic Triggers:** updated_at timestamps, user profile creation on signup
- **Helper Functions:** `user_has_project_permission()`, `handle_new_user()`, `log_audit_entry()`
- **Vector Support:** Embedding column for object similarity matching
- **JSONB Fields:** Flexible metadata storage for detections, settings, preferences

---

## 🎨 Design System

### Theme: Industrial Data Workshop

**Aesthetic:** Utilitarian + modern AI interface, clean grids, visual-first layout, generous whitespace, tabular data emphasis

### Color Palette (HSL values in CSS variables)

```css
:root {
  --primary: 215 25% 27%;        /* deep slate */
  --secondary: 220 14% 96%;      /* cool light */
  --accent: 43 96% 56%;          /* amber */
  --success: 142 76% 36%;        /* emerald */
  --background: 220 14% 96%;     /* cool light */
  --foreground: 215 25% 27%;     /* deep slate */
  --muted: 220 14% 91%;          /* cool neutral */
  --border: 220 13% 83%;         /* subtle border */
  
  /* shadcn/ui semantic tokens preserved */
  --card: 220 14% 96%;
  --card-foreground: 215 25% 27%;
  --popover: 0 0% 100%;
  --popover-foreground: 215 25% 27%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;
  --input: 220 13% 83%;
  --ring: 215 25% 27%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
}
```

### Typography

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

font-family: {
  sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
  mono: ['IBM Plex Mono', 'Courier New', 'monospace']
}
```

**Usage:**
- Headings: IBM Plex Sans (600, 700)
- Body: IBM Plex Sans (400, 500)
- Data/Code: IBM Plex Mono (400, 500)

---

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 15.5 (Page Router)
- **React:** 19.2
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS 3.4 + shadcn/ui components
- **Database:** Supabase (PostgreSQL with RLS)
- **Storage:** Supabase Storage (for videos and images)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

### External Services

**Roboflow API (Object Detection):**
```env
ROBOFLOW_API_KEY=yxpEAYxnIFymIcquppznu
ROBOFLOW_MODEL=microsoft-coco/3
ROBOFLOW_VERSION=3
ROBOFLOWW_Workspace ID=alan-rakov
```

### Project Structure

```
src/
├── components/
│   ├── Navigation.tsx           # Main nav with project switcher
│   ├── AddItemDialog.tsx        # Manual item creation form
│   ├── SEO.tsx                  # SEO meta tags component
│   ├── ThemeSwitch.tsx          # Dark/light mode toggle
│   └── ui/                      # shadcn/ui components (44 components)
├── contexts/
│   └── ThemeProvider.tsx        # Theme context wrapper
├── hooks/
│   ├── use-mobile.tsx           # Mobile detection hook
│   └── use-toast.ts             # Toast notification system
├── lib/
│   ├── supabase.ts              # Supabase client + TypeScript types
│   ├── utils.ts                 # cn() utility for class merging
│   ├── videoFrameExtractor.ts   # Client-side video frame extraction
│   └── objectDetection.ts       # Roboflow API integration
├── pages/
│   ├── index.tsx                # Dashboard (project overview + stats)
│   ├── inventory.tsx            # Inventory grid view with filters
│   ├── project/[id].tsx         # Project detail page
│   └── api/
│       ├── hello.ts             # API health check
│       └── process-video.ts     # Video processing API endpoint
└── styles/
    └── globals.css              # Global styles + CSS variables

supabase/
└── migrations/
    ├── 001_initial_schema.sql   # Core database schema
    ├── 002_demo_data.sql        # Sample data for testing
    ├── 003_auth_system.sql      # Authentication & authorization
    └── 004_demo_auth_data.sql   # Demo users and projects
```

---

## 🔧 Key Implementation Patterns

### Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions aligned with database schema
export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Video = {
  id: string;
  project_id: string;
  filename: string;
  storage_url: string | null;
  duration: number | null;
  processing_status: "pending" | "uploading" | "processing" | "complete" | "error";
  processing_stage: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  project_id: string;
  item_number: number;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  // ... all fields as per schema
  review_status: "needs_review" | "confirmed" | "flagged";
  created_at: string;
  updated_at: string;
};

export type ItemImage = {
  id: string;
  inventory_item_id: string;
  video_id: string;
  frame_id: string | null;
  image_url: string;
  timestamp: number | null;
  quality_score: number | null;
  selected: boolean;
  display_order: number;
  created_at: string;
};

export type InventoryItemWithImages = InventoryItem & {
  images: ItemImage[];
  video_count?: number;
};
```

### Data Fetching Pattern

```typescript
// Fetch inventory items with images
const { data: items, error } = await supabase
  .from("inventory_items")
  .select(`
    *,
    images:item_images(*)
  `)
  .eq("project_id", projectId)
  .order("item_number");
```

### Video Processing Pipeline (Client-Side)

**Frame Extraction:** `src/lib/videoFrameExtractor.ts`
- Extracts frames at 1 FPS intervals
- Returns base64 encoded JPEGs
- Used for client-side preview and processing

**Object Detection:** `src/lib/objectDetection.ts`
- Integrates with Roboflow API
- Detects objects in video frames
- Returns bounding boxes, labels, confidence scores

**Processing Flow:**
1. User uploads video → Supabase Storage
2. Client extracts frames using HTML5 video element
3. Frames sent to Roboflow API for object detection
4. Detections stored in `detections` table
5. AI clusters detections into unique items → `inventory_items`
6. Best frame selected for each item → `item_images`

### API Route Pattern

```typescript
// src/pages/api/process-video.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoId } = req.body;

  try {
    // Update processing status
    await supabase
      .from("videos")
      .update({ 
        processing_status: "processing",
        processing_stage: "Extracting frames"
      })
      .eq("id", videoId);

    // Processing logic here...

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

## 📋 Feature Implementation Status

### ✅ Completed (Phase 1 - MVP UI)

- Database schema with full relational structure
- Authentication & authorization system
- Dashboard with project overview and stats
- Inventory grid view with filtering, search, sorting
- Project detail page with video upload interface
- Manual item creation form (AddItemDialog)
- Design system (Industrial Data Workshop aesthetic)
- Demo data (15 sample items, 3 videos, 2 demo users)

### 🚧 In Progress

- Video upload to Supabase Storage
- Client-side frame extraction pipeline
- Object detection integration with Roboflow
- Processing status tracking and UI feedback

### 📝 Planned (Future Phases)

- AI-powered item enrichment (descriptions, brands, materials)
- Smart duplicate detection algorithm
- Image quality scoring and best frame selection
- Human review workflow (edit, merge, delete items)
- Bulk operations (approve all, flag all, export selected)
- CSV/Excel/PDF export
- Team collaboration features
- Mobile-responsive views
- Advanced search with filters
- Item history and audit trail

---

## 🚀 Setup Instructions for New Project

### 1. Environment Variables

Create `.env.local` with:

```env
# Supabase Connection (SHARED DATABASE)
NEXT_PUBLIC_SUPABASE_URL=https://agyoehyzvergiiwdbzmz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW9laHl6dmVyZ2lpd2Riem16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzEzNjYsImV4cCI6MjA3NDkwNzM2Nn0.GWK4LrmIlU1VG1bVwL1yMaaXHIQzPPKdxuA-KT_oZ0Y

# Roboflow API
ROBOFLOW_API_KEY=yxpEAYxnIFymIcquppznu
ROBOFLOW_MODEL=microsoft-coco/3
ROBOFLOW_VERSION=3
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3. Database Access

**Important:** The database schema is already deployed. You don't need to run migrations.

**Existing Supabase project:** `agyoehyzvergiiwdbzmz`

**Database includes:**
- All tables with RLS policies
- Demo data (2 projects, 3 videos, 15 inventory items)
- 2 demo users:
  - demo@example.com / demo123456
  - admin@example.com / admin123456

### 4. Copy Core Files

**Required files to implement:**

1. **src/lib/supabase.ts** - Supabase client with full TypeScript types
2. **src/styles/globals.css** - Design system CSS variables
3. **tailwind.config.ts** - Tailwind configuration with custom colors

**Optional (for full feature parity):**

- **src/components/Navigation.tsx** - Main navigation
- **src/lib/videoFrameExtractor.ts** - Frame extraction utilities
- **src/lib/objectDetection.ts** - Roboflow integration
- **src/pages/api/process-video.ts** - Video processing endpoint

### 5. Authentication Setup

The project uses Supabase Auth with email/password:

```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "demo@example.com",
  password: "demo123456"
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

---

## 🔐 Security & Permissions

### Row Level Security (RLS) Model

**Projects:** Users see only:
- Projects they own (user_id = auth.uid())
- Organization projects (if they're a member)
- Shared projects (via project_collaborators)

**Videos, Frames, Detections:** Inherit project permissions

**Inventory Items:** Inherit project permissions

**User Profiles:** Users can view/edit their own profile, admins see all

### Permission Levels

**Project Collaborators:**
- `view` - Read-only access
- `edit` - Can modify items, upload videos
- `admin` - Can manage collaborators, delete project

**Organization Members:**
- `viewer` - View organization projects
- `member` - Edit organization projects
- `admin` - Manage members, settings
- `owner` - Full control

### Helper Function

```sql
-- Check if user has permission on a project
SELECT user_has_project_permission(
  'project-uuid'::UUID,
  auth.uid(),
  'edit' -- or 'view', 'admin'
);
```

---

## 📊 Database Queries Reference

### Common Queries

**Fetch user's projects:**
```typescript
const { data } = await supabase
  .from("projects")
  .select("*")
  .order("created_at", { ascending: false });
```

**Get project with video count:**
```typescript
const { data } = await supabase
  .from("projects")
  .select(`
    *,
    videos:videos(count)
  `)
  .eq("id", projectId)
  .single();
```

**Fetch inventory items with images:**
```typescript
const { data } = await supabase
  .from("inventory_items")
  .select(`
    *,
    images:item_images(*)
  `)
  .eq("project_id", projectId)
  .order("item_number");
```

**Get items needing review:**
```typescript
const { data } = await supabase
  .from("inventory_items")
  .select("*")
  .eq("project_id", projectId)
  .eq("review_status", "needs_review")
  .order("created_at", { ascending: false });
```

**Update item review status:**
```typescript
await supabase
  .from("inventory_items")
  .update({ review_status: "confirmed" })
  .eq("id", itemId);
```

---

## 🎯 Data Model Relationships

```
projects (1) ----< (N) videos
projects (1) ----< (N) inventory_items
projects (N) ----< (N) project_collaborators

videos (1) ----< (N) video_frames
videos (1) ----< (N) detections
videos (1) ----< (N) item_images

inventory_items (1) ----< (N) item_images
inventory_items (1) ----< (N) item_detections

detections (1) ----< (N) item_detections

user_profiles (1) ----< (N) projects
user_profiles (N) ----< (N) organization_members
user_profiles (N) ----< (N) project_collaborators

organizations (1) ----< (N) organization_members
organizations (1) ----< (N) projects
```

---

## 🧪 Testing with Demo Data

### Demo User Credentials

```
User 1 (Regular User):
- Email: demo@example.com
- Password: demo123456
- Projects: 1 project with 15 items

User 2 (Admin):
- Email: admin@example.com  
- Password: admin123456
- Projects: 1 project (empty)
```

### Demo Project Data

**Project:** "Sample Loft Inventory" (id in database)
- 15 inventory items across categories (Furniture, Electronics, Decor, etc.)
- 3 sample videos (metadata only, no actual video files)
- Multiple images per item

**Categories present:**
- Furniture (sofa, desk, chair, dining table, bookshelf)
- Electronics (TV, laptop, router)
- Decor (painting, floor lamp, wall clock)
- Kitchenware (coffee maker)
- Storage (filing cabinet)
- Outdoor (bike)
- Textiles (area rug)

---

## 📝 Notes & Best Practices

### State Management
- Use React hooks (useState, useEffect) for local state
- Supabase client handles auth state automatically
- No Redux/Zustand needed for this project scale

### Real-time Updates
- Supabase Realtime can be enabled for live collaboration
- Subscribe to table changes:
  ```typescript
  supabase
    .channel('inventory-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'inventory_items' },
      (payload) => console.log(payload)
    )
    .subscribe()
  ```

### Error Handling
- Always check `error` in Supabase responses
- Display user-friendly error messages
- Log errors for debugging

### Performance
- Use Supabase's built-in pagination for large datasets
- Index frequently queried columns (already configured)
- Lazy load images with Next.js Image component

### TypeScript
- All database types defined in `src/lib/supabase.ts`
- Use type inference from Supabase for query results
- Strict mode enabled in tsconfig.json

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/agyoehyzvergiiwdbzmz
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui Components:** https://ui.shadcn.com
- **Roboflow API Docs:** https://docs.roboflow.com

---

## 📄 License & Contact

This project documentation is provided for internal development use. The database and API credentials are shared between authorized team members only.

**Last Updated:** 2026-10-12
**Document Version:** 1.0
**Project Phase:** MVP (Phase 1 Complete)