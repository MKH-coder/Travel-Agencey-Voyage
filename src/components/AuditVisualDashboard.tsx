import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ShieldAlert, Activity, CheckCircle2, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { AuditLog } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface AuditVisualDashboardProps {
  logs: AuditLog[];
}

const ACTION_COLORS: Record<string, string> = {
  ADMIN_LOGIN: '#3b82f6',
  BYPASS_EVENT: '#f59e0b',
  CONTENT_MUTATION: '#10b981',
  DELETION: '#ef4444',
  ROLE_CHANGE: '#8b5cf6',
  OTHER: '#64748b'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export const AuditVisualDashboard: React.FC<AuditVisualDashboardProps> = ({ logs }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark-slate' || theme === 'crimson-black';

  // Color tokens based on dark/light mode
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#475569' : '#cbd5e1';

  // 1. Calculate Metrics Summary
  const metrics = useMemo(() => {
    const total = logs.length;
    let bypassCount = 0;
    let contentMutations = 0;
    let deletions = 0;
    const uniqueActors = new Set<string>();

    logs.forEach(log => {
      const act = log.action.toUpperCase();
      if (log.performedBy || log.performedByEmail) {
        uniqueActors.add(log.performedByEmail || log.performedBy);
      }
      if (act.includes('BYPASS') || act.includes('RATE_LIMIT') || act.includes('SECURITY')) {
        bypassCount++;
      }
      if (act.includes('CREATE') || act.includes('UPDATE') || act.includes('APPROVE') || act.includes('PUBLISH')) {
        contentMutations++;
      }
      if (act.includes('DELETE')) {
        deletions++;
      }
    });

    return {
      total,
      bypassCount,
      contentMutations,
      deletions,
      uniqueActorsCount: uniqueActors.size
    };
  }, [logs]);

  // 2. Aggregate Frequency Over Time (Timeline Data)
  const timelineData = useMemo(() => {
    if (logs.length === 0) return [];
    const dateCounts: Record<string, { date: string; total: number; securityEvents: number; contentActions: number }> = {};

    // Sort logs chronologically
    const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sorted.forEach(log => {
      const d = new Date(log.timestamp);
      const dateKey = isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateCounts[dateKey]) {
        dateCounts[dateKey] = { date: dateKey, total: 0, securityEvents: 0, contentActions: 0 };
      }
      dateCounts[dateKey].total += 1;
      const act = log.action.toUpperCase();
      if (act.includes('BYPASS') || act.includes('RATE_LIMIT')) {
        dateCounts[dateKey].securityEvents += 1;
      } else {
        dateCounts[dateKey].contentActions += 1;
      }
    });

    return Object.values(dateCounts);
  }, [logs]);

  // 3. Aggregate Action Type Distribution
  const actionTypeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    logs.forEach(log => {
      let category = 'Other Actions';
      const act = log.action.toUpperCase();
      if (act.includes('LOGIN') || act.includes('AUTH')) category = 'Admin Logins';
      else if (act.includes('BYPASS') || act.includes('SECURITY')) category = 'Bypass & Emergency';
      else if (act.includes('CREATE') || act.includes('PUBLISH')) category = 'Content Created';
      else if (act.includes('APPROVE') || act.includes('REJECT')) category = 'Queue Review';
      else if (act.includes('DELETE')) category = 'Deletions';
      else if (act.includes('ROLE') || act.includes('USER')) category = 'User & Role Edits';
      else if (act.includes('RATE_LIMIT')) category = 'Rate Limit Events';

      typeMap[category] = (typeMap[category] || 0) + 1;
    });

    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [logs]);

  // 4. Top Admin Actors Data
  const topActorsData = useMemo(() => {
    const actorMap: Record<string, number> = {};
    logs.forEach(log => {
      const actor = log.performedByEmail || log.performedBy || 'Unknown';
      const shortName = actor.includes('@') ? actor.split('@')[0] : actor;
      actorMap[shortName] = (actorMap[shortName] || 0) + 1;
    });

    return Object.entries(actorMap)
      .map(([actor, count]) => ({ actor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Actions</div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{metrics.total}</div>
            <div className="text-[10px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Recorded in trail
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security & Bypass</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{metrics.bypassCount}</div>
            <div className="text-[10px] text-amber-500 font-medium mt-0.5 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Elevated events
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Content Mutations</div>
            <div className="text-2xl font-black text-emerald-500 mt-1">{metrics.contentMutations}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Updates & Approvals
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Admin Users</div>
            <div className="text-2xl font-black text-indigo-500 mt-1">{metrics.uniqueActorsCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Unique log actors
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Security Warning Banner if High Bypass Count */}
      {metrics.bypassCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">Security Pattern Alert:</span> {metrics.bypassCount} elevated emergency bypass or security action(s) detected. Review logs below for unusual IP sources or unauthorized role escalations.
          </div>
        </div>
      )}

      {/* Recharts Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Activity Frequency Over Time */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Action Frequency Timeline</h4>
              <p className="text-[11px] text-slate-400">Volume of audit events over time to spot activity spikes</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: textColor }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Area type="monotone" dataKey="total" name="Total Actions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="securityEvents" name="Security / Bypass" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSec)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Action Type Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Audit Action Distribution</h4>
              <p className="text-[11px] text-slate-400">Proportional breakdown by administrative event type</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {actionTypeData.length === 0 ? (
              <div className="text-xs text-slate-400">No action data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {actionTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Top Admin Actions by User */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Top Admin Actors Activity Volume</h4>
              <p className="text-[11px] text-slate-400">Identifies highest-volume admin accounts to verify normal operation</p>
            </div>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topActorsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="actor" tick={{ fontSize: 11, fill: textColor }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                />
                <Bar dataKey="count" name="Logged Actions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
