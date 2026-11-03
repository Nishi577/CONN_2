import React, { useState } from 'react';
import { ConnProfile, AnalyticsData, ClickLog } from '../../types';
import { loadAnalytics } from '../../lib/storage';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart2,
  TrendingUp,
  MousePointerClick,
  Users,
  Globe,
  Smartphone,
  Calendar,
  Clock,
  ExternalLink,
  Laptop,
  Tablet as TabletIcon,
  Filter,
  Download,
} from 'lucide-react';

interface AnalyticsViewProps {
  profile: ConnProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ profile }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const analytics: AnalyticsData = loadAnalytics();

  const activeLinks = [...profile.links].sort((a, b) => b.clicks - a.clicks);
  const maxClicks = Math.max(...activeLinks.map((l) => l.clicks), 1);

  // Timeframe multiplier and dynamic chart generation
  const timeframeMultiplier = timeframe === '7d' ? 1 : timeframe === '30d' ? 3.8 : 10.5;
  const displayViews = Math.round(analytics.totalViews * (timeframe === '7d' ? 1 : timeframe === '30d' ? 3.5 : 9.8));
  const displayClicks = Math.round(analytics.totalClicks * (timeframe === '7d' ? 1 : timeframe === '30d' ? 3.6 : 10.2));
  const displayCtr = parseFloat(((displayClicks / Math.max(displayViews, 1)) * 100).toFixed(1));

  // Generate dynamic chart data based on selected timeframe
  const chartData = React.useMemo(() => {
    if (timeframe === '7d') {
      return analytics.dailyViews || [];
    }
    const days = timeframe === '30d' ? 10 : 12; // 10 intervals for 30d, 12 intervals for 90d
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      if (timeframe === '30d') {
        d.setDate(now.getDate() - i * 3);
      } else {
        d.setDate(now.getDate() - i * 7);
      }
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const variance = 0.8 + Math.random() * 0.4;
      const baseViews = Math.round((analytics.totalViews / 7) * (timeframe === '30d' ? 3 : 7) * variance);
      const baseClicks = Math.round(baseViews * (displayCtr / 100) * (0.9 + Math.random() * 0.2));
      result.push({
        date: label,
        views: baseViews,
        clicks: baseClicks,
      });
    }
    return result;
  }, [timeframe, analytics.dailyViews, analytics.totalViews, displayCtr]);

  // Export CSV / JSON
  const handleExportAnalytics = (format: 'csv' | 'json') => {
    let content = '';
    const filename = `${profile.username}-analytics-${timeframe}.${format}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify({ ...analytics, timeframe, chartData }, null, 2);
      mimeType = 'application/json';
    } else {
      const headers = ['Type', 'Identifier', 'Label', 'Timestamp', 'Device', 'Referrer'];
      const rows = (analytics.clickLogs || []).map((c) => [
        'Click',
        c.linkId,
        `"${(c.linkTitle || '').replace(/"/g, '""')}"`,
        c.timestamp,
        c.deviceType,
        `"${(c.referrer || '').replace(/"/g, '""')}"`,
      ]);
      content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Recharts color theme
  const COLOR_VIEWS = '#1C1B18';
  const COLOR_CLICKS = '#C85A32';
  const PIE_COLORS = ['#C85A32', '#1C1B18', '#8C857B', '#E8E4D9'];

  // Format timestamp relative
  const formatTimeAgo = (isoStr: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const clickLogs: ClickLog[] = analytics.clickLogs || [
    {
      id: 'mock-1',
      linkId: 'l1',
      linkTitle: profile.links[0]?.title || 'Featured Essay',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      deviceType: 'Mobile',
      referrer: 'X / Twitter',
    },
    {
      id: 'mock-2',
      linkId: 'l2',
      linkTitle: profile.links[1]?.title || 'Atelier Portfolio',
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      deviceType: 'Desktop',
      referrer: 'Direct / Bio Link',
    },
    {
      id: 'mock-3',
      linkId: 'l3',
      linkTitle: profile.links[2]?.title || 'Substack Field Notes',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      deviceType: 'Mobile',
      referrer: 'Substack',
    },
  ];

  return (
    <div className="space-y-8 font-sans-ui text-[#1C1B18]">
      {/* Header Bar */}
      <div className="pb-4 border-b border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Quiet Analytics</h2>
          <p className="text-xs text-[#6B665E]">
            Editorial engagement metrics, time-series click logs, and device insights.
          </p>
        </div>

        {/* Actions & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <button
              onClick={() => handleExportAnalytics('csv')}
              className="px-2.5 py-1 text-xs font-mono-code border border-[#E8E4D9] hover:border-[#1C1B18] bg-white rounded-lg flex items-center gap-1 text-[#6B665E] hover:text-[#1C1B18] transition-colors"
              title="Download CSV Log"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExportAnalytics('json')}
              className="px-2.5 py-1 text-xs font-mono-code border border-[#E8E4D9] hover:border-[#1C1B18] bg-white rounded-lg flex items-center gap-1 text-[#6B665E] hover:text-[#1C1B18] transition-colors"
              title="Download JSON Analytics"
            >
              <Download className="w-3 h-3" />
              <span>JSON</span>
            </button>
          </div>

          <div className="flex items-center bg-[#FAF8F5] border border-[#E8E4D9] p-1 rounded-xl">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                timeframe === '7d' ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-2xs' : 'text-[#6B665E] hover:text-[#1C1B18]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                timeframe === '30d' ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-2xs' : 'text-[#6B665E] hover:text-[#1C1B18]'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeframe('90d')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                timeframe === '90d' ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-2xs' : 'text-[#6B665E] hover:text-[#1C1B18]'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B665E] uppercase tracking-wider mb-2">
            <span>Profile Views</span>
            <Users className="w-4 h-4 text-[#1C1B18]" />
          </div>
          <div className="font-serif-display text-3xl font-normal text-[#1C1B18]">
            {displayViews.toLocaleString()}
          </div>
          <span className="text-xs font-mono-code text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% in {timeframe}
          </span>
        </div>

        <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B665E] uppercase tracking-wider mb-2">
            <span>Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-[#C85A32]" />
          </div>
          <div className="font-serif-display text-3xl font-normal text-[#1C1B18]">
            {displayClicks.toLocaleString()}
          </div>
          <span className="text-xs font-mono-code text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +19.8% in {timeframe}
          </span>
        </div>

        <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B665E] uppercase tracking-wider mb-2">
            <span>Click-Through Rate</span>
            <BarChart2 className="w-4 h-4 text-[#1C1B18]" />
          </div>
          <div className="font-serif-display text-3xl font-normal text-[#1C1B18]">
            {displayCtr}%
          </div>
          <span className="text-xs font-mono-code text-[#6B665E] mt-1 block">
            High editorial retention
          </span>
        </div>
      </div>

      {/* RECHARTS AREA CHART — TIME SERIES TREND */}
      <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
              Engagement Trend (Views vs Clicks)
            </h3>
            <p className="text-xs text-[#6B665E]">
              Daily interaction volume over the selected {timeframe} timeframe.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-code">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1C1B18]" /> Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" /> Clicks
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_VIEWS} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLOR_VIEWS} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_CLICKS} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLOR_CLICKS} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6B665E', fontFamily: 'monospace' }}
                axisLine={{ stroke: '#E8E4D9' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B665E', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF8F5',
                  borderColor: '#E8E4D9',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke={COLOR_VIEWS}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#viewsGrad)"
                name="Profile Views"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke={COLOR_CLICKS}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#clicksGrad)"
                name="Link Clicks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP PERFORMING LINKS & DEVICE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Links */}
        <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
              Top Performing Links
            </h3>
            <span className="text-2xs font-mono-code px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-md text-[#6B665E]">
              Ranked by clicks
            </span>
          </div>

          <div className="space-y-3.5">
            {activeLinks.slice(0, 5).map((link, idx) => {
              const pct = Math.round((link.clicks / maxClicks) * 100);
              return (
                <div key={link.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1C1B18] truncate max-w-[200px] sm:max-w-xs">
                      0{idx + 1}. {link.title}
                    </span>
                    <span className="font-mono-code font-semibold text-[#1C1B18]">{link.clicks} clicks</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1C1B18] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
              Device Breakdown
            </h3>
            <Smartphone className="w-4 h-4 text-[#6B665E]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {analytics.deviceBreakdown.map((dev, idx) => {
              const Icon = dev.device === 'Mobile' ? Smartphone : dev.device === 'Desktop' ? Laptop : TabletIcon;
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl text-center space-y-1"
                >
                  <Icon className="w-4 h-4 mx-auto text-[#C85A32]" />
                  <div className="text-xs font-semibold text-[#1C1B18]">{dev.device}</div>
                  <div className="font-serif-display text-xl text-[#1C1B18]">{dev.percentage}%</div>
                  {dev.count !== undefined && (
                    <div className="text-2xs font-mono-code text-[#6B665E]">{dev.count} users</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B665E] mb-2">
              Traffic Channels / Referrers
            </h4>
            <div className="space-y-2">
              {analytics.trafficSources.map((src, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[#1C1B18] font-medium">{src.name}</span>
                  <div className="flex items-center gap-3 font-mono-code">
                    <span className="text-[#6B665E]">{src.count.toLocaleString()}</span>
                    <span className="w-10 text-right font-bold text-[#1C1B18]">{src.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY LOG TIMELINE */}
      <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
              Real-time Click Log
            </h3>
            <p className="text-xs text-[#6B665E]">
              Live stream of visitor interactions captured in link_clicks_log.
            </p>
          </div>
          <Clock className="w-4 h-4 text-[#6B665E]" />
        </div>

        <div className="divide-y divide-[#E8E4D9] border border-[#E8E4D9] rounded-xl overflow-hidden">
          {clickLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-white hover:bg-[#FAF8F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#C85A32] shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-[#1C1B18] truncate">{log.linkTitle}</div>
                  <div className="text-2xs font-mono-code text-[#6B665E]">
                    Link ID: {log.linkId}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 font-mono-code text-xs">
                <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded text-[#1C1B18]">
                  {log.referrer}
                </span>
                <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded text-[#6B665E]">
                  {log.deviceType}
                </span>
                <span className="text-[#6B665E] min-w-[70px] text-right">
                  {formatTimeAgo(log.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
