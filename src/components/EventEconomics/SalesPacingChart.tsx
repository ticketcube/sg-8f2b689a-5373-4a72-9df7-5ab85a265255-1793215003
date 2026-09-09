import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface SalesPacingChartProps {
  currentTicketsSold: number;
  targetTickets: number;
  daysToEvent: number;
  currentVelocity: number;
}

export function SalesPacingChart({
  currentTicketsSold,
  targetTickets,
  daysToEvent,
  currentVelocity,
}: SalesPacingChartProps) {
  // Generate pacing data - past and future projections
  const totalDays = 90; // Typical on-sale period
  const daysElapsed = totalDays - daysToEvent;
  
  const data = [];
  
  // Past actual sales (linear for demo - would use real data in production)
  for (let day = 0; day <= daysElapsed; day++) {
    const actualSales = (currentTicketsSold / daysElapsed) * day;
    const targetSales = (targetTickets / totalDays) * day;
    data.push({
      day,
      actual: Math.round(actualSales),
      target: Math.round(targetSales),
      projected: null,
    });
  }
  
  // Future projected sales
  for (let day = daysElapsed + 1; day <= totalDays; day++) {
    const daysFromNow = day - daysElapsed;
    const projectedSales = currentTicketsSold + (currentVelocity * daysFromNow);
    const targetSales = (targetTickets / totalDays) * day;
    data.push({
      day,
      actual: null,
      target: Math.round(targetSales),
      projected: Math.round(projectedSales),
    });
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Sales Pacing Trajectory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              label={{ value: "Days from On-Sale", position: "insideBottom", offset: -5 }}
              stroke="#64748b"
            />
            <YAxis
              label={{ value: "Tickets Sold", angle: -90, position: "insideLeft" }}
              stroke="#64748b"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Actual Sales"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target Pace"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              name="Projected"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="h-1 w-12 bg-green-500 mx-auto mb-1 rounded"></div>
            <span className="text-xs text-slate-600">Actual Sales</span>
          </div>
          <div>
            <div className="h-1 w-12 border-t-2 border-dashed border-blue-500 mx-auto mb-1"></div>
            <span className="text-xs text-slate-600">Target Pace</span>
          </div>
          <div>
            <div className="h-1 w-12 border-t-2 border-dashed border-orange-500 mx-auto mb-1"></div>
            <span className="text-xs text-slate-600">Projected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}