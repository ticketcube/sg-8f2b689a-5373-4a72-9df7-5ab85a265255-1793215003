import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Target, Zap, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { MediaMixSummary as MediaMixSummaryType } from "@/types/calculator";

interface MediaMixSummaryProps {
  summary: MediaMixSummaryType;
}

const CHANNEL_NAMES: Record<string, string> = {
  tv_ctv: 'TV/CTV',
  radio_audio: 'Radio',
  ooh: 'OOH',
  paid_social: 'Social',
  paid_search: 'Search',
  display_programmatic: 'Display',
  youtube_video: 'YouTube',
  retargeting: 'Retarget',
  crm_email: 'CRM',
};

const CHANNEL_COLORS: Record<string, string> = {
  tv_ctv: '#3b82f6',
  radio_audio: '#8b5cf6',
  ooh: '#ec4899',
  paid_social: '#06b6d4',
  paid_search: '#10b981',
  display_programmatic: '#f59e0b',
  youtube_video: '#ef4444',
  retargeting: '#6366f1',
  crm_email: '#14b8a6',
};

export function MediaMixSummary({ summary }: MediaMixSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  // Prepare data for budget allocation pie chart
  const budgetData = summary.channels
    .filter(ch => ch.budget > 0)
    .map(ch => ({
      name: CHANNEL_NAMES[ch.channelType] || ch.channelType,
      value: ch.budget,
      percent: ch.budgetPct,
    }));

  // Prepare data for ticket contribution bar chart
  const ticketData = summary.channels
    .filter(ch => ch.incrementalTickets > 0)
    .sort((a, b) => b.incrementalTickets - a.incrementalTickets)
    .map(ch => ({
      name: CHANNEL_NAMES[ch.channelType] || ch.channelType,
      tickets: ch.incrementalTickets,
      cpt: ch.costPerTicket,
      channelType: ch.channelType,
    }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Media Budget
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalBudget)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across {summary.channels.length} channels
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Tickets from Media
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(summary.totalIncrementalTickets)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatNumber(summary.totalAttributedTickets)} attributed
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Blended CPT
            </CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.blendedCostPerTicket)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cost per incremental ticket
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Blended ROAS
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summary.blendedRoas.toFixed(2)}:1
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Return on ad spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Allocation Pie Chart */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetData.map((entry, index) => {
                    const channelType = summary.channels.find(
                      ch => (CHANNEL_NAMES[ch.channelType] || ch.channelType) === entry.name
                    )?.channelType;
                    const color = channelType ? CHANNEL_COLORS[channelType] : '#94a3b8';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ticket Contribution Bar Chart */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tickets by Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={70} style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'tickets') return [formatNumber(value), 'Tickets'];
                    if (name === 'cpt') return [formatCurrency(value), 'CPT'];
                    return value;
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                />
                <Bar dataKey="tickets" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {ticketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.channelType] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Channel</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Budget</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Impressions</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Clicks</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Tickets</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">CPT</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {summary.channels
                  .sort((a, b) => b.roas - a.roas)
                  .map((channel) => (
                    <tr key={channel.channelType} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-900">
                        {CHANNEL_NAMES[channel.channelType] || channel.channelType}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">
                        {formatCurrency(channel.budget)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">
                        {formatNumber(channel.impressions)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">
                        {formatNumber(channel.clicks)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">
                        {formatNumber(channel.incrementalTickets)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">
                        {formatCurrency(channel.costPerTicket)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span
                          className={`font-semibold ${
                            channel.roas >= 5
                              ? 'text-green-600'
                              : channel.roas >= 3
                              ? 'text-blue-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {channel.roas.toFixed(2)}:1
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}