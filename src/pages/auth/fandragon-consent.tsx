import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface ConsentPageProps {
  clientId?: string;
  redirectUri?: string;
  state?: string;
  scope?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export default function FanDragonConsent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<any>(null);
  const [appName, setAppName] = useState<string>('AI Assist');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    checkSession();
  }, [router.query]);

  const checkSession = async () => {
    try {
      // Extract OAuth parameters from URL
      const { 
        client_id, 
        redirect_uri, 
        state, 
        scope,
        code_challenge,
        code_challenge_method 
      } = router.query;

      // Validate required OAuth parameters
      if (!client_id || !redirect_uri || !state) {
        setError('Invalid OAuth request. Missing required parameters.');
        setLoading(false);
        return;
      }

      // Determine app name from redirect URI
      if (redirect_uri.toString().includes('ticketcube')) {
        setAppName('TicketCube');
      } else if (redirect_uri.toString().includes('aiassist')) {
        setAppName('AI Assist');
      }

      // Try to get existing FanDragon session from sessionStorage
      const sessionStr = sessionStorage.getItem('fandragon_session');
      let accessToken = null;

      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (session.access_token && session.expires_at > Date.now()) {
            accessToken = session.access_token;
          }
        } catch {
          // Invalid session, clear it
          sessionStorage.removeItem('fandragon_session');
        }
      }

      if (!accessToken) {
        // No valid session - redirect to FanDragon login
        const loginUrl = new URL('https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/authorize');
        loginUrl.searchParams.set('client_id', client_id.toString());
        loginUrl.searchParams.set('redirect_uri', window.location.href);
        loginUrl.searchParams.set('response_type', 'code');
        loginUrl.searchParams.set('scope', scope?.toString() || 'openid email profile');
        
        window.location.href = loginUrl.toString();
        return;
      }

      // Check if session is valid via API route
      const response = await fetch('/api/auth/fandragon/check-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (!response.ok) {
        // Session invalid - redirect to FanDragon login
        sessionStorage.removeItem('fandragon_session');
        const loginUrl = new URL('https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/authorize');
        loginUrl.searchParams.set('client_id', client_id.toString());
        loginUrl.searchParams.set('redirect_uri', window.location.href);
        loginUrl.searchParams.set('response_type', 'code');
        loginUrl.searchParams.set('scope', scope?.toString() || 'openid email profile');
        
        window.location.href = loginUrl.toString();
        return;
      }

      const data = await response.json();
      setUserSession(data.user);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to verify session');
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      const { 
        client_id, 
        redirect_uri, 
        state, 
        scope,
        code_challenge,
        code_challenge_method 
      } = router.query;

      // Call FanDragon's OAuth authorize endpoint
      const authorizeUrl = new URL('https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/authorize');
      authorizeUrl.searchParams.set('client_id', client_id.toString());
      authorizeUrl.searchParams.set('redirect_uri', redirect_uri.toString());
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('state', state.toString());
      authorizeUrl.searchParams.set('scope', scope?.toString() || 'openid email profile');
      
      if (code_challenge) {
        authorizeUrl.searchParams.set('code_challenge', code_challenge.toString());
        authorizeUrl.searchParams.set('code_challenge_method', code_challenge_method?.toString() || 'S256');
      }

      // Redirect to complete OAuth flow
      window.location.href = authorizeUrl.toString();
    } catch (err: any) {
      setError(err.message || 'Failed to approve authorization');
      setApproving(false);
    }
  };

  const handleDeny = () => {
    const { redirect_uri, state } = router.query;
    const errorUrl = new URL(redirect_uri.toString());
    errorUrl.searchParams.set('error', 'access_denied');
    errorUrl.searchParams.set('error_description', 'User denied authorization');
    if (state) {
      errorUrl.searchParams.set('state', state.toString());
    }
    window.location.href = errorUrl.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <Card className="p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="text-gray-600 dark:text-gray-400">Verifying your FanDragon session...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authorization Error</h2>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Return Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <Card className="p-8 max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          {/* App Icon/Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authorize {appName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {appName} wants to access your FanDragon account
            </p>
          </div>

          {/* User Info */}
          {userSession && (
            <div className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userSession.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {userSession.user_metadata?.full_name || userSession.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {userSession.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="w-full space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This will allow {appName} to:
            </p>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Access your profile information
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Name, email, and profile picture
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Maintain your session
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Keep you signed in across visits
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={handleApprove}
              disabled={approving}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {approving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Authorizing...
                </>
              ) : (
                'Authorize'
              )}
            </Button>
            <Button
              onClick={handleDeny}
              disabled={approving}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Cancel
            </Button>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            By authorizing, you agree to share your FanDragon profile with {appName}. 
            You can revoke access anytime in your FanDragon account settings.
          </p>
        </div>
      </Card>
    </div>
  );
}