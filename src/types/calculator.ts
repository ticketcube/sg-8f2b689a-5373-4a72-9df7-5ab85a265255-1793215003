/**
 * Live Event Market Calculator
 * Core TypeScript interfaces for business logic
 * 
 * These types represent the application's business domain,
 * separate from the auto-generated Supabase database types.
 */

// ============================================
// EVENT & TICKET ECONOMICS
// ============================================

export interface EventDetails {
  eventName: string;
  artistProduction: string;
  marketCity: string;
  venue: string;
  eventDate: Date;
}

export interface TicketEconomics {
  venueCapacity: number;
  targetSellThroughPct: number;
  currentTicketsSold: number;
  avgTicketPrice: number;
  premiumTicketPct: number;
  premiumTicketPrice: number;
  standardTicketPrice: number;
  currentGrossRevenue: number;
  targetGrossRevenue: number;
}

export interface CalculatedEconomics {
  totalRevenuePotential: number;
  targetTickets: number;
  ticketsRemaining: number;
  currentSellThroughPct: number;
  revenueRemaining: number;
}

// ============================================
// SALES PACING
// ============================================

export interface SalesPacing {
  daysToEvent: number;
  expectedOrganicSalesPerDay: number;
  historicalSellThroughPct?: number;
  pacingStatus: PacingStatus;
}

export type PacingStatus = 'ahead' | 'on_pace' | 'slightly_behind' | 'significantly_behind';

export interface CalculatedPacing {
  currentVelocity: number;
  requiredDailySales: number;
  requiredWeeklySales: number;
  percentOfTargetSold: number;
  percentOfTargetRemaining: number;
  projectedFinalTickets: number;
  projectedSellThroughPct: number;
  ticketGap: number;
}

// ============================================
// MEDIA CHANNELS
// ============================================

export type MediaChannelType =
  | 'tv_ctv'
  | 'radio_audio'
  | 'ooh'
  | 'paid_social'
  | 'paid_search'
  | 'display_programmatic'
  | 'youtube_video'
  | 'retargeting'
  | 'crm_email';

export interface MediaChannelInput {
  channelType: MediaChannelType;
  budget: number;
  cpm?: number;
  cpc?: number;
  ctr?: number;
  conversionRate: number;
  incrementalityFactor?: number;
  // CRM specific
  audienceSize?: number;
  openRate?: number;
  clickRate?: number;
}

export interface MediaChannelCalculated {
  channelType: MediaChannelType;
  budget: number;
  budgetPct: number;
  impressions: number;
  clicks: number;
  conversions: number;
  attributedTickets: number;
  incrementalTickets: number;
  costPerTicket: number;
  revenue: number;
  roas: number;
}

// ============================================
// MEDIA MIX & BLENDED METRICS
// ============================================

export interface MediaMixSummary {
  totalBudget: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalAttributedTickets: number;
  totalIncrementalTickets: number;
  blendedCostPerTicket: number;
  blendedRoas: number;
  channels: MediaChannelCalculated[];
}

// ============================================
// SCENARIOS
// ============================================

export type ScenarioName = 'base' | 'upside' | 'downside' | 'aggressive_marketing' | 'low_media';

export interface Scenario {
  scenarioName: ScenarioName;
  conversionMultiplier: number;
  demandMultiplier: number;
  budgetMultiplier: number;
  notes?: string;
}

export interface ScenarioComparison {
  scenarioName: ScenarioName;
  projectedTickets: number;
  projectedRevenue: number;
  marketingSpend: number;
  costPerTicket: number;
  roas: number;
  sellThroughPct: number;
}

// ============================================
// DIAGNOSTICS
// ============================================

export type DiagnosticType =
  | 'low_awareness'
  | 'low_traffic'
  | 'low_conversion'
  | 'wrong_audience'
  | 'pricing'
  | 'inventory'
  | 'competitive'
  | 'weak_creative'
  | 'insufficient_media'
  | 'unknown';

export interface MarketDiagnostic {
  diagnosticType: DiagnosticType;
  notes?: string;
  recommendedAction: string;
}

// ============================================
// RECOMMENDATIONS
// ============================================

export interface MarketingRecommendation {
  status: 'green' | 'yellow' | 'orange' | 'red';
  statusLabel: string;
  recommendation: string;
  insights: string[];
  suggestedActions: string[];
}

export interface ChannelOptimization {
  channelType: MediaChannelType;
  currentBudget: number;
  suggestedBudget: number;
  budgetChange: number;
  reasoning: string;
}

// ============================================
// COMPLETE EVENT STATE
// ============================================

export interface EventCalculatorState {
  eventDetails: EventDetails;
  ticketEconomics: TicketEconomics;
  calculatedEconomics: CalculatedEconomics;
  salesPacing: SalesPacing;
  calculatedPacing: CalculatedPacing;
  mediaChannels: MediaChannelInput[];
  mediaMixSummary: MediaMixSummary;
  scenarios?: Scenario[];
  diagnostics?: MarketDiagnostic[];
  recommendations?: MarketingRecommendation;
  learningMode: boolean;
}

// ============================================
// BENCHMARKS
// ============================================

export interface Benchmark {
  eventType: string;
  market: string;
  avgCostPerTicket: number;
  avgRoas: number;
  avgSellThroughPct: number;
  sampleSize: number;
}

// ============================================
// MARKET COMPARISON
// ============================================

export interface MarketSummary {
  eventId: string;
  marketCity: string;
  eventName: string;
  capacity: number;
  ticketsSold: number;
  targetTickets: number;
  pacingStatus: PacingStatus;
  marketingSpend: number;
  costPerTicket: number;
  roas: number;
  projectedSellThroughPct: number;
}