import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { EventDetailsForm } from "@/components/EventEconomics/EventDetailsForm";
import { TicketEconomicsForm } from "@/components/EventEconomics/TicketEconomicsForm";
import { EconomicsKPICards } from "@/components/EventEconomics/EconomicsKPICards";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus } from "lucide-react";

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
};

export default function Calculator() {
  const [eventData, setEventData] = useState<EventData>(SAMPLE_EVENT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = useCallback((field: string, value: string | number) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

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

          <div className="border-t border-slate-200 pt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Coming Next:</strong> Sales Pacing, Media Plan, and Results & Recommendations sections will be built in the following phases.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}