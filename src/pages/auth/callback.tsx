import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fandragonAuthService } from "@/services/fandragonAuthService";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await fandragonAuthService.handleCallback();
        router.push("/");
      } catch (err) {
        console.error("Callback error:", err);
        setError("Authentication failed");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2 text-lg font-semibold">Authentication Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}