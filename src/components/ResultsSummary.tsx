import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, DollarSign, Users, AlertCircle } from "lucide-react";
import type { MediaMixSummary } from "@/types/calculator";

interface ResultsSummaryProps {
  currentTicketsSold: number;
  targetTickets: number;
  ticketsRemaining: number;
  daysToEvent: number;
  mediaMixSummary: MediaMixSummary;
  avgTicketPrice: number;
}

export function ResultsSummary({
  currentTicketsSold,
  targetTickets,
  ticketsRemaining,
  daysToEvent,
  mediaMixSummary,
  avgTicketPrice,
}: ResultsSummaryProps) {
  const percentToTarget = (currentTicketsSold / targetTickets) * 100;
  const ticketsFromMedia = mediaMixSummary.totalIncrementalTickets;
  const projectedFinalTickets = currentTicketsSold + ticketsFromMedia;
  const projectedPercentToTarget = (projectedFinalTickets / targetTickets) * 100;
  
  const ticketGap = Math.max(0, targetTickets - projectedFinalTickets);
  const requiredDailyVelocity = daysToEvent > 0 ? ticketGap / daysToEvent : 0;
  
  const projectedRevenue = projectedFinalTickets * avgTicketPrice;
  const targetRevenue = targetTickets * avgTicketPrice;
  const revenueGap = Math.max(0, targetRevenue - projectedRevenue);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 95) return "text-green-600";
    if (percent >= 85) return "text-blue-600";
    if (percent >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusBadge = (percent: number) => {
    if (percent >= 95) return "bg-green-100 text-green-800";
    if (percent >= 85) return "bg-blue-100 text-blue-800";
    if (percent >= 70) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Executive Status */}
      <Card className="border-2 border-slate-300 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Campaign Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Projected Performance</span>
                <span className={`text-2xl font-bold ${getStatusColor(projectedPercentToTarget)}`}>
                  {projectedPercentToTarget.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    projectedPercentToTarget >= 95 ? "bg-green-500" :
                    projectedPercentToTarget >= 85 ? "bg-blue-500" :
                    projectedPercentToTarget >= 70 ? "bg-orange-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(100, projectedPercentToTarget)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatNumber(projectedFinalTickets)} of {formatNumber(targetTickets)} target tickets
              </p>
            </div>

            {ticketGap > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Projected Shortfall: {formatNumber(ticketGap)} tickets
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Need {formatNumber(requiredDailyVelocity)} additional tickets/day to hit target
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Current Sales
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(currentTicketsSold)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {percentToTarget.toFixed(1)}% of target
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Expected from Media
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(ticketsFromMedia)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              From {formatCurrency(mediaMixSummary.totalBudget)} spend
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Projected Final
            </CardTitle>
            <Target className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(projectedFinalTickets)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {projectedPercentToTarget.toFixed(1)}% of target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Marketing Spend
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(mediaMixSummary.totalBudget)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Blended CPT: {formatCurrency(mediaMixSummary.blendedCostPerTicket)} | 
              ROAS: {mediaMixSummary.blendedRoas.toFixed(2)}:1
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Projected Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(projectedRevenue)}
            </div>
            {revenueGap > 0 ? (
              <p className="text-xs text-orange-600 mt-1">
                {formatCurrency(revenueGap)} short of target
              </p>
            ) : (
              <p className="text-xs text-green-600 mt-1">
                Target revenue achieved
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}