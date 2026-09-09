import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Ticket, DollarSign, Percent } from "lucide-react";
import {
  calculateTotalRevenuePotential,
  calculateTargetTickets,
  calculateTicketsRemaining,
  calculateCurrentSellThrough,
  calculateRevenueRemaining,
} from "@/lib/calculations";

interface EconomicsKPICardsProps {
  venueCapacity: number;
  targetSellThroughPct: number;
  currentTicketsSold: number;
  avgTicketPrice: number;
  currentGrossRevenue: number;
  targetGrossRevenue: number;
}

export function EconomicsKPICards({
  venueCapacity,
  targetSellThroughPct,
  currentTicketsSold,
  avgTicketPrice,
  currentGrossRevenue,
  targetGrossRevenue,
}: EconomicsKPICardsProps) {
  const totalRevenuePotential = calculateTotalRevenuePotential(venueCapacity, avgTicketPrice);
  const targetTickets = calculateTargetTickets(venueCapacity, targetSellThroughPct);
  const ticketsRemaining = calculateTicketsRemaining(targetTickets, currentTicketsSold);
  const currentSellThrough = calculateCurrentSellThrough(currentTicketsSold, venueCapacity);
  const revenueRemaining = calculateRevenueRemaining(targetGrossRevenue, currentGrossRevenue);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-600">
            Revenue Potential
          </CardTitle>
          <DollarSign className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(totalRevenuePotential)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {formatNumber(venueCapacity)} capacity × {formatCurrency(avgTicketPrice)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-600">
            Target Tickets
          </CardTitle>
          <Target className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {formatNumber(targetTickets)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {formatPercent(targetSellThroughPct)} sell-through
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-600">
            Tickets Remaining
          </CardTitle>
          <Ticket className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {formatNumber(ticketsRemaining)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {formatNumber(currentTicketsSold)} sold / {formatNumber(targetTickets)} target
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-600">
            Current Sell-Through
          </CardTitle>
          <Percent className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {formatPercent(currentSellThrough)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {formatNumber(currentTicketsSold)} / {formatNumber(venueCapacity)} capacity
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-600">
            Revenue Remaining
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(revenueRemaining)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(currentGrossRevenue)} / {formatCurrency(targetGrossRevenue)} target
          </p>
        </CardContent>
      </Card>
    </div>
  );
}