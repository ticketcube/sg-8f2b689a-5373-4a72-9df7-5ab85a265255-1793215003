import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";

interface SalesPacingFormProps {
  daysToEvent: number;
  expectedOrganicSalesPerDay: number;
  historicalSellThroughPct: number;
  onDaysToEventChange: (value: number) => void;
  onOrganicSalesChange: (value: number) => void;
  onHistoricalSellThroughChange: (value: number) => void;
}

export function SalesPacingForm({
  daysToEvent,
  expectedOrganicSalesPerDay,
  historicalSellThroughPct,
  onDaysToEventChange,
  onOrganicSalesChange,
  onHistoricalSellThroughChange,
}: SalesPacingFormProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-600" />
          Sales Pacing Assumptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="daysToEvent" className="text-slate-700 font-medium">
              Days to Event
            </Label>
            <Input
              id="daysToEvent"
              type="number"
              min="0"
              value={daysToEvent}
              onChange={(e) => onDaysToEventChange(parseInt(e.target.value) || 0)}
              className="border-slate-300"
            />
            <p className="text-xs text-slate-500">
              Time remaining until show date
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organicSales" className="text-slate-700 font-medium">
              Expected Organic Sales/Day
            </Label>
            <Input
              id="organicSales"
              type="number"
              min="0"
              value={expectedOrganicSalesPerDay}
              onChange={(e) => onOrganicSalesChange(parseInt(e.target.value) || 0)}
              className="border-slate-300"
            />
            <p className="text-xs text-slate-500">
              Natural daily sales without media
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="historicalSellThrough" className="text-slate-700 font-medium">
              Historical Sell-Through %
            </Label>
            <Input
              id="historicalSellThrough"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={historicalSellThroughPct}
              onChange={(e) => onHistoricalSellThroughChange(parseFloat(e.target.value) || 0)}
              className="border-slate-300"
            />
            <p className="text-xs text-slate-500">
              Past performance benchmark for this market
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}