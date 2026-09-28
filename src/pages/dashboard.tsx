import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Search, FolderPlus, LogOut, User, Bookmark, Calendar as CalendarIcon } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadStats();
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
    }
    setLoading(false);
  };

  async function loadStats() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { count: itemsCount } = await supabase
      .from("saved_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    setSavedItemsCount(itemsCount || 0);

    const { data: items } = await supabase
      .from("saved_items")
      .select("id, title, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    setRecentItems(items || []);
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-primary">Personal AI Assistant</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {profile?.full_name || "there"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-serif">New Conversation</CardTitle>
              <CardDescription>Start a chat with your AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full">
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-serif">Search Storage</CardTitle>
              <CardDescription>Find information you've saved</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/storage">
                <Button variant="outline" className="w-full">
                  Search
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <FolderPlus className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="font-serif">Save Item</CardTitle>
              <CardDescription>Store important information</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/storage?new=true">
                <Button variant="outline" className="w-full">
                  Add Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Recent Conversations</CardTitle>
              <CardDescription>Your latest chats</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No conversations yet. Start a new chat to begin.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Saved Items</CardTitle>
              <CardDescription>Quick access to your storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold text-foreground">{savedItemsCount}</p>
                <p className="text-sm text-muted-foreground">Total items stored</p>
              </div>
              {recentItems.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium">Recent:</p>
                  {recentItems.map((item) => (
                    <div key={item.id} className="text-sm text-muted-foreground truncate">
                      • {item.title}
                    </div>
                  ))}
                </div>
              )}
              <Link href="/storage">
                <Button variant="outline" className="w-full">
                  View All Items
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-accent" />
                Family Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Shared calendar for family reminders, milestones, and events
              </p>
              <Link href="/calendar">
                <Button variant="outline" className="w-full">
                  View Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}