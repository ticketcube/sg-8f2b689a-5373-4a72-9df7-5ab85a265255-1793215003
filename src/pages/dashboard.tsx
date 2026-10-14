import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar as CalendarIcon, LogOut, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  user_id: string;
  email: string;
  full_name: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  user_id: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setProfile(data);
      await loadUpcomingEvents(session.user.id, data.avatar_url);
    }
    setLoading(false);
  };

  async function loadUpcomingEvents(userId: string, avatarUrl: string | null) {
    const today = new Date().toISOString().split('T')[0];
    
    let query = supabase
      .from("family_events")
      .select("id, title, description, event_date, event_time, user_id")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true })
      .limit(3);

    if (avatarUrl) {
      const { data: familyProfiles } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("avatar_url", avatarUrl);
      
      const familyUserIds = familyProfiles?.map(p => p.user_id) || [];
      if (familyUserIds.length > 0) {
        query = query.in("user_id", familyUserIds);
      }
    } else {
      query = query.eq("user_id", userId);
    }

    const { data: events } = await query;
    setUpcomingEvents(events || []);
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!profile) return;

    setDeletingEventId(eventId);

    try {
      const { error } = await supabase
        .from("family_events")
        .delete()
        .eq("id", eventId)
        .eq("user_id", profile.user_id); // Ensure user can only delete their own events

      if (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setUpcomingEvents(prev => prev.filter(e => e.id !== eventId));

      toast({
        title: "Event Deleted",
        description: "The event has been removed from your calendar.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Assistant</h1>
          <p className="text-lg text-gray-600 mt-1">{profile?.full_name || "Welcome"}</p>
        </div>
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={handleSignOut}
          className="p-4"
        >
          <LogOut className="w-8 h-8 text-gray-700" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {/* Next Event Preview */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Up Next</h2>
            <div className="space-y-3">
              {upcomingEvents.slice(0, 2).map(event => (
                <div key={event.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300 relative">
                  <div className="pr-16">
                    <p className="text-2xl font-bold text-gray-900">{event.title}</p>
                    <p className="text-xl text-gray-700 mt-2">
                      {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {event.event_time && ` at ${event.event_time}`}
                    </p>
                  </div>
                  
                  {/* Delete button - only show for user's own events */}
                  {profile && event.user_id === profile.user_id && (
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deletingEventId === event.id}
                      className="absolute top-4 right-4 p-3 hover:bg-red-100 hover:text-red-600"
                    >
                      {deletingEventId === event.id ? (
                        <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-7 h-7" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Start Chat Button */}
          <Link href="/chat-senior">
            <button className="w-full flex flex-col items-center justify-center
              rounded-3xl border-8 border-green-200 bg-green-600
              text-white shadow-2xl transition-all duration-200
              hover:scale-105 hover:bg-green-700 active:scale-95
              py-12 px-8">
              <MessageSquare size={68} strokeWidth={2.5} />
              <span className="mt-4 text-4xl font-extrabold tracking-wide">
                START CHAT
              </span>
              <span className="mt-2 text-xl">Talk to your AI assistant</span>
            </button>
          </Link>

          {/* Two-column grid for Events and Conversations */}
          <div className="grid grid-cols-2 gap-6">
            {/* View Events Button */}
            <Link href="/calendar">
              <button className="w-full flex flex-col items-center justify-center
                rounded-3xl border-8 border-blue-200 bg-blue-600
                text-white shadow-2xl transition-all duration-200
                hover:scale-105 hover:bg-blue-700 active:scale-95
                py-12 px-8">
                <CalendarIcon size={56} strokeWidth={2.5} />
                <span className="mt-4 text-3xl font-extrabold tracking-wide">
                  MY EVENTS
                </span>
                <span className="mt-2 text-lg">View schedule</span>
              </button>
            </Link>

            {/* View Conversations Button */}
            <Link href="/chat">
              <button className="w-full flex flex-col items-center justify-center
                rounded-3xl border-8 border-purple-200 bg-purple-600
                text-white shadow-2xl transition-all duration-200
                hover:scale-105 hover:bg-purple-700 active:scale-95
                py-12 px-8">
                <MessageSquare size={56} strokeWidth={2.5} />
                <span className="mt-4 text-3xl font-extrabold tracking-wide">
                  MY CHATS
                </span>
                <span className="mt-2 text-lg">Past conversations</span>
              </button>
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}