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
          Connecting to FanDragon...
        </>
      ) : (
        "Sign in with FanDragon"
      )}
    </Button>
  );
}