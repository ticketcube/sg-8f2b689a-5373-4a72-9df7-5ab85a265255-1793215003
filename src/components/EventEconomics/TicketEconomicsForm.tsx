import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketEconomicsFormProps {
  venueCapacity: number;
  targetSellThroughPct: number;
  currentTicketsSold: number;
  avgTicketPrice: number;
  premiumTicketPct: number;
  premiumTicketPrice: number;
  standardTicketPrice: number;
  currentGrossRevenue: number;
  targetGrossRevenue: number;
  onChange: (field: string, value: number) => void;
}

export function TicketEconomicsForm({
  venueCapacity,
  targetSellThroughPct,
  currentTicketsSold,
  avgTicketPrice,
  premiumTicketPct,
  premiumTicketPrice,
  standardTicketPrice,
  currentGrossRevenue,
  targetGrossRevenue,
  onChange,
}: TicketEconomicsFormProps) {
  const handleChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange(field, numValue);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Ticket Economics</CardTitle>
        <CardDescription>Capacity, pricing, and current performance</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="venueCapacity" className="text-sm font-medium text-slate-700">
              Venue Capacity
            </Label>
            <Input
              id="venueCapacity"
              type="number"
              value={venueCapacity || ""}
              onChange={(e) => handleChange("venueCapacity", e.target.value)}
              placeholder="5000"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetSellThroughPct" className="text-sm font-medium text-slate-700">
              Target Sell-Through %
            </Label>
            <Input
              id="targetSellThroughPct"
              type="number"
              value={targetSellThroughPct || ""}
              onChange={(e) => handleChange("targetSellThroughPct", e.target.value)}
              placeholder="90"
              min="0"
              max="100"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentTicketsSold" className="text-sm font-medium text-slate-700">
              Current Tickets Sold
            </Label>
            <Input
              id="currentTicketsSold"
              type="number"
              value={currentTicketsSold || ""}
              onChange={(e) => handleChange("currentTicketsSold", e.target.value)}
              placeholder="2750"
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="avgTicketPrice" className="text-sm font-medium text-slate-700">
              Average Ticket Price ($)
            </Label>
            <Input
              id="avgTicketPrice"
              type="number"
              value={avgTicketPrice || ""}
              onChange={(e) => handleChange("avgTicketPrice", e.target.value)}
              placeholder="100"
              step="0.01"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="premiumTicketPct" className="text-sm font-medium text-slate-700">
              Premium Ticket %
            </Label>
            <Input
              id="premiumTicketPct"
              type="number"
              value={premiumTicketPct || ""}
              onChange={(e) => handleChange("premiumTicketPct", e.target.value)}
              placeholder="20"
              min="0"
              max="100"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="premiumTicketPrice" className="text-sm font-medium text-slate-700">
              Premium Ticket Price ($)
            </Label>
            <Input
              id="premiumTicketPrice"
              type="number"
              value={premiumTicketPrice || ""}
              onChange={(e) => handleChange("premiumTicketPrice", e.target.value)}
              placeholder="150"
              step="0.01"
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="standardTicketPrice" className="text-sm font-medium text-slate-700">
              Standard Ticket Price ($)
            </Label>
            <Input
              id="standardTicketPrice"
              type="number"
              value={standardTicketPrice || ""}
              onChange={(e) => handleChange("standardTicketPrice", e.target.value)}
              placeholder="90"
              step="0.01"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentGrossRevenue" className="text-sm font-medium text-slate-700">
              Current Gross Revenue ($)
            </Label>
            <Input
              id="currentGrossRevenue"
              type="number"
              value={currentGrossRevenue || ""}
              onChange={(e) => handleChange("currentGrossRevenue", e.target.value)}
              placeholder="275000"
              step="0.01"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetGrossRevenue" className="text-sm font-medium text-slate-700">
              Target Gross Revenue ($)
            </Label>
            <Input
              id="targetGrossRevenue"
              type="number"
              value={targetGrossRevenue || ""}
              onChange={(e) => handleChange("targetGrossRevenue", e.target.value)}
              placeholder="450000"
              step="0.01"
              className="border-slate-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}