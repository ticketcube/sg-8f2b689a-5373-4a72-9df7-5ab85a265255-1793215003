/**
 * Media Channel Calculations
 * 
 * Calculate impressions, clicks, conversions, cost per ticket, and ROAS for each channel.
 */

import type { MediaChannelInput, MediaChannelCalculated } from '@/types/calculator';

/**
 * Calculate all metrics for a single media channel
 */
export function calculateChannelMetrics(
  channel: MediaChannelInput,
  avgTicketPrice: number,
  totalBudget: number
): MediaChannelCalculated {
  const { budget, cpm, cpc, ctr = 0, conversionRate, incrementalityFactor = 1.0 } = channel;

  // Calculate impressions
  let impressions = 0;
  if (cpm !== undefined && cpm > 0) {
    impressions = (budget / cpm) * 1000;
  } else if (cpc !== undefined && cpc > 0 && ctr > 0) {
    // For CPC channels, work backwards from budget and CPC
    const clicks = budget / cpc;
    impressions = clicks / (ctr / 100);
  }

  // Calculate clicks
  let clicks = 0;
  if (cpc !== undefined && cpc > 0) {
    clicks = budget / cpc;
  } else if (ctr > 0 && impressions > 0) {
    clicks = impressions * (ctr / 100);
  }

  // Calculate conversions (ticket sales)
  const conversions = clicks * (conversionRate / 100);

  // Attributed tickets (raw conversions)
  const attributedTickets = Math.round(conversions);

  // Incremental tickets (accounting for incrementality)
  const incrementalTickets = Math.round(conversions * incrementalityFactor);

  // Cost per ticket (use incremental tickets for true cost)
  const costPerTicket = incrementalTickets > 0 ? budget / incrementalTickets : 0;

  // Revenue (incremental tickets × average price)
  const revenue = incrementalTickets * avgTicketPrice;

  // ROAS (Return on Ad Spend)
  const roas = budget > 0 ? revenue / budget : 0;

  // Budget percentage
  const budgetPct = totalBudget > 0 ? (budget / totalBudget) * 100 : 0;

  return {
    channelType: channel.channelType,
    budget,
    budgetPct,
    impressions: Math.round(impressions),
    clicks: Math.round(clicks),
    conversions: Math.round(conversions),
    attributedTickets,
    incrementalTickets,
    costPerTicket,
    revenue,
    roas,
  };
}

/**
 * Calculate metrics for CRM/Email channel (different input structure)
 */
export function calculateCRMMetrics(
  budget: number,
  audienceSize: number,
  openRate: number,
  clickRate: number,
  conversionRate: number,
  avgTicketPrice: number,
  totalBudget: number
): MediaChannelCalculated {
  // CRM treats "impressions" as emails sent (audience size)
  const impressions = audienceSize;

  // Opens
  const opens = audienceSize * (openRate / 100);

  // Clicks (from opens, not impressions)
  const clicks = opens * (clickRate / 100);

  // Conversions
  const conversions = clicks * (conversionRate / 100);

  // Tickets
  const attributedTickets = Math.round(conversions);
  const incrementalTickets = attributedTickets; // CRM typically 100% incremental

  // Cost per ticket
  const costPerTicket = incrementalTickets > 0 ? budget / incrementalTickets : 0;

  // Revenue
  const revenue = incrementalTickets * avgTicketPrice;

  // ROAS
  const roas = budget > 0 ? revenue / budget : 0;

  // Budget percentage
  const budgetPct = totalBudget > 0 ? (budget / totalBudget) * 100 : 0;

  return {
    channelType: 'crm_email',
    budget,
    budgetPct,
    impressions: Math.round(impressions),
    clicks: Math.round(clicks),
    conversions: Math.round(conversions),
    attributedTickets,
    incrementalTickets,
    costPerTicket,
    revenue,
    roas,
  };
}

/**
 * Get default channel metrics for initialization
 */
export function getDefaultChannelMetrics(channelType: string): Partial<MediaChannelInput> {
  const defaults: Record<string, Partial<MediaChannelInput>> = {
    tv_ctv: { cpm: 30, ctr: 0.05, conversionRate: 2.5, incrementalityFactor: 1.0 },
    radio_audio: { cpm: 20, ctr: 0.08, conversionRate: 3.0, incrementalityFactor: 1.0 },
    ooh: { cpm: 12, ctr: 0.02, conversionRate: 1.5, incrementalityFactor: 0.8 },
    paid_social: { cpm: 15, ctr: 1.2, conversionRate: 4.0, incrementalityFactor: 1.0 },
    paid_search: { cpc: 3.5, ctr: 5.0, conversionRate: 8.0, incrementalityFactor: 1.0 },
    display_programmatic: { cpm: 8, ctr: 0.3, conversionRate: 2.0, incrementalityFactor: 0.9 },
    youtube_video: { cpm: 18, ctr: 0.6, conversionRate: 3.5, incrementalityFactor: 1.0 },
    retargeting: { cpm: 12, ctr: 2.0, conversionRate: 12.0, incrementalityFactor: 1.0 },
    crm_email: { audienceSize: 50000, openRate: 25, clickRate: 5, conversionRate: 10.0 },
  };

  return defaults[channelType] || {};
}