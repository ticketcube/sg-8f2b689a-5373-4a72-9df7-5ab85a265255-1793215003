import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, TrendingUp } from "lucide-react";
import { calculateSalesVelocity, calculateRequiredDailySales, calculateProjectedFinalSales } from "@/lib/calculations";

interface VelocityMetricsCardProps {
  currentTicketsSold: number;
  daysElapsed: number;
  ticketsRemaining: number;
  daysToEvent: number;
  expectedOrganicSalesPerDay: number;
  targetTickets: number;
}

export function VelocityMetricsCard({
  currentTicketsSold,
  daysElapsed,
  ticketsRemaining,
  daysToEvent,
  expectedOrganicSalesPerDay,
  targetTickets,
}: VelocityMetricsCardProps) {
  const currentVelocity = calculateSalesVelocity(currentTicketsSold, daysElapsed);
  const requiredVelocity = calculateRequiredDailySales(ticketsRemaining, daysToEvent);
  const projectedFinal = calculateProjectedFinalSales(
    currentTicketsSold,
    currentVelocity,
    expectedOrganicSalesPerDay,
    daysToEvent
  );

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  const velocityGap = requiredVelocity - currentVelocity;
  const isOnPace = Math.abs(velocityGap) < currentVelocity * 0.1; // within 10%

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Sales Velocity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">Current Velocity</div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(currentVelocity)}
              <span className="text-sm text-slate-500 font-normal">/day</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">Required Velocity</div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(requiredVelocity)}
              <span className="text-sm text-slate-500 font-normal">/day</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">Projected Final</div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(projectedFinal)}
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${isOnPace ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {isOnPace ? (
              <Target className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-orange-600" />
            )}
            <span className={`text-sm font-semibold ${isOnPace ? 'text-green-900' : 'text-orange-900'}`}>
              {isOnPace ? 'On Track' : 'Acceleration Needed'}
            </span>
          </div>
          <p className={`text-xs ${isOnPace ? 'text-green-700' : 'text-orange-700'}`}>
            {isOnPace 
              ? `Maintaining current pace will reach ${formatNumber(projectedFinal)} tickets`
              : `Need ${formatNumber(Math.abs(velocityGap))} more tickets/day to hit target of ${formatNumber(targetTickets)}`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}