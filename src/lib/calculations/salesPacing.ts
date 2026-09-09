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
 * Calculate current sales velocity (tickets per day)
 */
export function calculateSalesVelocity(
  currentTicketsSold: number,
  daysElapsed: number
): number {
  if (daysElapsed <= 0) return 0;
  return currentTicketsSold / daysElapsed;
}

/**
 * Calculate required daily sales to hit target
 */
export function calculateRequiredDailySales(
  ticketsRemaining: number,
  daysToEvent: number
): number {
  if (daysToEvent <= 0) return 0;
  return ticketsRemaining / daysToEvent;
}

/**
 * Calculate projected final ticket sales
 */
export function calculateProjectedFinalSales(
  currentTicketsSold: number,
  currentVelocity: number,
  expectedOrganicSalesPerDay: number,
  daysToEvent: number
): number {
  // Use the higher of current velocity or expected organic
  const effectiveVelocity = Math.max(currentVelocity, expectedOrganicSalesPerDay);
  return currentTicketsSold + (effectiveVelocity * daysToEvent);
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
 * Classify pacing status based on current performance vs target
 */
export function classifyPacingStatus(
  currentTicketsSold: number,
  targetTickets: number,
  daysToEvent: number,
  ticketsRemaining: number
): PacingStatus {
  const percentOfTarget = (currentTicketsSold / targetTickets) * 100;
  const requiredDailyRate = daysToEvent > 0 ? ticketsRemaining / daysToEvent : 0;
  const daysElapsed = 90 - daysToEvent; // Assume 90-day on-sale period
  const currentDailyRate = daysElapsed > 0 ? currentTicketsSold / daysElapsed : 0;

  // Critical: Less than 70% sold with less than 14 days remaining
  if (percentOfTarget < 70 && daysToEvent <= 14) {
    return 'critical';
  }

  // Behind: Current pace won't meet target
  if (currentDailyRate < requiredDailyRate * 0.9) {
    return 'behind';
  }

  // Ahead: Over 100% of target already
  if (percentOfTarget >= 100) {
    return 'ahead';
  }

  // On pace: Within 10% of required rate
  return 'on_pace';
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