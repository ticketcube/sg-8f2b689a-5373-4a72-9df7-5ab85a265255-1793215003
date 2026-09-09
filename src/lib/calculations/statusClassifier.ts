/**
 * Marketing Status Classification
 * 
 * Determine marketing recommendation status and generate recommendations.
 */

import type { PacingStatus, MarketingRecommendation } from '@/types/calculator';

interface StatusInput {
  projectedFinalTickets: number;
  targetTickets: number;
  currentTicketsSold: number;
  daysToEvent: number;
  totalMarketingBudget: number;
  blendedCostPerTicket: number;
  ticketGap: number;
}

/**
 * Classify marketing status and generate recommendations
 */
export function classifyMarketingStatus(input: StatusInput): MarketingRecommendation {
  const { projectedFinalTickets, targetTickets, ticketGap } = input;
  
  const percentOfTarget = (projectedFinalTickets / targetTickets) * 100;
  const gapPct = (ticketGap / targetTickets) * 100;

  if (percentOfTarget >= 100) {
    return {
      status: 'green',
      statusLabel: 'AHEAD OF PACE',
      recommendation:
        'Market is currently pacing ahead of target. Maintain core media investment and test whether budget can be shifted toward higher-performing channels or reserved for final-week demand capture.',
      insights: [
        'Projected to exceed target sell-through',
        'Consider reserving budget for last-minute demand capture',
        'Test reallocating to highest-performing channels',
      ],
      suggestedActions: [
        'Monitor daily velocity to confirm trend',
        'Identify top-performing channels for optimization',
        'Reserve 15-20% of budget for final week push',
      ],
    };
  } else if (gapPct <= 10) {
    return {
      status: 'yellow',
      statusLabel: 'SLIGHTLY BEHIND',
      recommendation:
        'Market is below target but recoverable. Reallocate budget toward channels producing the lowest cost per incremental ticket and strengthen retargeting/search/CRM.',
      insights: [
        `Projected ${Math.round(gapPct)}% below target`,
        'Gap is recoverable with optimization',
        'Focus on demand capture channels',
      ],
      suggestedActions: [
        'Shift budget to lowest-CPT channels',
        'Increase retargeting and paid search',
        'Activate CRM campaigns to warm audience',
        'Test higher conversion audiences',
      ],
    };
  } else if (gapPct <= 25) {
    return {
      status: 'orange',
      statusLabel: 'SIGNIFICANTLY BEHIND',
      recommendation:
        'Market requires intervention. Diagnose whether the issue is awareness, audience, conversion, pricing, inventory, or product positioning before simply increasing media spend.',
      insights: [
        `Projected ${Math.round(gapPct)}% below target`,
        'Requires strategic intervention',
        'Diagnose root cause before increasing spend',
      ],
      suggestedActions: [
        'Run market diagnostic analysis',
        'Test pricing and offer strategies',
        'Evaluate creative performance',
        'Check competitive calendar',
        'Assess audience-market fit',
        'Consider limited-time promotions',
      ],
    };
  } else {
    return {
      status: 'red',
      statusLabel: 'SEVERELY BEHIND',
      recommendation:
        'Market is materially underperforming. Increasing media alone may not solve the problem. Evaluate pricing, offer strategy, venue capacity, event positioning, audience-market fit, competitive calendar and inventory before increasing spend.',
      insights: [
        `Projected ${Math.round(gapPct)}% below target`,
        'Fundamental issue beyond media spend',
        'Requires strategic reassessment',
      ],
      suggestedActions: [
        'Conduct comprehensive market diagnostic',
        'Evaluate pricing strategy and offers',
        'Assess product-market fit',
        'Review venue and capacity assumptions',
        'Analyze competitive landscape',
        'Consider event repositioning',
        'Explore partnership opportunities',
      ],
    };
  }
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: 'green' | 'yellow' | 'orange' | 'red'): string {
  const colors = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };
  
  return colors[status];
}

/**
 * Get status background color for UI display
 */
export function getStatusBgColor(status: 'green' | 'yellow' | 'orange' | 'red'): string {
  const colors = {
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
  };
  
  return colors[status];
}