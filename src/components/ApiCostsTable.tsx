import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiUsageStats {
  api_name: string;
  total_calls: number;
  total_cost: number;
  total_tokens?: number;
  last_used?: string;
}

interface ApiCostsSummary {
  total_cost: number;
  total_calls: number;
  by_api: ApiUsageStats[];
  last_updated: string;
}

export function ApiCostsTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ApiCostsSummary | null>(null);

  const fetchApiCosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/api-costs", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch API costs");
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiCosts();
  }, []);

  const getApiIcon = (apiName: string) => {
    switch (apiName) {
      case "openai":
        return "🤖";
      case "brave_search":
        return "🔍";
      case "tts":
        return "🔊";
      case "supabase":
        return "🗄️";
      default:
        return "📡";
    }
  };

  const getApiLabel = (apiName: string) => {
    switch (apiName) {
      case "openai":
        return "OpenAI (GPT)";
      case "brave_search":
        return "Brave Search";
      case "tts":
        return "Text-to-Speech";
      case "supabase":
        return "Supabase DB";
      default:
        return apiName;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading API costs...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchApiCosts} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-gray-500">
          No API usage data available
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Costs</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${stats.total_cost.toFixed(4)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total API Calls</p>
              <p className="text-2xl font-bold">{stats.total_calls.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active APIs</p>
              <p className="text-2xl font-bold">{stats.by_api.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">API Usage Breakdown</h3>
          <Button onClick={fetchApiCosts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>API Service</TableHead>
              <TableHead className="text-right">Total Calls</TableHead>
              <TableHead className="text-right">Tokens Used</TableHead>
              <TableHead className="text-right">Cost (USD)</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.by_api.map((api) => (
              <TableRow key={api.api_name}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getApiIcon(api.api_name)}</span>
                    <span className="font-medium">{getApiLabel(api.api_name)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {api.total_calls.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {api.total_tokens ? api.total_tokens.toLocaleString() : "N/A"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {api.total_cost > 0 ? (
                    <span className="text-green-600 dark:text-green-400">
                      ${api.total_cost.toFixed(4)}
                    </span>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="text-xs text-gray-500 text-right">
        Last updated: {new Date(stats.last_updated).toLocaleString()}
      </div>
    </div>
  );
}