import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventDetailsForm } from "@/components/EventEconomics/EventDetailsForm";
import { TicketEconomicsForm } from "@/components/EventEconomics/TicketEconomicsForm";
import { EconomicsKPICards } from "@/components/EventEconomics/EconomicsKPICards";
import { SalesPacingForm } from "@/components/EventEconomics/SalesPacingForm";
import { PacingStatusCard } from "@/components/EventEconomics/PacingStatusCard";
import { VelocityMetricsCard } from "@/components/EventEconomics/VelocityMetricsCard";
import { SalesPacingChart } from "@/components/EventEconomics/SalesPacingChart";
import { MediaChannelForm } from "@/components/MediaChannelForm";
import { MediaMixSummary } from "@/components/MediaMixSummary";
import { ResultsSummary } from "@/components/ResultsSummary";
import { AIInsights } from "@/components/AIInsights";
import { AIAssistantModal } from "@/components/AIAssistantModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Tv, Radio, Eye, Share2, Search, Monitor, Video, Target, Mail, Sparkles } from "lucide-react";
import { calculateTicketEconomics, calculateSalesVelocity, calculateChannelMetrics, calculateMediaMixSummary } from "@/lib/calculations";
import type { MediaChannelType, MediaChannelInput } from "@/types/calculator";

interface EventData {
  id?: string;
  eventName: string;
  artistProduction: string;
  marketCity: string;
  venue: string;
  eventDate: string;
  venueCapacity: number;
  targetSellThroughPct: number;
  currentTicketsSold: number;
  avgTicketPrice: number;
  premiumTicketPct: number;
  premiumTicketPrice: number;
  standardTicketPrice: number;
  currentGrossRevenue: number;
  targetGrossRevenue: number;
  daysToEvent: number;
  expectedOrganicSalesPerDay: number;
  historicalSellThroughPct: number;
}

interface MediaChannelData {
  channelType: MediaChannelType;
  budget: number;
  cpm?: number;
  cpc?: number;
  ctr: number;
  conversionRate: number;
}

interface CRMData {
  budget: number;
  audienceSize: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

const SAMPLE_EVENT: EventData = {
  eventName: "DroneArt: Four Seasons",
  artistProduction: "DroneArt Collective",
  marketCity: "Los Angeles",
  venue: "The Forum",
  eventDate: "2026-11-15",
  venueCapacity: 5000,
  targetSellThroughPct: 90,
  currentTicketsSold: 2750,
  avgTicketPrice: 100,
  premiumTicketPct: 20,
  premiumTicketPrice: 150,
  standardTicketPrice: 90,
  currentGrossRevenue: 275000,
  targetGrossRevenue: 450000,
  daysToEvent: 35,
  expectedOrganicSalesPerDay: 50,
  historicalSellThroughPct: 85,
};

const SAMPLE_MEDIA_CHANNELS: MediaChannelData[] = [
  { channelType: 'tv_ctv', budget: 25000, cpm: 30, ctr: 0.05, conversionRate: 2.5 },
  { channelType: 'radio_audio', budget: 15000, cpm: 20, ctr: 0.08, conversionRate: 3.0 },
  { channelType: 'ooh', budget: 10000, cpm: 12, ctr: 0.02, conversionRate: 1.5 },
  { channelType: 'paid_social', budget: 20000, cpm: 15, ctr: 1.2, conversionRate: 4.0 },
  { channelType: 'paid_search', budget: 18000, cpc: 3.5, ctr: 5.0, conversionRate: 8.0 },
  { channelType: 'display_programmatic', budget: 12000, cpm: 8, ctr: 0.3, conversionRate: 2.0 },
  { channelType: 'youtube_video', budget: 15000, cpm: 18, ctr: 0.6, conversionRate: 3.5 },
  { channelType: 'retargeting', budget: 10000, cpm: 12, ctr: 2.0, conversionRate: 12.0 },
];

const SAMPLE_CRM: CRMData = {
  budget: 5000,
  audienceSize: 50000,
  openRate: 25,
  clickRate: 5,
  conversionRate: 10,
};

const CHANNEL_CONFIGS = {
  tv_ctv: { name: 'TV/CTV', icon: <Tv className="h-4 w-4" />, hasCpm: true },
  radio_audio: { name: 'Radio/Audio', icon: <Radio className="h-4 w-4" />, hasCpm: true },
  ooh: { name: 'Out of Home', icon: <Eye className="h-4 w-4" />, hasCpm: true },
  paid_social: { name: 'Paid Social', icon: <Share2 className="h-4 w-4" />, hasCpm: true },
  paid_search: { name: 'Paid Search', icon: <Search className="h-4 w-4" />, hasCpc: true },
  display_programmatic: { name: 'Display/Programmatic', icon: <Monitor className="h-4 w-4" />, hasCpm: true },
  youtube_video: { name: 'YouTube/Video', icon: <Video className="h-4 w-4" />, hasCpm: true },
  retargeting: { name: 'Retargeting', icon: <Target className="h-4 w-4" />, hasCpm: true },
};

export default function Calculator() {
  const [eventData, setEventData] = useState<EventData>(SAMPLE_EVENT);
  const [mediaChannels, setMediaChannels] = useState<MediaChannelData[]>(SAMPLE_MEDIA_CHANNELS);
  const [crmData, setCrmData] = useState<CRMData>(SAMPLE_CRM);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContext, setAiContext] = useState<{ channel?: string; metric?: string; eventData?: any }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Calculate derived values
  const ticketEconomics = calculateTicketEconomics({
    venueCapacity: eventData.venueCapacity,
    targetSellThroughPct: eventData.targetSellThroughPct,
    currentTicketsSold: eventData.currentTicketsSold,
    avgTicketPrice: eventData.avgTicketPrice,
    premiumTicketPct: eventData.premiumTicketPct,
    premiumTicketPrice: eventData.premiumTicketPrice,
    standardTicketPrice: eventData.standardTicketPrice,
    currentGrossRevenue: eventData.currentGrossRevenue,
    targetGrossRevenue: eventData.targetGrossRevenue,
  });

  const daysElapsed = 90 - eventData.daysToEvent;
  const currentVelocity = calculateSalesVelocity(eventData.currentTicketsSold, daysElapsed);

  // Calculate media mix with all channels
  const mediaMixSummary = useMemo(() => {
    const totalBudget = mediaChannels.reduce((sum, ch) => sum + ch.budget, 0) + crmData.budget;

    // Calculate paid channel metrics
    const paidChannelMetrics = mediaChannels.map(channel => {
      const input: MediaChannelInput = {
        channelType: channel.channelType,
        budget: channel.budget,
        cpm: channel.cpm,
        cpc: channel.cpc,
        ctr: channel.ctr,
        conversionRate: channel.conversionRate,
        incrementalityFactor: 1.0,
      };
      return calculateChannelMetrics(input, eventData.avgTicketPrice, totalBudget);
    });

    // Calculate CRM metrics
    const impressions = crmData.audienceSize;
    const opens = impressions * (crmData.openRate / 100);
    const clicks = opens * (crmData.clickRate / 100);
    const conversions = clicks * (crmData.conversionRate / 100);
    const incrementalTickets = Math.round(conversions);
    const costPerTicket = incrementalTickets > 0 ? crmData.budget / incrementalTickets : 0;
    const revenue = incrementalTickets * eventData.avgTicketPrice;
    const roas = crmData.budget > 0 ? revenue / crmData.budget : 0;

    const crmMetrics = {
      channelType: 'crm_email' as MediaChannelType,
      budget: crmData.budget,
      budgetPct: totalBudget > 0 ? (crmData.budget / totalBudget) * 100 : 0,
      impressions: Math.round(impressions),
      clicks: Math.round(clicks),
      conversions: Math.round(conversions),
      attributedTickets: incrementalTickets,
      incrementalTickets,
      costPerTicket,
      revenue,
      roas,
    };

    // Combine all channels
    const allChannels = [...paidChannelMetrics, crmMetrics];

    return calculateMediaMixSummary(allChannels);
  }, [mediaChannels, crmData, eventData.avgTicketPrice]);

  const handleFieldChange = useCallback((field: string, value: string | number) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleMediaChannelChange = useCallback(
    (channelType: MediaChannelType, field: string, value: number) => {
      setMediaChannels((prev) =>
        prev.map((channel) =>
          channel.channelType === channelType
            ? { ...channel, [field]: value }
            : channel
        )
      );
    },
    []
  );

  const handleCRMChange = useCallback((field: keyof CRMData, value: number) => {
    setCrmData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleOpenAI = useCallback((channelType: MediaChannelType | 'crm') => {
    const config = channelType === 'crm' 
      ? { name: 'CRM/Email Marketing' } 
      : CHANNEL_CONFIGS[channelType];
    setAiContext({
      channel: config.name,
      eventData: eventData,
    });
    setAiModalOpen(true);
  }, [eventData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your event.",
          variant: "destructive",
        });
        return;
      }

      const eventPayload = {
        user_id: user.id,
        event_name: eventData.eventName,
        artist_production: eventData.artistProduction,
        market_city: eventData.marketCity,
        venue: eventData.venue,
        event_date: eventData.eventDate,
        venue_capacity: eventData.venueCapacity,
        target_sellthrough_pct: eventData.targetSellThroughPct,
        current_tickets_sold: eventData.currentTicketsSold,
        avg_ticket_price: eventData.avgTicketPrice,
        premium_ticket_pct: eventData.premiumTicketPct,
        premium_ticket_price: eventData.premiumTicketPrice,
        standard_ticket_price: eventData.standardTicketPrice,
        current_gross_revenue: eventData.currentGrossRevenue,
        target_gross_revenue: eventData.targetGrossRevenue,
        days_to_event: eventData.daysToEvent,
        expected_organic_sales_per_day: eventData.expectedOrganicSalesPerDay,
        historical_sellthrough_pct: eventData.historicalSellThroughPct,
      };

      if (eventData.id) {
        const { error } = await supabase
          .from("events")
          .update(eventPayload)
          .eq("id", eventData.id);

        if (error) throw error;

        toast({
          title: "Event updated",
          description: "Your changes have been saved.",
        });
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert(eventPayload)
          .select()
          .single();

        if (error) throw error;

        setEventData((prev) => ({ ...prev, id: data.id }));

        toast({
          title: "Event saved",
          description: "Your event has been created.",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error saving event",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Live Event Market Calculator</h1>
              <p className="text-sm text-slate-500">Marketing Decision Engine</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Event
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Event Economics Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Event Economics</h2>
            <div className="space-y-6">
              <EventDetailsForm
                eventName={eventData.eventName}
                artistProduction={eventData.artistProduction}
                marketCity={eventData.marketCity}
                venue={eventData.venue}
                eventDate={eventData.eventDate}
                onChange={handleFieldChange}
              />
              
              <TicketEconomicsForm
                venueCapacity={eventData.venueCapacity}
                targetSellThroughPct={eventData.targetSellThroughPct}
                currentTicketsSold={eventData.currentTicketsSold}
                avgTicketPrice={eventData.avgTicketPrice}
                premiumTicketPct={eventData.premiumTicketPct}
                premiumTicketPrice={eventData.premiumTicketPrice}
                standardTicketPrice={eventData.standardTicketPrice}
                currentGrossRevenue={eventData.currentGrossRevenue}
                targetGrossRevenue={eventData.targetGrossRevenue}
                onChange={handleFieldChange}
              />

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                  Calculated Metrics
                </h3>
                <EconomicsKPICards
                  venueCapacity={eventData.venueCapacity}
                  targetSellThroughPct={eventData.targetSellThroughPct}
                  currentTicketsSold={eventData.currentTicketsSold}
                  avgTicketPrice={eventData.avgTicketPrice}
                  currentGrossRevenue={eventData.currentGrossRevenue}
                  targetGrossRevenue={eventData.targetGrossRevenue}
                />
              </div>
            </div>
          </div>

          {/* Sales Pacing Section */}
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sales Pacing</h2>
            <div className="space-y-6">
              <SalesPacingForm
                daysToEvent={eventData.daysToEvent}
                expectedOrganicSalesPerDay={eventData.expectedOrganicSalesPerDay}
                historicalSellThroughPct={eventData.historicalSellThroughPct}
                onDaysToEventChange={(value) => handleFieldChange('daysToEvent', value)}
                onOrganicSalesChange={(value) => handleFieldChange('expectedOrganicSalesPerDay', value)}
                onHistoricalSellThroughChange={(value) => handleFieldChange('historicalSellThroughPct', value)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PacingStatusCard
                  currentTicketsSold={eventData.currentTicketsSold}
                  targetTickets={ticketEconomics.targetTickets}
                  daysToEvent={eventData.daysToEvent}
                  ticketsRemaining={ticketEconomics.ticketsRemaining}
                />

                <VelocityMetricsCard
                  currentTicketsSold={eventData.currentTicketsSold}
                  daysElapsed={daysElapsed}
                  ticketsRemaining={ticketEconomics.ticketsRemaining}
                  daysToEvent={eventData.daysToEvent}
                  expectedOrganicSalesPerDay={eventData.expectedOrganicSalesPerDay}
                  targetTickets={ticketEconomics.targetTickets}
                />
              </div>

              <SalesPacingChart
                currentTicketsSold={eventData.currentTicketsSold}
                targetTickets={ticketEconomics.targetTickets}
                daysToEvent={eventData.daysToEvent}
                currentVelocity={currentVelocity}
              />
            </div>
          </div>

          {/* Media Planning Section */}
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Media Planning</h2>
            <p className="text-slate-600 mb-6">
              Configure your media mix across paid channels. Click "Ask AI" on any channel to learn best practices, benchmarks, and optimization strategies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {mediaChannels.map((channel) => {
                const config = CHANNEL_CONFIGS[channel.channelType];
                return (
                  <MediaChannelForm
                    key={channel.channelType}
                    channelName={config.name}
                    channelIcon={config.icon}
                    budget={channel.budget}
                    cpm={config.hasCpm ? channel.cpm : undefined}
                    cpc={config.hasCpc ? channel.cpc : undefined}
                    ctr={channel.ctr}
                    conversionRate={channel.conversionRate}
                    onBudgetChange={(value) =>
                      handleMediaChannelChange(channel.channelType, 'budget', value)
                    }
                    onCpmChange={
                      config.hasCpm
                        ? (value) => handleMediaChannelChange(channel.channelType, 'cpm', value)
                        : undefined
                    }
                    onCpcChange={
                      config.hasCpc
                        ? (value) => handleMediaChannelChange(channel.channelType, 'cpc', value)
                        : undefined
                    }
                    onCtrChange={(value) =>
                      handleMediaChannelChange(channel.channelType, 'ctr', value)
                    }
                    onConversionRateChange={(value) =>
                      handleMediaChannelChange(channel.channelType, 'conversionRate', value)
                    }
                    onAskAI={() => handleOpenAI(channel.channelType)}
                  />
                );
              })}
            </div>

            {/* CRM/Email Marketing */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    CRM / Email Marketing
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenAI('crm')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Ask AI
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="crm-budget" className="text-xs">Budget</Label>
                    <Input
                      id="crm-budget"
                      type="number"
                      value={crmData.budget}
                      onChange={(e) => handleCRMChange('budget', Number(e.target.value))}
                      className="mt-1"
                      min="0"
                      step="500"
                    />
                    <p className="text-xs text-slate-500 mt-1">{formatCurrency(crmData.budget)}</p>
                  </div>

                  <div>
                    <Label htmlFor="crm-audience" className="text-xs">Audience Size</Label>
                    <Input
                      id="crm-audience"
                      type="number"
                      value={crmData.audienceSize}
                      onChange={(e) => handleCRMChange('audienceSize', Number(e.target.value))}
                      className="mt-1"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="crm-open" className="text-xs">Open Rate (%)</Label>
                    <Input
                      id="crm-open"
                      type="number"
                      value={crmData.openRate}
                      onChange={(e) => handleCRMChange('openRate', Number(e.target.value))}
                      className="mt-1"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="crm-click" className="text-xs">Click Rate (%)</Label>
                    <Input
                      id="crm-click"
                      type="number"
                      value={crmData.clickRate}
                      onChange={(e) => handleCRMChange('clickRate', Number(e.target.value))}
                      className="mt-1"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="crm-conversion" className="text-xs">Conversion (%)</Label>
                    <Input
                      id="crm-conversion"
                      type="number"
                      value={crmData.conversionRate}
                      onChange={(e) => handleCRMChange('conversionRate', Number(e.target.value))}
                      className="mt-1"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media Mix Summary */}
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Media Mix Summary</h2>
            <MediaMixSummary summary={mediaMixSummary} />
          </div>

          {/* Results & Recommendations Section */}
          <div className="border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Results & Recommendations</h2>
            <p className="text-slate-600 mb-6">
              Executive summary of campaign performance with AI-powered strategic insights and optimization recommendations.
            </p>

            <div className="space-y-6">
              <ResultsSummary
                currentTicketsSold={eventData.currentTicketsSold}
                targetTickets={ticketEconomics.targetTickets}
                ticketsRemaining={ticketEconomics.ticketsRemaining}
                daysToEvent={eventData.daysToEvent}
                mediaMixSummary={mediaMixSummary}
                avgTicketPrice={eventData.avgTicketPrice}
              />

              <AIInsights
                eventName={eventData.eventName}
                marketCity={eventData.marketCity}
                daysToEvent={eventData.daysToEvent}
                currentTicketsSold={eventData.currentTicketsSold}
                targetTickets={ticketEconomics.targetTickets}
                mediaMixSummary={mediaMixSummary}
                avgTicketPrice={eventData.avgTicketPrice}
              />
            </div>
          </div>
        </div>
      </main>

      <AIAssistantModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        context={aiContext}
      />
    </div>
  );
}