import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

function useUserProfile() {
    const [user, setUser] = useState < any > (null);
    const [profile, setProfile] = useState < any > (null);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        setProfile(data);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return { user, profile, signOut };
}

function AuthDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Welcome to FanDragon</DialogTitle>
                    <DialogDescription>
                        Sign in to access your central identity hub
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                    <Button
                        onClick={() => router.push("/auth/login")}
                        className="w-full"
                    >
                        Sign In
                    </Button>
                    <Button
                        onClick={() => router.push("/auth/signup")}
                        variant="outline"
                        className="w-full"
                    >
                        Create Account
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function FanDragonPage() {
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
                    src="/fandragon-hero.png"
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

                    {/* Main Headline */}
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
                        <h2 className="text-3xl md:text-5xl font-semibold text-white/80">
                            Your AI Ticket Agent
                        </h2>
                    </div>
                </div>
            </main>

            <AuthDialog
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
            />

            {/* Footer with legal links */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pb-6">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <Link
                        href="/termsandconditions"
                        className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
                    >
                        Terms of Service
                    </Link>
                    <span className="text-white/50">•</span>
                    <Link
                        href="/privacyPolicy"
                        className="text-white/80 hover:text-white transition-colors duration-200 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}