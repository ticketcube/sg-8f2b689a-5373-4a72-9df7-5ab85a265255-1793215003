/**
 * Blended Media Metrics
 * 
 * Calculate aggregate metrics across all media channels.
 */

import type { MediaChannelCalculated, MediaMixSummary } from '@/types/calculator';

/**
 * Calculate blended metrics across all channels
 */
export function calculateMediaMixSummary(
  channels: MediaChannelCalculated[]
): MediaMixSummary {
  const totalBudget = channels.reduce((sum, ch) => sum + ch.budget, 0);
  const totalImpressions = channels.reduce((sum, ch) => sum + ch.impressions, 0);
  const totalClicks = channels.reduce((sum, ch) => sum + ch.clicks, 0);
  const totalConversions = channels.reduce((sum, ch) => sum + ch.conversions, 0);
  const totalAttributedTickets = channels.reduce((sum, ch) => sum + ch.attributedTickets, 0);
  const totalIncrementalTickets = channels.reduce((sum, ch) => sum + ch.incrementalTickets, 0);

  // Blended Cost Per Ticket
  const blendedCostPerTicket = totalIncrementalTickets > 0
    ? totalBudget / totalIncrementalTickets
    : 0;

  // Blended ROAS
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);
  const blendedRoas = totalBudget > 0 ? totalRevenue / totalBudget : 0;

  return {
    totalBudget,
    totalImpressions,
    totalClicks,
    totalConversions,
    totalAttributedTickets,
    totalIncrementalTickets,
    blendedCostPerTicket,
    blendedRoas,
    channels,
  };
}

/**
 * Calculate marketing efficiency score
 * 0-100 scale based on ROAS and CPT relative to benchmarks
 */
export function calculateMarketingEfficiency(
  blendedRoas: number,
  blendedCpt: number,
  benchmarkRoas: number = 3.0,
  benchmarkCpt: number = 50
): number {
  const roasScore = Math.min(100, (blendedRoas / benchmarkRoas) * 50);
  const cptScore = Math.min(50, (benchmarkCpt / blendedCpt) * 50);
  
  return Math.round(roasScore + cptScore);
}