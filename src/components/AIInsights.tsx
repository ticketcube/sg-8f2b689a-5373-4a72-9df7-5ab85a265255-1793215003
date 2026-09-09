import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import type { MediaMixSummary } from "@/types/calculator";

interface AIInsightsProps {
  eventName: string;
  marketCity: string;
  daysToEvent: number;
  currentTicketsSold: number;
  targetTickets: number;
  mediaMixSummary: MediaMixSummary;
  avgTicketPrice: number;
}

interface Insight {
  category: string;
  observation: string;
  recommendation: string;
}

export function AIInsights({
  eventName,
  marketCity,
  daysToEvent,
  currentTicketsSold,
  targetTickets,
  mediaMixSummary,
  avgTicketPrice,
}: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const context = {
        eventName,
        marketCity,
        daysToEvent,
        currentTicketsSold,
        targetTickets,
        percentToTarget: (currentTicketsSold / targetTickets) * 100,
        ticketsRemaining: targetTickets - currentTicketsSold,
        totalBudget: mediaMixSummary.totalBudget,
        ticketsFromMedia: mediaMixSummary.totalIncrementalTickets,
        blendedCpt: mediaMixSummary.blendedCostPerTicket,
        blendedRoas: mediaMixSummary.blendedRoas,
        channels: mediaMixSummary.channels.map(ch => ({
          name: ch.channelType,
          budget: ch.budget,
          tickets: ch.incrementalTickets,
          cpt: ch.costPerTicket,
          roas: ch.roas,
        })),
      };

      const response = await fetch('/api/media-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Analyze this event marketing campaign and provide 4-5 strategic insights. Each insight should have:
1. A category (Campaign Health, Budget Efficiency, Channel Performance, Risk, or Opportunity)
2. A specific observation based on the data
3. A concrete recommendation

Event: ${eventName} in ${marketCity}
Days to Event: ${daysToEvent}
Current Sales: ${currentTicketsSold} / ${targetTickets} (${context.percentToTarget.toFixed(1)}%)
Marketing Budget: $${context.totalBudget.toLocaleString()}
Expected Media Tickets: ${context.ticketsFromMedia}
Blended CPT: $${context.blendedCpt.toFixed(2)}
Blended ROAS: ${context.blendedRoas.toFixed(2)}:1

Top Channels by ROAS:
${context.channels.slice(0, 3).map(ch => `- ${ch.name}: ${ch.tickets} tickets, $${ch.cpt.toFixed(2)} CPT, ${ch.roas.toFixed(2)}:1 ROAS`).join('\n')}

Format as JSON array with structure: [{"category": "...", "observation": "...", "recommendation": "..."}]`,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      
      // Parse insights from AI response
      const parsed = parseInsightsFromResponse(data.answer);
      setInsights(parsed);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to rule-based insights
      setInsights(generateFallbackInsights());
    } finally {
      setLoading(false);
    }
  };

  const parseInsightsFromResponse = (response: string): Insight[] => {
    try {
      // Try to extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return generateFallbackInsights();
    } catch {
      return generateFallbackInsights();
    }
  };

  const generateFallbackInsights = (): Insight[] => {
    const percentToTarget = (currentTicketsSold / targetTickets) * 100;
    const projectedFinal = currentTicketsSold + mediaMixSummary.totalIncrementalTickets;
    const willHitTarget = projectedFinal >= targetTickets;

    const insights: Insight[] = [];

    // Campaign Health
    if (percentToTarget >= 80) {
      insights.push({
        category: "Campaign Health",
        observation: `Strong position with ${percentToTarget.toFixed(1)}% of target achieved and ${daysToEvent} days remaining.`,
        recommendation: "Maintain current velocity. Consider holding back 15-20% of remaining budget for final push in last 7-10 days.",
      });
    } else if (percentToTarget >= 60) {
      insights.push({
        category: "Campaign Health",
        observation: `Moderate position at ${percentToTarget.toFixed(1)}% of target with ${daysToEvent} days remaining.`,
        recommendation: "Increase daily media spend by 25-30% and activate retargeting audiences to accelerate conversions.",
      });
    } else {
      insights.push({
        category: "Campaign Health",
        observation: `Behind pace at ${percentToTarget.toFixed(1)}% of target with only ${daysToEvent} days remaining.`,
        recommendation: "Execute surge strategy: double down on highest-ROAS channels and activate all available CRM segments.",
      });
    }

    // Budget Efficiency
    if (mediaMixSummary.blendedRoas >= 5) {
      insights.push({
        category: "Budget Efficiency",
        observation: `Excellent blended ROAS of ${mediaMixSummary.blendedRoas.toFixed(2)}:1 indicates highly efficient media spend.`,
        recommendation: "Reallocate budget from underperforming channels to scale top performers while maintaining efficiency.",
      });
    } else if (mediaMixSummary.blendedRoas >= 3) {
      insights.push({
        category: "Budget Efficiency",
        observation: `Solid blended ROAS of ${mediaMixSummary.blendedRoas.toFixed(2)}:1 with room for optimization.`,
        recommendation: "Audit creative performance and landing page conversion rates to improve efficiency by 15-20%.",
      });
    } else {
      insights.push({
        category: "Budget Efficiency",
        observation: `Below-target ROAS of ${mediaMixSummary.blendedRoas.toFixed(2)}:1 indicates inefficient media mix.`,
        recommendation: "Pause lowest-performing channels and reallocate to proven performers. Review targeting and creative immediately.",
      });
    }

    // Channel Performance
    const topChannel = mediaMixSummary.channels.sort((a, b) => b.roas - a.roas)[0];
    insights.push({
      category: "Channel Performance",
      observation: `${topChannel.channelType} is top performer with ${topChannel.roas.toFixed(2)}:1 ROAS and $${topChannel.costPerTicket.toFixed(2)} CPT.`,
      recommendation: `Increase ${topChannel.channelType} budget by 40-50% and use these tactics/audiences as template for other channels.`,
    });

    // Risk or Opportunity
    if (!willHitTarget) {
      const gap = targetTickets - projectedFinal;
      insights.push({
        category: "Risk",
        observation: `Current projection falls ${gap} tickets short of target, creating revenue risk.`,
        recommendation: `Secure additional ${(gap * avgTicketPrice * 0.3).toLocaleString()} in media budget or implement dynamic pricing strategy.`,
      });
    } else {
      insights.push({
        category: "Opportunity",
        observation: "Campaign projected to hit target with current trajectory and media spend.",
        recommendation: "Consider upselling premium packages or opening additional low-inventory sections to capture excess demand.",
      });
    }

    return insights.slice(0, 5);
  };

  useEffect(() => {
    generateInsights();
  }, []); // Generate on mount

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "campaign health": return "bg-blue-100 text-blue-800";
      case "budget efficiency": return "bg-green-100 text-green-800";
      case "channel performance": return "bg-purple-100 text-purple-800";
      case "risk": return "bg-red-100 text-red-800";
      case "opportunity": return "bg-amber-100 text-amber-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Strategic Insights
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">
              Unable to connect to AI service. Showing rule-based insights.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {loading && insights.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Analyzing campaign data...</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-2">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(insight.category)}`}>
                    {insight.category}
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium">
                  {insight.observation}
                </p>
                <p className="text-sm text-slate-600">
                  <strong className="text-blue-600">→</strong> {insight.recommendation}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}