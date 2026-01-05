import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  TestTube, 
  Database, 
  Key, 
  CheckCircle, 
  XCircle, 
  Loader2,
  LogOut,
  AlertCircle
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  response?: string;
  model?: string;
  tables?: Record<string, boolean>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking admin authentication...');
      const token = localStorage.getItem('admin_token');
      console.log('🔍 Token exists:', !!token);
      
      if (!token) {
        console.log('🔴 No token found, redirecting to login');
        router.push('/admin/login');
        return;
      }

      console.log('🔍 Validating token with API...');
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'check' }),
      });

      console.log('🔍 Auth check response:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      console.log('🔍 Auth check data:', data);
      
      if (!data.authenticated || !data.isAdmin) {
        console.log('🔴 Not authenticated or not admin, redirecting to login');
        throw new Error('Admin access required');
      }

      console.log('✅ Admin authenticated successfully');
      setAuthenticated(true);
    } catch (error) {
      console.error('🔴 Auth check failed:', error);
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const runTest = async (testName: string) => {
    setTesting(testName);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ test: testName }),
      });

      const data = await response.json();
      setTestResults(prev => ({ ...prev, [testName]: data }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: 'Test failed', 
          details: error.message 
        } 
      }));
    } finally {
      setTesting(null);
    }
  };

  const runAllTests = async () => {
    await runTest('openai');
    await runTest('supabase');
    await runTest('database-tables');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              System configuration and diagnostics
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/')}>
              ← Back to App
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="diagnostics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diagnostics">
              <TestTube className="h-4 w-4 mr-2" />
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">System Diagnostics</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Test API connectivity and system health
                  </p>
                </div>
                <Button onClick={runAllTests} disabled={testing !== null} size="lg">
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Run All Tests'
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {/* OpenAI Test */}
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Key className="h-6 w-6 text-purple-600" />
                      <div>
                        <h3 className="text-lg font-semibold">OpenAI API</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Test GPT model connectivity
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {testResults.openai && (
                        <Badge variant={testResults.openai.success ? "default" : "destructive"}>
                          {testResults.openai.success ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Working
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Failed
                            </>
                          )}
                        </Badge>
                      )}
                      <Button
                        onClick={() => runTest('openai')}
                        disabled={testing === 'openai'}
                        variant="outline"
                      >
                        {testing === 'openai' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                  </div>
                  {testResults.openai && (
                    <div className={`p-4 rounded-lg ${
                      testResults.openai.success 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {testResults.openai.success ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            ✓ {testResults.openai.response}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Model: {testResults.openai.model}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            {testResults.openai.error}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {testResults.openai.details}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Supabase Test */}
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold">Supabase Connection</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Test database connectivity
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {testResults.supabase && (
                        <Badge variant={testResults.supabase.success ? "default" : "destructive"}>
                          {testResults.supabase.success ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Connected
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Failed
                            </>
                          )}
                        </Badge>
                      )}
                      <Button
                        onClick={() => runTest('supabase')}
                        disabled={testing === 'supabase'}
                        variant="outline"
                      >
                        {testing === 'supabase' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                  </div>
                  {testResults.supabase && (
                    <div className={`p-4 rounded-lg ${
                      testResults.supabase.success 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <p className={`text-sm font-medium ${
                        testResults.supabase.success 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {testResults.supabase.success ? '✓ ' : '✗ '}
                        {testResults.supabase.message || testResults.supabase.error}
                      </p>
                      {testResults.supabase.details && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {testResults.supabase.details}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Database Tables Test */}
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold">Database Tables</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Verify required tables exist
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => runTest('database-tables')}
                      disabled={testing === 'database-tables'}
                      variant="outline"
                    >
                      {testing === 'database-tables' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                  {testResults['database-tables'] && testResults['database-tables'].tables && (
                    <div className="space-y-2">
                      {Object.entries(testResults['database-tables'].tables).map(([table, exists]) => (
                        <div key={table} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-mono text-sm">{table}</span>
                          <Badge variant={exists ? "default" : "destructive"}>
                            {exists ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Exists
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Missing
                              </>
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">System Settings</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                        Current Issue Detected
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                        Your OpenAI API key appears to be invalid or expired. Please update it in your environment variables.
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                        Current key: {process.env.OPENAI_API_KEY?.slice(0, 20)}...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">platform.openai.com</a>
                    </p>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supabase-url">Supabase URL</Label>
                    <Input
                      id="supabase-url"
                      type="text"
                      value={process.env.NEXT_PUBLIC_SUPABASE_URL}
                      disabled
                      className="font-mono"
                    />
                  </div>

                  <Button size="lg" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings (Update .env.local manually)
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Database Setup</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Required Tables
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Run these SQL commands in your Supabase SQL editor to set up the admin system:
                  </p>
                  <div className="bg-gray-900 p-4 rounded text-xs font-mono text-gray-100 overflow-x-auto">
                    <pre>{`-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  openai_api_key TEXT,
  openai_model TEXT DEFAULT 'gpt-3.5-turbo',
  system_prompt TEXT,
  enable_ai BOOLEAN DEFAULT true,
  max_conversation_length INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can view all admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'admin'));

CREATE POLICY "System settings readable by admins"
  ON system_settings FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'admin'));`}</pre>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    Create Your First Admin User
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                    After creating an account in Supabase Auth, run this to make yourself an admin:
                  </p>
                  <div className="bg-gray-900 p-4 rounded text-xs font-mono text-gray-100 overflow-x-auto">
                    <pre>{`-- Replace YOUR_EMAIL with your actual email
INSERT INTO admin_users (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';`}</pre>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}