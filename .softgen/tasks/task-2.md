---
title: Database Schema Design for Event Marketing Calculator
status: todo
priority: urgent
type: chore
tags: [database, schema, supabase]
created_by: agent
created_at: 2026-09-09T19:05:41Z
position: 2
---

## Notes

Design complete Supabase database schema for the Live Event Market Calculator. This is the foundation for the entire application pivot.

Key requirements:
- Support multiple events and markets per user
- Store media plan configurations (8 paid channels + CRM)
- Enable scenario comparisons
- Track historical performance data
- Support market comparison dashboards
- Allow sharing/collaboration (future)

## Checklist

- [ ] Design `events` table with all event economics fields
- [ ] Design `markets` table for market-specific configurations
- [ ] Design `media_plans` table linking events to channels
- [ ] Design `media_channels` table for channel-specific metrics
- [ ] Design `scenarios` table for what-if analysis
- [ ] Design `benchmarks` table for historical comparison data
- [ ] Design `user_preferences` table for settings
- [ ] Create complete SQL migration file with all tables
- [ ] Define appropriate indexes for performance
- [ ] Set up RLS policies (authenticated users own their data)
- [ ] Generate TypeScript types

## Acceptance

- All tables created in Supabase with proper relationships
- RLS policies prevent unauthorized access
- TypeScript types generated and compilable
- Can create, read, update, delete events/markets/plans via Supabase client