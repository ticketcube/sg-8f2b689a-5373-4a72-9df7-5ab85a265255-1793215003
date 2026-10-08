import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar as CalendarIcon, LogOut, User, Plus, Clock, ChevronRight, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);

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
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setProfile(data);
      await loadDashboardData(session.user.id);
    }
    setLoading(false);
  };

  async function loadDashboardData(userId: string) {
    // Load upcoming calendar events
    const today = new Date().toISOString().split('T')[0];
    const { data: events } = await supabase
      .from("family_events")
      .select("id, title, description, event_date, event_time")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true })
      .limit(5);

    setUpcomingEvents(events || []);

    // Load recent conversations
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(6);

    setRecentConversations(conversations || []);
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const formatEventDate = (dateStr: string, timeStr: string | null) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return timeStr ? `Today at ${timeStr}` : "Today";
    if (isTomorrow) return timeStr ? `Tomorrow at ${timeStr}` : "Tomorrow";
    
    const dateFormat = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return timeStr ? `${dateFormat} at ${timeStr}` : dateFormat;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Optimized Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg font-bold text-primary">Family AI</h1>
            <p className="text-xs text-muted-foreground">
              {profile?.full_name || "Welcome"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-8 w-8 p-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-20 space-y-4 max-w-2xl mx-auto">
        {/* Upcoming Events Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-accent" />
              Upcoming
            </h2>
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-8 text-center">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask your AI assistant to add reminders
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="border-l-4 border-l-accent">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        <span>{formatEventDate(event.event_date, event.event_time)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* New Conversation Button */}
        <section className="py-2">
          <Link href="/chat-simple">
            <Button className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="h-5 w-5 mr-2" />
              Start New Conversation
            </Button>
          </Link>
        </section>

        {/* Recent Conversations Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Recent Chats
            </h2>
          </div>

          {recentConversations.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start your first chat above
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentConversations.map((conversation) => (
                <Link key={conversation.id} href={`/chat?id=${conversation.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {conversation.title || "Untitled Conversation"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/chat-simple">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-primary/20 hover:border-primary/40">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">New Chat</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/storage">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Bookmark className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">My Storage</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Upcoming Projects (Family Calendar) */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-serif font-semibold text-foreground">
              Upcoming Projects
            </h2>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}