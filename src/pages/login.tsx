import { FanDragonLoginButton } from "@/components/FanDragonLoginButton";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { fandragonAuthService } from "@/services/fandragonAuthService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (fandragonAuthService.isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your List Assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* FanDragon OAuth */}
          <FanDragonLoginButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Secure Authentication
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}