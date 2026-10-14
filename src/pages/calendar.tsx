import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";

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
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadEventsForDate(currentDate);
    }
  }, [currentDate]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    await loadEventsForDate(currentDate);
    setLoading(false);
  }

  async function loadEventsForDate(date: Date) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", session.user.id)
      .single();

    let query = supabase
      .from("family_events")
      .select("*")
      .eq("event_date", dateStr)
      .order("event_time", { ascending: true });

    if (profile?.avatar_url) {
      const { data: familyProfiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("avatar_url", profile.avatar_url);
      
      const familyUserIds = familyProfiles?.map(p => p.id) || [];
      if (familyUserIds.length > 0) {
        query = query.in("user_id", familyUserIds);
      }
    } else {
      query = query.eq("user_id", session.user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading events:", error);
    }

    setEvents(data || []);
  }

  function getDayLabel(date: Date): string {
    if (isToday(date)) return "TODAY";
    if (isTomorrow(date)) return "TOMORROW";
    if (isYesterday(date)) return "YESTERDAY";
    return format(date, 'EEEE').toUpperCase();
  }

  function goToPreviousDay() {
    setCurrentDate(subDays(currentDate, 1));
  }

  function goToNextDay() {
    setCurrentDate(addDays(currentDate, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const eventTypeColors: Record<string, string> = {
    shopping: "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-300",
    task: "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-300",
    reminder: "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300",
    milestone: "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-400",
    event: "bg-gradient-to-br from-green-500 to-green-600 border-green-300",
    birthday: "bg-gradient-to-br from-pink-500 to-pink-600 border-pink-300",
    appointment: "bg-gradient-to-br from-orange-600 to-orange-700 border-orange-400",
    other: "bg-gradient-to-br from-gray-500 to-gray-600 border-gray-300"
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="h-16 w-16 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-2xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="lg" className="p-4">
              <Home className="w-8 h-8 text-gray-700" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Date Display */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center border-4 border-blue-200">
          <div className="text-xl font-semibold text-blue-600 mb-2">
            {getDayLabel(currentDate)}
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={goToPreviousDay}
            className="flex flex-col items-center justify-center
              rounded-2xl border-4 border-gray-300 bg-white
              py-8 shadow-lg transition-all hover:bg-gray-50
              active:scale-95"
          >
            <ChevronLeft size={48} strokeWidth={3} className="text-gray-700" />
            <span className="mt-2 text-xl font-bold text-gray-700">PREVIOUS</span>
          </button>

          <button
            onClick={goToToday}
            className="flex flex-col items-center justify-center
              rounded-2xl border-4 border-blue-300 bg-blue-600
              py-8 shadow-lg transition-all hover:bg-blue-700
              active:scale-95 text-white"
          >
            <Home size={48} strokeWidth={3} />
            <span className="mt-2 text-xl font-bold">TODAY</span>
          </button>

          <button
            onClick={goToNextDay}
            className="flex flex-col items-center justify-center
              rounded-2xl border-4 border-gray-300 bg-white
              py-8 shadow-lg transition-all hover:bg-gray-50
              active:scale-95"
          >
            <ChevronRight size={48} strokeWidth={3} className="text-gray-700" />
            <span className="mt-2 text-xl font-bold text-gray-700">NEXT</span>
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-4 border-gray-200">
              <p className="text-3xl font-bold text-gray-400 mb-3">No Events</p>
              <p className="text-xl text-gray-500">
                Nothing scheduled for this day
              </p>
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className={`rounded-3xl shadow-xl p-8 text-white border-4 ${
                  eventTypeColors[event.event_type] || eventTypeColors.other
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">
                      {event.event_type}
                    </div>
                    <h3 className="text-3xl font-bold leading-tight mb-3">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-xl opacity-90 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                {!event.all_day && event.event_time && (
                  <div className="mt-4 pt-4 border-t-2 border-white/30">
                    <p className="text-2xl font-bold">
                      🕐 {event.event_time}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}