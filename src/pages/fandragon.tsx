import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles, Shield, Camera, Calendar, Users, Music, Lightbulb } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FanDragonLanding() {
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
          <div className="flex items-center gap-3">
            <img src="/fandragon-hero.png" alt="FanDragon" className="h-10" />
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-accent hover:bg-accent/90 text-foreground font-semibold">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 to-background z-0" />
        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
              Protect Your<br />
              <span className="text-accent">Precious Memories</span>
            </h1>
            <p className="text-2xl text-secondary mb-4">
              Your Personal AI Secretary for Fans
            </p>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              From unforgettable concerts and sporting events to everyday life moments that matter — 
              preserve, organize, and relive what's meaningful to you and your self-determined family.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-10 py-7 bg-accent hover:bg-accent/90 text-foreground font-semibold shadow-lg">
                  Start Protecting Memories
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-primary text-primary hover:bg-primary hover:text-white">
                  I'm Already a Fan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-6">
            Every Memory Deserves to Be Remembered
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Life moves fast. Concert tickets, setlists, photos, stories from that amazing show — they all fade. 
            Your family's milestones, inside jokes, favorite moments — they deserve better than scattered screenshots and forgotten details.
            <span className="block mt-4 text-secondary font-semibold">
              FanDragon is your personal AI secretary, protecting what matters most.
            </span>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif font-bold text-center text-foreground mb-4">
          Built for Fans, Families & Life
        </h2>
        <p className="text-center text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Whether you're preserving concert memories or capturing family moments, FanDragon keeps it all safe, searchable, and meaningful.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Music className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Live Event Memories</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Concerts, festivals, games, shows — save tickets, setlists, photos, and stories. Never forget that incredible night.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Heart className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Life's Special Moments</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Birthdays, anniversaries, first steps, first words — preserve the details that make your family story unique.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Users className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Self-Determined Families</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Each family member gets their own private space. Share what you want, keep what's personal. Your data, your rules.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">AI Memory Assistant</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Chat naturally with your AI secretary. "When did we see Radiohead?" "What was the setlist?" Instant answers from your memories.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Camera className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Photos & Stories</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Upload photos, add context, tell the story. Your AI secretary organizes everything so you can find and relive any moment.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Private & Secure</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Your memories are yours alone. Bank-level encryption, isolated family accounts, and complete privacy control.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Calendar className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Shared Family Calendar</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Coordinate events, remember anniversaries, plan future concerts. Your family's timeline, all in one place.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardHeader>
              <Lightbulb className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Smart Search & Insights</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Find any memory instantly. See patterns, rediscover forgotten moments, get reminded of what matters.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors bg-accent/5">
            <CardHeader>
              <Sparkles className="h-10 w-10 text-accent mb-3" />
              <CardTitle className="font-serif text-xl">Always Growing</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                New features, smarter AI, better ways to preserve what you love. Your memories get more valuable over time.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-gradient-to-b from-muted/20 to-background py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif font-bold text-center text-foreground mb-16">
            Who Uses FanDragon?
          </h2>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-3">Music Fans</h3>
              <p className="text-muted-foreground leading-relaxed">
                Concert lovers preserving every show, setlist, and moment. From indie venues to arena tours, never lose track of your musical journey.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-3">Families</h3>
              <p className="text-muted-foreground leading-relaxed">
                Parents, kids, chosen families — everyone gets their own space to save what's special. Share memories together while keeping private moments private.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-3">Memory Keepers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Anyone who values their experiences. From sports fans to theater lovers to life documentarians — if it matters to you, FanDragon protects it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-24">
        <Card className="max-w-3xl mx-auto border-2 border-accent/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl font-serif mb-4">
              Your Memories Are Waiting
            </CardTitle>
            <CardDescription className="text-xl leading-relaxed">
              Start your FanDragon account today. Free to begin, and your first memories are on us. 
              <span className="block mt-3 text-secondary font-semibold">
                Because every fan deserves to remember.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center pt-4">
            <Link href="/auth/signup" className="w-full max-w-md">
              <Button size="lg" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-foreground font-semibold shadow-lg">
                Create Your Free Account
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required • Start preserving memories in minutes
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/fandragon-hero.png" alt="FanDragon" className="h-8" />
              <span className="text-sm text-muted-foreground">Your Personal AI Secretary for Fans</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-accent transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-accent transition-colors">Get Started</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>© 2026 FanDragon. Protecting memories for self-determined families and fans everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}