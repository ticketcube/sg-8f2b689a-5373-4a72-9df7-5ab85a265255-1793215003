/**
 * Blended Media Metrics
 * 
 * Calculate aggregate metrics across all media channels.
 */

import type { MediaChannelCalculated, MediaMixSummary } from '@/types/calculator';

/**
 * Calculate blended/aggregate metrics across all media channels
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
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);

  // Blended Cost Per Ticket (use incremental tickets)
  const blendedCostPerTicket = totalIncrementalTickets > 0
    ? totalBudget / totalIncrementalTickets
    : 0;

  // Blended ROAS
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
 * Calculate media efficiency score (0-100)
 * Combines CPT performance vs benchmark and ROAS performance
 */
export function calculateMediaEfficiencyScore(
  blendedCpt: number,
  blendedRoas: number,
  benchmarkCpt: number = 25,
  benchmarkRoas: number = 5
): number {
  // CPT Score (0-50): Lower CPT is better
  // If CPT is 50% of benchmark = 50 points
  // If CPT equals benchmark = 25 points
  // If CPT is 2x benchmark = 0 points
  const cptScore = benchmarkCpt > 0 && blendedCpt > 0
    ? Math.max(0, Math.min(50, (benchmarkCpt / blendedCpt) * 50))
    : 25;

  // ROAS Score (0-50): Higher ROAS is better
  // If ROAS is 2x benchmark = 50 points
  // If ROAS equals benchmark = 25 points
  // If ROAS is 50% of benchmark = 0 points
  const roasScore = benchmarkRoas > 0 && blendedRoas > 0
    ? Math.max(0, Math.min(50, (blendedRoas / benchmarkRoas) * 50))
    : 25;

  return Math.round(cptScore + roasScore);
}

/**
 * Sort channels by efficiency (ROAS descending)
 */
export function sortChannelsByEfficiency(
  channels: MediaChannelCalculated[]
): MediaChannelCalculated[] {
  return [...channels].sort((a, b) => b.roas - a.roas);
}

/**
 * Find top performing channels (top 3 by ROAS)
 */
export function getTopPerformingChannels(
  channels: MediaChannelCalculated[],
  count: number = 3
): MediaChannelCalculated[] {
  return sortChannelsByEfficiency(channels).slice(0, count);
}

/**
 * Find underperforming channels (ROAS < 3.0 or CPT > $35)
 */
export function getUnderperformingChannels(
  channels: MediaChannelCalculated[],
  minRoas: number = 3.0,
  maxCpt: number = 35
): MediaChannelCalculated[] {
  return channels.filter(ch => ch.roas < minRoas || ch.costPerTicket > maxCpt);
}