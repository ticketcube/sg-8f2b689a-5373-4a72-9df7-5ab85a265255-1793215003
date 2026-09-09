/**
 * Ticket Economics Calculations
 * 
 * Pure functions for calculating ticket and revenue metrics.
 * No side effects, no React dependencies.
 */

import type { TicketEconomics, CalculatedEconomics } from '@/types/calculator';

/**
 * Calculate all derived ticket economics metrics
 */
export function calculateTicketEconomics(
  input: TicketEconomics
): CalculatedEconomics {
  const {
    venueCapacity,
    targetSellThroughPct,
    currentTicketsSold,
    avgTicketPrice,
  } = input;

  // Total Revenue Potential = Capacity × Avg Ticket Price
  const totalRevenuePotential = venueCapacity * avgTicketPrice;

  // Target Tickets = Capacity × Target Sell-Through %
  const targetTickets = Math.round(venueCapacity * (targetSellThroughPct / 100));

  // Tickets Remaining = Target - Current Sold
  const ticketsRemaining = Math.max(0, targetTickets - currentTicketsSold);

  // Current Sell-Through % = (Current Sold / Capacity) × 100
  const currentSellThroughPct = (currentTicketsSold / venueCapacity) * 100;

  // Revenue Remaining = Target Revenue - Current Revenue
  const revenueRemaining = Math.max(
    0,
    input.targetGrossRevenue - input.currentGrossRevenue
  );

  return {
    totalRevenuePotential,
    targetTickets,
    ticketsRemaining,
    currentSellThroughPct,
    revenueRemaining,
  };
}

/**
 * Calculate weighted average ticket price based on premium/standard mix
 */
export function calculateWeightedTicketPrice(
  premiumTicketPct: number,
  premiumTicketPrice: number,
  standardTicketPrice: number
): number {
  const premiumWeight = premiumTicketPct / 100;
  const standardWeight = 1 - premiumWeight;
  
  return (premiumTicketPrice * premiumWeight) + (standardTicketPrice * standardWeight);
}

/**
 * Calculate potential gross revenue at target sell-through
 */
export function calculateTargetGrossRevenue(
  venueCapacity: number,
  targetSellThroughPct: number,
  avgTicketPrice: number
): number {
  const targetTickets = venueCapacity * (targetSellThroughPct / 100);
  return targetTickets * avgTicketPrice;
}

/**
 * Calculate tickets needed to reach revenue goal
 */
export function calculateTicketsNeededForRevenue(
  targetRevenue: number,
  currentRevenue: number,
  avgTicketPrice: number
): number {
  const revenueGap = targetRevenue - currentRevenue;
  return Math.ceil(revenueGap / avgTicketPrice);
}