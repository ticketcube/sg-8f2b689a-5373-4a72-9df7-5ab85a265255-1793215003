import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lock, Search, Store, Users, MessageSquare } from "lucide-react";
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
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-serif font-bold text-foreground">Family AI Agent</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-accent hover:bg-accent/90 text-foreground font-semibold">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Your Family's Private
            <br />
            <span className="text-primary">AI Secretary</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Each family member gets their own secure AI assistant for searching, storing, and organizing personal information. Professional, trustworthy, and completely private.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 text-foreground font-semibold">
                Create Family Account
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <h2 className="text-4xl font-serif font-bold text-center text-foreground mb-12">
          Everything You Need
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Users className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Private Family Accounts</CardTitle>
              <CardDescription className="text-base">
                Each member has their own isolated, secure space. Your information stays private unless you choose to share.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">AI Agent Chat</CardTitle>
              <CardDescription className="text-base">
                Ask questions naturally. Your AI secretary helps you find information, organize thoughts, and manage tasks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Search className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Smart Search</CardTitle>
              <CardDescription className="text-base">
                Semantic search across all your stored information. Find what you need, even if you don't remember the exact words.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Store className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Personal Storage</CardTitle>
              <CardDescription className="text-base">
                Save important conversations, documents, and information. Tag and categorize for easy retrieval.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Lock className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Secure & Private</CardTitle>
              <CardDescription className="text-base">
                Bank-level encryption. Your data is yours alone. No sharing, no selling, complete privacy control.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Brain className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Organized Intelligence</CardTitle>
              <CardDescription className="text-base">
                Your AI secretary learns your preferences, suggests organization strategies, and keeps everything accessible.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif font-bold text-center text-foreground mb-16">
          Simple, Professional, Effective
        </h2>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-serif font-bold text-accent">1</span>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-semibold mb-2">Create Your Family Account</h3>
              <p className="text-muted-foreground text-lg">
                Sign up and invite family members. Each person gets their own private AI assistant.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-serif font-bold text-accent">2</span>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-semibold mb-2">Chat with Your AI Secretary</h3>
              <p className="text-muted-foreground text-lg">
                Ask questions, save information, organize your thoughts. Your AI assistant is always ready to help.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-serif font-bold text-accent">3</span>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-semibold mb-2">Access Anytime, Anywhere</h3>
              <p className="text-muted-foreground text-lg">
                Your information is always accessible, always private, and always organized exactly how you need it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-6">
            Ready to Get Organized?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join families who trust their AI secretary to keep their information secure, organized, and accessible.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-12 py-6 bg-accent hover:bg-accent/90 text-foreground font-semibold">
              Start Free Today
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Set up in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-serif font-semibold text-foreground">Family AI Agent</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-primary transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-primary transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}