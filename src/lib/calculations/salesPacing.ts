/**
 * Sales Pacing Calculations
 * 
 * Calculate velocity, projections, and pacing status.
 */

import type { SalesPacing, CalculatedPacing, PacingStatus } from '@/types/calculator';

interface PacingInput {
  currentTicketsSold: number;
  targetTickets: number;
  daysToEvent: number;
  expectedOrganicSalesPerDay: number;
}

/**
 * Calculate all sales pacing metrics
 */
export function calculateSalesPacing(input: PacingInput): CalculatedPacing {
  const {
    currentTicketsSold,
    targetTickets,
    daysToEvent,
    expectedOrganicSalesPerDay,
  } = input;

  // Current Velocity (sales per day based on recent history)
  // In real implementation, this would be calculated from historical data
  // For now, use organic sales as baseline
  const currentVelocity = expectedOrganicSalesPerDay;

  // Tickets Remaining
  const ticketsRemaining = Math.max(0, targetTickets - currentTicketsSold);

  // Required Daily Sales to hit target
  const requiredDailySales = daysToEvent > 0
    ? ticketsRemaining / daysToEvent
    : 0;

  // Required Weekly Sales
  const requiredWeeklySales = requiredDailySales * 7;

  // Percent of Target Sold
  const percentOfTargetSold = (currentTicketsSold / targetTickets) * 100;

  // Percent of Target Remaining
  const percentOfTargetRemaining = 100 - percentOfTargetSold;

  // Projected Final Tickets (current + expected organic sales remaining)
  const projectedOrganicSales = currentVelocity * daysToEvent;
  const projectedFinalTickets = currentTicketsSold + projectedOrganicSales;

  // Projected Sell-Through % (need venue capacity from parent)
  // This will be calculated in the parent component
  const projectedSellThroughPct = 0; // Placeholder

  // Ticket Gap (tickets short of target based on projection)
  const ticketGap = Math.max(0, targetTickets - projectedFinalTickets);

  return {
    currentVelocity,
    requiredDailySales,
    requiredWeeklySales,
    percentOfTargetSold,
    percentOfTargetRemaining,
    projectedFinalTickets,
    projectedSellThroughPct,
    ticketGap,
  };
}

/**
 * Classify pacing status based on current vs required velocity
 */
export function classifyPacingStatus(
  projectedFinalTickets: number,
  targetTickets: number
): PacingStatus {
  const percentOfTarget = (projectedFinalTickets / targetTickets) * 100;

  if (percentOfTarget >= 100) {
    return 'ahead';
  } else if (percentOfTarget >= 95) {
    return 'on_pace';
  } else if (percentOfTarget >= 85) {
    return 'slightly_behind';
  } else {
    return 'significantly_behind';
  }
}

/**
 * Calculate projected final sell-through percentage
 */
export function calculateProjectedSellThrough(
  projectedFinalTickets: number,
  venueCapacity: number
): number {
  return (projectedFinalTickets / venueCapacity) * 100;
}