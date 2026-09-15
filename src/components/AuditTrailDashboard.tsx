import React, { useState, useMemo } from 'react';
import { ScrollText, ShieldCheck, ShieldAlert, Key, AlertTriangle, CheckCircle2, XCircle, Search, Filter, Download, Eye, Calendar, Clock, Terminal, KeyRound, Check, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { ClientStorageManager } from '../services/clientStorage.ts';

interface AuditTrailDashboardProps {
  logs: AuditLog[];
  onRefresh?: () => void;
}

export const AuditTrailDashboard: React.FC<AuditTrailDashboardProps> = ({ logs, onRefresh }) => {
  const { styles } = useTheme();
  const [filterType, setFilterType] = useState<'ALL' | '2FA' | 'BYPASS' | 'RECOVERY' | 'BLOCKS' | 'ROLES' | 'RESETS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Simulation form states
  const [simulationActor, setSimulationActor] = useState('mukundkrishna.h@gmail.com');
  const [simulationTarget, setSimulationTarget] = useState('user-sub-003@travelplatform.io');
  const [simulationOutcome, setSimulationOutcome] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState('');
  const [simSuccess, setSimSuccess] = useState(false);

  // Filter security logs chronologically
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        const act = (log.action || '').toUpperCase();

        // Category filter
        if (filterType === '2FA') {
          if (!act.includes('2FA') && !act.includes('MFA')) return false;
        } else if (filterType === 'BYPASS') {
          if (!act.includes('BYPASS') && !act.includes('OVERRIDE')) return false;
        } else if (filterType === 'RESETS') {
          const isResetEvent = 
            act.includes('RESET') || 
            act.includes('PASSWORD_UPDATE') || 
            act.includes('PASSWORD_CHANGE') ||
            act.includes('CREDENTIAL_CHANGE');
          if (!isResetEvent) return false;
        } else if (filterType === 'RECOVERY') {
          // Captures SuperAdmin emergency bypasses & SubAdmin password bypasses
          const isRecoveryAttempt = 
            act.includes('EMERGENCY') || 
            act.includes('RECOVERY') || 
            act.includes('SECRET_BYPASS') || 
            act.includes('SUBADMIN_BYPASS') || 
            act.includes('SUBADMIN_PASSWORD') || 
            act.includes('BYPASS_ACTIVATED') || 
            act.includes('BYPASS_FAILED');
          if (!isRecoveryAttempt) return false;
        } else if (filterType === 'BLOCKS') {
          if (!act.includes('BLOCK') && !act.includes('RATE_LIMIT') && !act.includes('FAILED')) return false;
        } else if (filterType === 'ROLES') {
          if (!act.includes('ROLE') && !act.includes('USER_ADD') && !act.includes('DEMOTE')) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchAction = act.toLowerCase().includes(q);
          const matchActor = (log.performedByEmail || log.performedBy || '').toLowerCase().includes(q);
          const matchTarget = (log.targetId || '').toLowerCase().includes(q);
          const matchIp = (log.ipAddress || '').toLowerCase().includes(q);
          return matchAction || matchActor || matchTarget || matchIp;
        }

        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, filterType, searchQuery]);

  // Compute password reset metrics to track frequency & outcomes
  const resetStats = useMemo(() => {
    const resetLogs = logs.filter((log) => {
      const act = (log.action || '').toUpperCase();
      return act.includes('RESET') || act.includes('PASSWORD_UPDATE') || act.includes('PASSWORD_CHANGE');
    });

    const total = resetLogs.length;
    const successes = resetLogs.filter(l => !l.action.toUpperCase().includes('FAILED') && !l.action.toUpperCase().includes('BLOCKED')).length;
    const failures = total - successes;
    
    const subAdminResets = resetLogs.filter(l => {
      const actor = (l.performedByEmail || l.performedBy || '').toLowerCase();
      const isSubAdmin = actor.includes('subadmin') || actor.includes('8c15mukund') || (l.details && (l.details as any).role === 'SUBADMIN');
      return isSubAdmin;
    }).length;

    return {
      total,
      successes,
      failures,
      subAdminResets,
      successRate: total > 0 ? Math.round((successes / total) * 100) : 0
    };
  }, [logs]);

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('BYPASS') || act.includes('SECURITY_ALERT') || act.includes('BLOCK')) {
      return {
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />,
        status: 'HIGH RISK / BLOCKED',
        statusColor: 'bg-rose-500/20 text-rose-500',
      };
    } else if (act.includes('RESET') || act.includes('PASSWORD')) {
      const isFailed = act.includes('FAILED') || act.includes('BLOCK');
      return {
        bg: isFailed ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        icon: <KeyRound className={`w-3.5 h-3.5 ${isFailed ? 'text-rose-500' : 'text-amber-500'}`} />,
        status: isFailed ? 'FAILED' : 'SUCCESS',
        statusColor: isFailed ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500',
      };
    } else if (act.includes('2FA') || act.includes('MFA')) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
        status: 'SUCCESS',
        statusColor: 'bg-emerald-500/20 text-emerald-500',
      };
    } else if (act.includes('ROLE') || act.includes('USER')) {
      return {
        bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
        icon: <Key className="w-3.5 h-3.5 text-purple-500" />,
        status: 'SUCCESS',
        statusColor: 'bg-purple-500/20 text-purple-500',
      };
    }
    return {
      bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      icon: <Terminal className="w-3.5 h-3.5 text-sky-500" />,
      status: 'SUCCESS',
      statusColor: 'bg-sky-500/20 text-sky-500',
    };
  };

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Action', 'Actor', 'Target ID', 'IP Address', 'Status'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.action,
      l.performedByEmail || l.performedBy,
      l.targetId || 'N/A',
      l.ipAddress || '127.0.0.1',
      l.action.includes('BLOCK') ? 'BLOCKED' : 'SUCCESS',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-6`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/30">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-extrabold text-base ${styles.textPrimary}`}>
              Security & 2FA Audit Trail Dashboard
            </h3>
            <p className={`text-xs ${styles.textMuted}`}>
              Chronological log of two-factor authentication events, emergency bypass activations, rate-limit blocks, and role changes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-audit-csv-btn"
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search security trail by action code, actor email, target ID, or IP..."
            className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Security Logs' },
            { id: '2FA', label: '2FA Events' },
            { id: 'RESETS', label: 'Password Resets' },
            { id: 'BYPASS', label: 'Bypass Attempts' },
            { id: 'RECOVERY', label: 'Recovery Attempts' },
            { id: 'BLOCKS', label: 'Security Blocks' },
            { id: 'ROLES', label: 'Role Changes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === tab.id
                  ? `${styles.accent} text-white shadow-md`
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Password Reset Specialized Analytics Panel */}
      {filterType === 'RESETS' && (
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Password Reset Analytics Desk
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Tracking frequency, dispatch sources, and completion outcomes of sub-admin password resets.
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-xl border ${styles.border} bg-white dark:bg-slate-950 text-center space-y-1`}>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Resets</span>
              <span className={`block text-xl font-mono font-extrabold ${styles.textPrimary}`}>{resetStats.total}</span>
              <span className="block text-[8px] text-slate-400">All registered attempts</span>
            </div>
            <div className={`p-3.5 rounded-xl border ${styles.border} bg-white dark:bg-slate-950 text-center space-y-1`}>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sub-Admin Dispatched</span>
              <span className="block text-xl font-mono font-extrabold text-amber-500">{resetStats.subAdminResets}</span>
              <span className="block text-[8px] text-slate-400">Initiated by Sub-Admins</span>
            </div>
            <div className={`p-3.5 rounded-xl border ${styles.border} bg-white dark:bg-slate-950 text-center space-y-1`}>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outcomes Breakdown</span>
              <span className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="text-emerald-500 font-extrabold">{resetStats.successes}</span> Pass /{' '}
                <span className="text-rose-500 font-extrabold">{resetStats.failures}</span> Fail
              </span>
              <span className="block text-[8px] text-slate-400">Succeeded vs Failed</span>
            </div>
            <div className={`p-3.5 rounded-xl border ${styles.border} bg-white dark:bg-slate-950 text-center space-y-1`}>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
              <span className={`block text-xl font-mono font-extrabold ${resetStats.successRate > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {resetStats.successRate}%
              </span>
              <span className="block text-[8px] text-slate-400">Overall reset success</span>
            </div>
          </div>

          {/* Interactive Simulation Sandbox */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Sandbox: Simulate Sub-Admin Password Reset Trigger
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">Simulate Tool</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sub-Admin Actor Email
                </label>
                <select
                  value={simulationActor}
                  onChange={(e) => setSimulationActor(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg outline-none ${styles.inputBg} border border-slate-200 dark:border-slate-800`}
                >
                  <option value="mukundkrishna.h@gmail.com">mukundkrishna.h@gmail.com (Sub-Admin)</option>
                  <option value="8c15mukundkrishna.h@gmail.com">8c15mukundkrishna.h@gmail.com (Sub-Admin)</option>
                  <option value="subadmin-finance@travelplatform.io">subadmin-finance@travelplatform.io (Sub-Admin)</option>
                  <option value="subadmin-ops@travelplatform.io">subadmin-ops@travelplatform.io (Sub-Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Target User Account
                </label>
                <input
                  type="text"
                  value={simulationTarget}
                  onChange={(e) => setSimulationTarget(e.target.value)}
                  placeholder="user-sub-003@travelplatform.io"
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg outline-none ${styles.inputBg} border border-slate-200 dark:border-slate-800`}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Simulated Reset Outcome
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulationOutcome('SUCCESS')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      simulationOutcome === 'SUCCESS'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SUCCESS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationOutcome('FAILED')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      simulationOutcome === 'FAILED'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    FAILED
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              {simError && (
                <div className="text-[10px] text-rose-500 font-medium">
                  ⚠️ {simError}
                </div>
              )}
              {simSuccess && (
                <div className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Simulation dispatched & updated in audit trail!
                </div>
              )}
              {!simError && !simSuccess && (
                <div className="text-[9px] text-slate-400 leading-tight">
                  This writes a genuine mock audit event to local storage and alerts the central dashboard.
                </div>
              )}

              <button
                type="button"
                onClick={async () => {
                  setSimError('');
                  setSimSuccess(false);
                  setIsSimulating(true);
                  try {
                    const activeToken = localStorage.getItem('travel_token');
                    const action = simulationOutcome === 'SUCCESS' ? 'SUBADMIN_PASSWORD_RESET_SUCCESS' : 'SUBADMIN_PASSWORD_RESET_FAILED';
                    
                    const detailsObj = {
                      performedByEmail: simulationActor,
                      role: 'SUBADMIN',
                      targetId: simulationTarget,
                      outcomeStatus: simulationOutcome,
                      completionTimeMs: Math.floor(Math.random() * 850) + 120,
                      simulated: true,
                      clientIp: '127.0.0.1'
                    };

                    let postedOk = false;
                    if (activeToken) {
                      const response = await fetch('/api/audit-logs', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${activeToken}`
                        },
                        body: JSON.stringify({
                          action,
                          targetId: simulationTarget,
                          targetType: 'USER_CREDENTIAL',
                          details: detailsObj
                        })
                      });
                      if (response.ok) {
                        postedOk = true;
                      }
                    }

                    if (!postedOk) {
                      // offline storage fallback
                      const dummyUid = 'sub-admin-101';
                      ClientStorageManager.addAuditLog({
                        action,
                        performedBy: dummyUid,
                        performedByEmail: simulationActor,
                        targetId: simulationTarget,
                        targetType: 'USER_CREDENTIAL',
                        ipAddress: '127.0.0.1',
                        details: detailsObj
                      });
                    }

                    setSimSuccess(true);
                    setTimeout(() => setSimSuccess(false), 4000);
                    if (onRefresh) {
                      onRefresh();
                    }
                  } catch (e: any) {
                    setSimError(e.message || 'Simulation error.');
                  } finally {
                    setIsSimulating(false);
                  }
                }}
                disabled={isSimulating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                {isSimulating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5" />
                )}
                <span>Dispatch Simulated Reset Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Timeline List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
            <p className="font-bold text-sm">No security audit logs match the current criteria.</p>
            <p className="text-xs">Try adjusting your search query or category filters.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const isBlocked = log.action.includes('BLOCK') || log.action.includes('BYPASS');

            return (
              <div
                key={log.id || `${log.timestamp}-${Math.random()}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isBlocked
                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-2xl border ${badge.bg} shrink-0 mt-0.5`}>
                    {badge.icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {log.action}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${badge.statusColor}`}>
                        {badge.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Actor: <strong className="text-slate-700 dark:text-slate-200">{log.performedByEmail || log.performedBy || 'System'}</strong></span>
                      <span>Target: <strong className="font-mono text-amber-500">{log.targetId || 'N/A'}</strong></span>
                      <span>IP: <strong className="font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition-colors"
                    title="Inspect log details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-sky-500" />
                <h3 className={`font-bold text-base ${styles.textPrimary}`}>
                  Audit Log Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-200 font-bold text-sm px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Action Code</span>
                  <span className="text-sky-500 font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Timestamp</span>
                  <span className="text-slate-700 dark:text-slate-200">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Actor</span>
                  <span className="text-slate-700 dark:text-slate-200">{selectedLog.performedByEmail || selectedLog.performedBy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Target ID</span>
                  <span className="text-amber-500">{selectedLog.targetId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">IP Source</span>
                  <span className="text-slate-700 dark:text-slate-200">{selectedLog.ipAddress || '127.0.0.1'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Target Type</span>
                  <span className="text-slate-700 dark:text-slate-200">{selectedLog.targetType || 'SYSTEM'}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold font-sans text-slate-400 uppercase tracking-wider block mb-1">
                  Attached Payload Details
                </span>
                <pre className="p-3 rounded-2xl bg-slate-900 text-emerald-400 text-[11px] overflow-x-auto border border-slate-800 max-h-40">
                  {selectedLog.details ? JSON.stringify(selectedLog.details, null, 2) : '// No detail payload attached'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.buttonPrimary}`}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
