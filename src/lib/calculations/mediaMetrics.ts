/**
 * Media Channel Calculations
 * 
 * Calculate impressions, clicks, conversions, cost per ticket, and ROAS
 * for individual media channels.
 */

import type { MediaChannelInput, MediaChannelCalculated } from '@/types/calculator';

/**
 * Calculate metrics for a single media channel
 */
export function calculateChannelMetrics(
  channel: MediaChannelInput,
  avgTicketPrice: number,
  totalBudget: number
): MediaChannelCalculated {
  const { channelType, budget, cpm, cpc, ctr, conversionRate, incrementalityFactor = 1.0 } = channel;

  let impressions = 0;
  let clicks = 0;

  // Calculate impressions and clicks based on channel type
  if (channelType === 'crm_email') {
    // CRM: Audience × Open Rate × Click Rate
    const { audienceSize = 0, openRate = 0, clickRate = 0 } = channel;
    impressions = audienceSize;
    const opens = audienceSize * openRate;
    clicks = opens * clickRate;
  } else if (cpm && cpm > 0) {
    // CPM-based channels
    impressions = (budget / cpm) * 1000;
    
    if (ctr && ctr > 0) {
      // Has CTR data
      clicks = impressions * ctr;
    }
  } else if (cpc && cpc > 0) {
    // CPC-based channels
    clicks = budget / cpc;
  }

  // Conversions (attributed tickets)
  const conversions = clicks * conversionRate;
  const attributedTickets = conversions;

  // Apply incrementality factor
  const incrementalTickets = attributedTickets * incrementalityFactor;

  // Cost Per Ticket
  const costPerTicket = incrementalTickets > 0 ? budget / incrementalTickets : 0;

  // Revenue (incremental tickets × avg ticket price)
  const revenue = incrementalTickets * avgTicketPrice;

  // ROAS (Return on Ad Spend)
  const roas = budget > 0 ? revenue / budget : 0;

  // Budget percentage
  const budgetPct = totalBudget > 0 ? (budget / totalBudget) * 100 : 0;

  return {
    channelType,
    budget,
    budgetPct,
    impressions,
    clicks,
    conversions,
    attributedTickets,
    incrementalTickets,
    costPerTicket,
    revenue,
    roas,
  };
}

/**
 * Calculate metrics for all channels
 */
export function calculateAllChannelMetrics(
  channels: MediaChannelInput[],
  avgTicketPrice: number
): MediaChannelCalculated[] {
  const totalBudget = channels.reduce((sum, ch) => sum + ch.budget, 0);

  return channels.map(channel =>
    calculateChannelMetrics(channel, avgTicketPrice, totalBudget)
  );
}

/**
 * Get default metrics for a channel type
 */
export function getDefaultChannelMetrics(channelType: string): Partial<MediaChannelInput> {
  const defaults: Record<string, Partial<MediaChannelInput>> = {
    tv_ctv: { cpm: 25, conversionRate: 0.002, incrementalityFactor: 0.8 },
    radio_audio: { cpm: 15, conversionRate: 0.0015, incrementalityFactor: 0.75 },
    ooh: { cpm: 20, conversionRate: 0.001, incrementalityFactor: 0.7 },
    paid_social: { cpm: 10, ctr: 0.015, conversionRate: 0.03, incrementalityFactor: 0.6 },
    paid_search: { cpc: 2.5, conversionRate: 0.05, incrementalityFactor: 0.9 },
    display_programmatic: { cpm: 5, ctr: 0.008, conversionRate: 0.02, incrementalityFactor: 0.5 },
    youtube_video: { cpm: 12, ctr: 0.012, conversionRate: 0.025, incrementalityFactor: 0.65 },
    retargeting: { cpc: 1.5, conversionRate: 0.08, incrementalityFactor: 0.4 },
    crm_email: { openRate: 0.25, clickRate: 0.15, conversionRate: 0.10, incrementalityFactor: 1.0 },
  };

  return defaults[channelType] || {};
}