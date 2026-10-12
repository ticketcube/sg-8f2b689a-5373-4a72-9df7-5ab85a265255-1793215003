---
title: AI Loft Inventory - Implementation Plan
status: todo
priority: high
type: feature
tags: [inventory, video-processing, ai]
created_by: agent
created_at: 2026-10-12T22:22:00Z
position: 16
---

## Notes

Integrate AI Loft Inventory system into current project. The system analyzes property videos using AI to create structured inventories of physical objects.

**Key Integration Points:**
- Reuse existing `user_profiles` table for authentication
- Same Supabase instance already configured
- Add Roboflow API for object detection
- Video upload/processing pipeline
- Inventory management UI

**Database Tables Needed:**
- `projects` - Inventory projects (one per property)
- `videos` - Uploaded videos with processing status
- `video_frames` - Extracted frames from videos
- `detections` - AI-detected objects in frames
- `inventory_items` - Deduplicated unique objects
- `item_images` - Best images for each item
- `item_detections` - Junction table linking items to detections

**Optional Enhancement Tables:**
- `organizations` - Team/company support
- `organization_members` - Team membership
- `project_collaborators` - Project sharing
- `audit_logs` - Change tracking

## Checklist

### Phase 1: Database Setup
- [ ] Create migration file for inventory schema (projects, videos, video_frames, detections, inventory_items, item_images, item_detections)
- [ ] Add RLS policies for user-based access control
- [ ] Link to existing user_profiles table via foreign keys
- [ ] Add Roboflow API credentials to .env.local

### Phase 2: Design System
- [ ] Update globals.css with Industrial Data Workshop theme colors and IBM Plex fonts
- [ ] Update tailwind.config.ts with inventory system color palette
- [ ] Ensure theme coexists with existing Family AI Agent design

### Phase 3: Core Utilities
- [ ] Create src/lib/videoFrameExtractor.ts - client-side frame extraction
- [ ] Create src/lib/objectDetection.ts - Roboflow API integration
- [ ] Add TypeScript types to src/types/inventory.ts

### Phase 4: API Routes
- [ ] Create src/pages/api/inventory/process-video.ts - video processing endpoint
- [ ] Create src/pages/api/inventory/projects.ts - CRUD for projects
- [ ] Create src/pages/api/inventory/items.ts - CRUD for inventory items

### Phase 5: UI Components
- [ ] Create src/components/inventory/ProjectCard.tsx - project overview card
- [ ] Create src/components/inventory/ItemCard.tsx - inventory item display
- [ ] Create src/components/inventory/VideoUpload.tsx - video upload interface
- [ ] Create src/components/inventory/AddItemDialog.tsx - manual item creation
- [ ] Create src/components/inventory/Navigation.tsx - inventory navigation

### Phase 6: Pages
- [ ] Create src/pages/inventory/index.tsx - projects dashboard with stats
- [ ] Create src/pages/inventory/[projectId].tsx - project detail with video upload
- [ ] Create src/pages/inventory/[projectId]/items.tsx - inventory grid with filters
- [ ] Add navigation link in main app to access inventory system

### Phase 7: Integration & Polish
- [ ] Verify video upload to Supabase Storage works
- [ ] Test frame extraction and object detection pipeline
- [ ] Add demo data for testing
- [ ] Document usage in README

## Acceptance

- User can create inventory projects and upload videos
- Videos are processed to extract frames and detect objects
- Inventory items are displayed in a searchable, filterable grid
- Manual item creation works via AddItemDialog
- All features work with existing user authentication