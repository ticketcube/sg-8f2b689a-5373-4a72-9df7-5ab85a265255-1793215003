---
title: Calculation Engine Architecture
status: todo
priority: urgent
type: chore
tags: [architecture, calculations, business-logic]
created_by: agent
created_at: 2026-09-09T19:05:41Z
position: 3
---

## Notes

Build the core calculation engine as pure TypeScript functions, separate from React components. This is critical per the brief's architectural principle:

"Separate the application into: 1. Input assumptions 2. Calculation engine 3. Visualization 4. Recommendation engine"

The engine must calculate:
- Ticket economics (capacity, revenue, remaining)
- Sales pacing (velocity, projections, targets)
- Media metrics (impressions, clicks, conversions per channel)
- Blended costs (CPT, ROAS across all channels)
- Gap analysis (tickets needed, budget required)
- Status classifications (ahead/on/behind pace)

## Checklist

- [ ] Create `src/lib/calculations/` directory structure
- [ ] Build `ticketEconomics.ts` with revenue/capacity calculations
- [ ] Build `salesPacing.ts` with velocity/projection calculations
- [ ] Build `mediaMetrics.ts` with channel-level calculations (CPM, CPC, CTR, conversions)
- [ ] Build `blendedMetrics.ts` for aggregate calculations (total budget, blended CPT, overall ROAS)
- [ ] Build `incrementality.ts` for attribution vs incrementality adjustments
- [ ] Build `statusClassifier.ts` for pace status (green/yellow/orange/red)
- [ ] Build `gapAnalysis.ts` for target vs projected calculations
- [ ] Create comprehensive TypeScript interfaces for all inputs/outputs
- [ ] Write unit tests for critical calculations
- [ ] Document calculation formulas in JSDoc comments

## Acceptance

- All calculation functions are pure (no side effects)
- Functions accept typed inputs and return typed outputs
- Can calculate complete event performance from raw inputs
- Business logic isolated from UI rendering