import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EventDetailsFormProps {
  eventName: string;
  artistProduction: string;
  marketCity: string;
  venue: string;
  eventDate: string;
  onChange: (field: string, value: string) => void;
}

export function EventDetailsForm({
  eventName,
  artistProduction,
  marketCity,
  venue,
  eventDate,
  onChange,
}: EventDetailsFormProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Event Details</CardTitle>
        <CardDescription>Basic event information</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-sm font-medium text-slate-700">
              Event Name
            </Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => onChange("eventName", e.target.value)}
              placeholder="DroneArt: Four Seasons"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artistProduction" className="text-sm font-medium text-slate-700">
              Artist / Production
            </Label>
            <Input
              id="artistProduction"
              value={artistProduction}
              onChange={(e) => onChange("artistProduction", e.target.value)}
              placeholder="DroneArt Collective"
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marketCity" className="text-sm font-medium text-slate-700">
              Market / City
            </Label>
            <Input
              id="marketCity"
              value={marketCity}
              onChange={(e) => onChange("marketCity", e.target.value)}
              placeholder="Los Angeles"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue" className="text-sm font-medium text-slate-700">
              Venue
            </Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => onChange("venue", e.target.value)}
              placeholder="Forum"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate" className="text-sm font-medium text-slate-700">
              Event Date
            </Label>
            <Input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => onChange("eventDate", e.target.value)}
              className="border-slate-300"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}