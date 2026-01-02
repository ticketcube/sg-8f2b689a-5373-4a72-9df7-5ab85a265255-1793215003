import { Button } from "@/components/ui/button";
import { fandragonAuthService } from "@/services/fandragonAuthService";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function FanDragonLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await fandragonAuthService.initiateLogin();
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      className="w-full"
      variant="default"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting to FanDragon...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
          Sign in with FanDragon
        </>
      )}
    </Button>
  );
}