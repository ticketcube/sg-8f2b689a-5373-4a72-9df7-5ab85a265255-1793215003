---
title: Sales Pacing Dashboard Section
status: done
priority: high
type: feature
tags: [ui, dashboard, sales-pacing]
created_by: agent
created_at: 2026-09-09T19:05:41Z
position: 1
---

## Notes

Build Section 2: Sales Pacing - velocity tracking, status classification, and projections. This shows whether the event is selling fast enough to hit targets.

Components needed:
- Sales pacing input form (days to event, organic sales assumptions)
- Pacing status card (ahead/on/behind/critical with visual indicators)
- Velocity metrics card (current vs required daily sales)
- Sales pacing chart (Recharts visualization of actual vs target trajectory)

Status classification:
- Green (Ahead): Over target pace
- Blue (On Pace): Within 10% of required velocity
- Orange (Behind): Below required velocity
- Red (Critical): <70% sold with <14 days remaining

## Checklist

- [x] Install Recharts for data visualization
- [x] Create `SalesPacingForm.tsx` (days to event, organic sales/day, historical %)
- [x] Create `PacingStatusCard.tsx` (visual status with color-coded badges)
- [x] Create `VelocityMetricsCard.tsx` (current vs required velocity analysis)
- [x] Create `SalesPacingChart.tsx` (Recharts line chart - actual/target/projected)
- [x] Integrate pacing calculations from calculation engine
- [x] Add status classification logic (green/yellow/orange/red)
- [x] Wire up all components in calculator page
- [x] Add real-time updates as inputs change

## Acceptance

- User can see current sales velocity vs required velocity
- Pacing status updates based on performance (ahead/on/behind/critical)
- Chart visualizes sales trajectory with projections
- All metrics calculate correctly and update in real-time