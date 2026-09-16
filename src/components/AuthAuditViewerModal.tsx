import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Smartphone,
  Monitor
} from 'lucide-react';
import { AuthAudit } from '../services/authAudit.ts';
import { AuthAuditLogEntry, AuthFailureCategory } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface AuthAuditViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthAuditViewerModal: React.FC<AuthAuditViewerModalProps> = ({ isOpen, onClose }) => {
  const { styles } = useTheme();
  const [logs, setLogs] = useState<AuthAuditLogEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = () => {
    setLogs(AuthAudit.getLogs());
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
      const unsubscribe = AuthAudit.subscribe(() => {
        loadLogs();
      });
      return unsubscribe;
    }
  }, [isOpen]);

  const filteredLogs = useMemo(() => {
    if (categoryFilter === 'ALL') return logs;
    if (categoryFilter === 'FAILURES') return logs.filter((l) => l.status === 'FAILURE');
    if (categoryFilter === 'SUCCESSES') return logs.filter((l) => l.status === 'SUCCESS');
    return logs.filter((l) => l.failureCategory === categoryFilter);
  }, [logs, categoryFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const failures = logs.filter((l) => l.status === 'FAILURE').length;
    const successes = logs.filter((l) => l.status === 'SUCCESS').length;
    const popupBlocked = logs.filter((l) => l.failureCategory === 'POPUP_BLOCKED').length;
    const unauthorizedDomain = logs.filter((l) => l.failureCategory === 'UNAUTHORIZED_DOMAIN').length;
    return { total, failures, successes, popupBlocked, unauthorizedDomain };
  }, [logs]);

  const handleCopyJson = (log: AuthAuditLogEntry) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateToast = (type: 'popup_blocked' | 'unauthorized_domain' | 'popup_closed') => {
    if (type === 'popup_blocked') {
      AuthAudit.logOAuthFailure({
        provider: 'google',
        action: 'OAUTH_POPUP',
        error: { code: 'auth/popup-blocked', message: 'Popup blocked by browser security policy' },
        email: 'traveler@example.com',
        showToast: true,
      });
    } else if (type === 'unauthorized_domain') {
      AuthAudit.logOAuthFailure({
        provider: 'google',
        action: 'OAUTH_POPUP',
        error: { code: 'auth/unauthorized-domain', message: 'Domain is not in authorized domains list' },
        email: 'mukundkrishna.h2008@gmail.com',
        showToast: true,
      });
    } else {
      AuthAudit.logOAuthFailure({
        provider: 'google',
        action: 'OAUTH_POPUP',
        error: { code: 'auth/popup-closed-by-user', message: 'The user closed the popup window' },
        showToast: true,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${styles.textPrimary} flex items-center gap-2`}>
                <span>Client-Side AuthAudit Diagnostic Logs</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Real-time
                </span>
              </h3>
              <p className={`text-xs ${styles.textMuted}`}>
                Audits client-side OAuth popups, browser security restrictions, and sign-in diagnostics.
              </p>
            </div>
          </div>

          <button
            id="close-auth-audit-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Overview Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events</div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Auth Failures</div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{stats.failures}</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pop-ups Blocked</div>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{stats.popupBlocked}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Successes</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.successes}</div>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            {['ALL', 'FAILURES', 'SUCCESSES', 'POPUP_BLOCKED', 'UNAUTHORIZED_DOMAIN'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-xl font-semibold text-[11px] whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              id="export-auth-logs-btn"
              onClick={() => AuthAudit.downloadLogs()}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              type="button"
              id="clear-auth-logs-btn"
              onClick={() => {
                AuthAudit.clearLogs();
                loadLogs();
              }}
              className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Test Toast Trigger Simulation Pills */}
        <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-300 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Toast Notification:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSimulateToast('popup_blocked')}
              className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-200 hover:bg-amber-500/30 font-semibold text-[10px]"
            >
              Pop-up Blocked Toast
            </button>
            <button
              type="button"
              onClick={() => handleSimulateToast('unauthorized_domain')}
              className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-800 dark:text-rose-200 hover:bg-rose-500/30 font-semibold text-[10px]"
            >
              Unauthorized Domain Toast
            </button>
            <button
              type="button"
              onClick={() => handleSimulateToast('popup_closed')}
              className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 font-semibold text-[10px]"
            >
              Cancelled Toast
            </button>
          </div>
        </div>

        {/* Logs List View */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {filteredLogs.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
              <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">No matching auth logs found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Authentication errors or successful Google logins will be recorded here automatically.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isFailure = log.status === 'FAILURE';
              const isCancelled = log.status === 'CANCELLED';
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isFailure
                      ? 'bg-rose-500/5 border-rose-500/20 dark:border-rose-500/30'
                      : isCancelled
                      ? 'bg-amber-500/5 border-amber-500/20 dark:border-amber-500/30'
                      : 'bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {isFailure ? (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      ) : isCancelled ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              isFailure
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                : isCancelled
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {log.status}
                          </span>

                          {log.failureCategory && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {log.failureCategory}
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 break-words">
                          {log.errorMessage || `${log.provider.toUpperCase()} Sign-In completed successfully`}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>Action: <strong className="text-slate-700 dark:text-slate-300">{log.action}</strong></span>
                          {log.errorCode && (
                            <span>Code: <code className="text-rose-500 font-mono">{log.errorCode}</code></span>
                          )}
                          {log.email && <span>Email: {log.email}</span>}
                          {log.environment?.hostname && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span>{log.environment.hostname}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyJson(log)}
                        title="Copy log entry JSON"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="text-[10px] font-semibold text-sky-500 hover:underline px-1.5 py-1"
                      >
                        {isExpanded ? 'Hide Details' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded JSON inspection */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 animate-in fade-in">
                      <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
