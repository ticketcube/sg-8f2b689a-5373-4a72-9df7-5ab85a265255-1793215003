import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bookmark, Calendar, User, Shield, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  async function checkAuthAndRedirect() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-foreground">Family AI Agent</h1>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-serif font-bold text-foreground mb-6">
          Your Personal AI Secretary
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A private AI assistant platform where each family member has their own secure agent for searching, storing, and organizing personal information.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Create Account
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="font-serif">Private & Secure</CardTitle>
              <CardDescription>
                Each family member has isolated, secure space. Your conversations and data are completely private.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="font-serif">AI Agent Chat</CardTitle>
              <CardDescription>
                Conversational interface for questions, tasks, and assistance. Your personal AI secretary is always ready to help.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bookmark className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="font-serif">Personal Storage</CardTitle>
              <CardDescription>
                Save important information, conversations, and documents with smart search and organization.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="font-serif">Shared Calendar</CardTitle>
              <CardDescription>
                Family calendar for reminders, milestones, and events. Add events naturally through chat.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="font-serif">Smart Search</CardTitle>
              <CardDescription>
                Semantic search across all your stored information. Find what you need instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <User className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="font-serif">Family Accounts</CardTitle>
              <CardDescription>
                Each member gets their own account with personalized experience and private data.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Ready to Get Organized?</CardTitle>
            <CardDescription className="text-lg mt-4">
              Join your family's private AI assistant platform today. Professional, trustworthy, and always ready to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Create Your Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Family AI Agent Service. Your personal AI secretary.</p>
        </div>
      </footer>
    </div>
  );
}