import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fandragonAuthService } from "@/services/fandragonAuthService";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const { code, state, error: oauthError } = router.query;

      if (oauthError) {
        setError(oauthError as string);
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      if (!code || !state || typeof code !== "string" || typeof state !== "string") {
        return;
      }

      try {
        await fandragonAuthService.handleCallback(code, state);
        router.push("/");
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Authentication Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}