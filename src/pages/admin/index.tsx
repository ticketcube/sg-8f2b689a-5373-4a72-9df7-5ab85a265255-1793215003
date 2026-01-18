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
  AlertCircle,
  Activity
} from 'lucide-react';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApiCostsTable } from "@/components/ApiCostsTable";

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
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'check' }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      if (!data.authenticated || !data.isAdmin) {
        throw new Error('Admin access required');
      }

      setAuthenticated(true);
    } catch (error) {
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
            <TabsTrigger value="diagnostics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="api-costs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              API Costs & Usage
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
                {testResults.openai && !testResults.openai.success && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                          OpenAI API Issue Detected
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                          {testResults.openai.error}: {testResults.openai.details}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Please update your OpenAI API key in the .env.local file and restart the server.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {testResults.openai && testResults.openai.success && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                          OpenAI API Connected
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          ✓ {testResults.openai.response}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Model: {testResults.openai.model}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!testResults.openai && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Run the OpenAI diagnostic test to check your API key status.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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

          <TabsContent value="api-costs" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">API Costs & Usage</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor API usage and costs across all users and services
              </p>
            </div>

            <ApiCostsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}