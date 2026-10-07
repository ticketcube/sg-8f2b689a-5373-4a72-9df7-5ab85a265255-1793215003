import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, List, Plus, ArrowLeft, Edit2, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FamilyEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  all_day: boolean;
  event_time: string | null;
  created_at: string;
  creator?: {
    email: string;
    display_name: string | null;
  };
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_type: "event",
    all_day: true,
    event_time: ""
  });

  useEffect(() => {
    checkAuth();
    loadEvents();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
    }
  }

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("family_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error loading events:", error);
    }

    if (data) {
      setEvents(data as any);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const eventData = {
      ...formData,
      user_id: session.user.id,
      event_time: formData.all_day ? null : formData.event_time
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("family_events")
        .update(eventData)
        .eq("id", editingEvent);

      if (!error) {
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
        loadEvents();
      }
    } else {
      const { error } = await supabase
        .from("family_events")
        .insert(eventData);

      if (!error) {
        setShowForm(false);
        resetForm();
        loadEvents();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;

    const { error } = await supabase
      .from("family_events")
      .delete()
      .eq("id", id);

    if (!error) {
      loadEvents();
    }
  }

  function handleEdit(event: FamilyEvent) {
    setFormData({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date,
      event_type: event.event_type,
      all_day: event.all_day,
      event_time: event.event_time || ""
    });
    setEditingEvent(event.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      event_type: "event",
      all_day: true,
      event_time: ""
    });
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }

  function getEventsForDate(date: Date | null) {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return events.filter(e => e.event_date === dateStr);
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 10);

  const eventTypeColors: Record<string, string> = {
    reminder: "bg-blue-100 text-blue-800",
    milestone: "bg-purple-100 text-purple-800",
    event: "bg-green-100 text-green-800",
    birthday: "bg-pink-100 text-pink-800",
    appointment: "bg-orange-100 text-orange-800",
    other: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-serif font-semibold text-foreground">Family Calendar</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button onClick={() => { setShowForm(true); setEditingEvent(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-serif">{editingEvent ? "Edit Event" : "New Event"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.event_date}
                      onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <Select value={formData.event_type} onValueChange={v => setFormData({ ...formData, event_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="all_day"
                    checked={formData.all_day}
                    onChange={e => setFormData({ ...formData, all_day: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="all_day" className="text-sm font-medium">All day event</label>
                </div>

                {!formData.all_day && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <Input
                      type="time"
                      value={formData.event_time}
                      onChange={e => setFormData({ ...formData, event_time: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit">{editingEvent ? "Update" : "Create"} Event</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingEvent(null); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {viewMode === "calendar" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>Next</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentDate).map((date, idx) => {
                  const dayEvents = getEventsForDate(date);
                  const isToday = date && date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "min-h-24 border border-border p-2 rounded",
                        !date && "bg-muted",
                        isToday && "border-accent border-2"
                      )}
                    >
                      {date && (
                        <>
                          <div className={cn("text-sm font-medium mb-1", isToday && "text-accent")}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.map(event => (
                              <div
                                key={event.id}
                                className={cn("text-xs p-1 rounded truncate", eventTypeColors[event.event_type])}
                                title={event.title}
                              >
                                {!event.all_day && event.event_time && (
                                  <Clock className="inline h-3 w-3 mr-1" />
                                )}
                                {event.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "list" && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-semibold">Upcoming Events</h2>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No upcoming events. Add one to get started!
                </CardContent>
              </Card>
            ) : (
              upcomingEvents.map(event => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-serif text-lg font-semibold">{event.title}</h3>
                          <span className={cn("text-xs px-2 py-1 rounded", eventTypeColors[event.event_type])}>
                            {event.event_type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(event.event_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                          {!event.all_day && event.event_time && ` at ${event.event_time}`}
                        </p>
                        {event.description && (
                          <p className="text-sm text-foreground mb-2">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}