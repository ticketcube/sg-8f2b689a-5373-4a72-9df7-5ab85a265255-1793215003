import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";


import { supabase } from "@/lib/supabase";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, ArrowRight, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/router";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Lock, Search, Store, Users, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user, profile, signOut } = useUserProfile();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Head>
        <title>FanDragon - Central Identity Hub</title>
        <meta name="description" content="One identity for all your digital experiences" />
      </Head>

      {/* Simple Header - No Logo */}
      <div className="absolute top-0 right-0 z-20 p-6">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
              >
                Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {profile?.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium hidden sm:inline">
                {profile?.display_name || user.email}
              </span>
            </div>

            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowAuth(true)}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
          >
            Sign In
          </Button>
        )}
      </div>

      {/* Full-Screen Hero Image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh]">
        <Image
          src="/fandragonlogo.png"
          alt="FanDragon"
          fill
          priority
          className="object-contain object-center"
        />
      </div>

      {/* Main Content - Below Hero */}
      <main className="relative">
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Main Headline - FIXED GRADIENT TEXT */}
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span 
                              className="inline-block"
                              style={{
                                  background: "linear-gradient(to right, rgb(59, 130, 246), rgb(147, 51, 234))",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text"
                              }}
               
              >
                Protect and Serve
              </span>
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold">
              <span 
                className="inline-block"
                style={{
                  background: "linear-gradient(to right, rgb(59, 130, 246), rgb(147, 51, 234))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                
              </span>
            </h2>
          </div>

          {/* Subheadline */}
        

         



          {/* Footer Tagline */}
          <div className="text-center mt-20">
          
          </div>

        </div>
      </main>

      <AuthDialog 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />

      {/* Footer with legal links - positioned at very bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-6">
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link 
            href="/TermsofService" 
            className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
          >
            Terms of Service
          </Link>
          <span className="text-white/50">•</span>
          <Link 
            href="/privacypolicy" 
            className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}