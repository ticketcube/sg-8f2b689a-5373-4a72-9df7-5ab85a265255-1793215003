import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { classifyPacingStatus } from "@/lib/calculations";
import type { PacingStatus } from "@/types/calculator";

interface PacingStatusCardProps {
  currentTicketsSold: number;
  targetTickets: number;
  daysToEvent: number;
  ticketsRemaining: number;
}

export function PacingStatusCard({
  currentTicketsSold,
  targetTickets,
  daysToEvent,
  ticketsRemaining,
}: PacingStatusCardProps) {
  const status = classifyPacingStatus(
    currentTicketsSold,
    targetTickets,
    daysToEvent,
    ticketsRemaining
  );

  const getStatusColor = (status: PacingStatus) => {
    switch (status) {
      case "ahead":
        return "bg-green-100 text-green-800 border-green-200";
      case "on_pace":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "behind":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status: PacingStatus) => {
    switch (status) {
      case "ahead":
        return <TrendingUp className="h-5 w-5" />;
      case "on_pace":
        return <Minus className="h-5 w-5" />;
      case "behind":
        return <TrendingDown className="h-5 w-5" />;
      case "critical":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: PacingStatus) => {
    switch (status) {
      case "ahead":
        return "Ahead of Pace";
      case "on_pace":
        return "On Pace";
      case "behind":
        return "Behind Pace";
      case "critical":
        return "Critical - Off Track";
      default:
        return "Unknown";
    }
  };

  const getStatusDescription = (status: PacingStatus) => {
    const pct = ((currentTicketsSold / targetTickets) * 100).toFixed(1);
    switch (status) {
      case "ahead":
        return `Tracking ${pct}% ahead of target with ${daysToEvent} days remaining`;
      case "on_pace":
        return `On target with ${daysToEvent} days to event`;
      case "behind":
        return `Need to accelerate - ${ticketsRemaining.toLocaleString()} tickets in ${daysToEvent} days`;
      case "critical":
        return `Urgent action needed - significantly behind target`;
      default:
        return "";
    }
  };

  return (
    <Card className={`border-2 ${getStatusColor(status)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getStatusIcon(status)}
          Sales Pacing Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <Badge
              variant="outline"
              className={`text-base font-semibold px-4 py-1 ${getStatusColor(status)}`}
            >
              {getStatusLabel(status)}
            </Badge>
          </div>
          <p className="text-sm font-medium">
            {getStatusDescription(status)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}