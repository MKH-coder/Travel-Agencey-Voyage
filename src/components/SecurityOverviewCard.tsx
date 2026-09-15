import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShieldCheck, ShieldAlert, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface SecurityOverviewCardProps {
  users: User[];
}

export const SecurityOverviewCard: React.FC<SecurityOverviewCardProps> = ({ users }) => {
  const { styles, theme } = useTheme();
  const isDark = theme === 'dark-slate' || theme === 'crimson-black';

  const stats = useMemo(() => {
    const total = users.length;
    const mfaEnabled = users.filter((u) => u.mfaEnabled).length;
    const standard = total - mfaEnabled;
    const adoptionRate = total > 0 ? Math.round((mfaEnabled / total) * 100) : 0;

    // Check elevated accounts specifically
    const elevated = users.filter(
      (u) => u.role === 'ADMIN' || u.role === 'TECH_SUBADMIN' || u.role === 'TECH_ADMIN'
    );
    const elevatedProtected = elevated.filter((u) => u.mfaEnabled).length;
    const elevatedUnprotected = elevated.length - elevatedProtected;

    return {
      total,
      mfaEnabled,
      standard,
      adoptionRate,
      elevatedTotal: elevated.length,
      elevatedProtected,
      elevatedUnprotected,
    };
  }, [users]);

  // Data for Doughnut Chart
  const chartData = useMemo(() => {
    return [
      { name: '2FA Protected', value: stats.mfaEnabled },
      { name: 'Standard / No 2FA', value: stats.standard },
    ];
  }, [stats]);

  const COLORS = ['#10b981', '#64748b']; // Emerald for protected, neutral Slate for standard

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#475569' : '#cbd5e1';

  return (
    <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm flex flex-col justify-between h-full space-y-6`}>
      {/* Header section */}
      <div className="space-y-1.5 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-emerald-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h3 className={`font-extrabold text-xs uppercase tracking-wider ${styles.textPrimary}`}>
            Security Overview
          </h3>
        </div>
        <p className={`text-[10px] ${styles.textMuted} leading-normal`}>
          Interactive cryptographic check of overall MFA vs Standard credential ratio.
        </p>
      </div>

      {/* Recharts Doughnut Chart rendering */}
      <div className="relative h-44 w-full flex items-center justify-center">
        {stats.total === 0 ? (
          <div className="text-[11px] text-slate-400">No user data loaded.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Percentage HUD */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-xl font-mono font-black text-emerald-500">{stats.adoptionRate}%</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Adopted</span>
            </div>
          </>
        )}
      </div>

      {/* Legend & Ratio Hud */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Protected</span>
          </div>
          <span className="font-mono text-slate-800 dark:text-slate-200">{stats.mfaEnabled} accounts</span>
        </div>

        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">Standard / No 2FA</span>
          </div>
          <span className="font-mono text-slate-800 dark:text-slate-200">{stats.standard} accounts</span>
        </div>
      </div>

      {/* Sub-Metric Summary Bar */}
      <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/60 text-[10px] space-y-1">
        <div className="flex items-center justify-between font-bold text-slate-400 uppercase tracking-wider text-[8px]">
          <span>Elevated Roles Health</span>
          <span className={stats.elevatedUnprotected > 0 ? 'text-amber-500 font-extrabold' : 'text-emerald-500 font-extrabold'}>
            {stats.elevatedUnprotected > 0 ? 'Action Required' : 'Optimal'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Unprotected Admin Accounts:</span>
          <span className={`font-mono font-bold ${stats.elevatedUnprotected > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {stats.elevatedUnprotected}
          </span>
        </div>
      </div>
    </div>
  );
};
