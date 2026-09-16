import React, { useState, useEffect, useRef } from 'react';
import { Database, RefreshCw, CloudOff, CheckCircle2, AlertTriangle, ExternalLink, Zap, Wifi, WifiOff } from 'lucide-react';
import { SupabaseSyncService, SupabaseSyncState, SUPABASE_URL } from '../services/supabaseSync.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface SupabaseSyncIndicatorProps {
  onOpenSupabaseConsole?: () => void;
}

export const SupabaseSyncIndicator: React.FC<SupabaseSyncIndicatorProps> = ({ onOpenSupabaseConsole }) => {
  const { styles } = useTheme();
  const { user } = useAuth();
  const [syncState, setSyncState] = useState<SupabaseSyncState>(() => SupabaseSyncService.getSyncState());
  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Subscribe to live Supabase sync updates
  useEffect(() => {
    const unsubscribe = SupabaseSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  // Periodic health check every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      SupabaseSyncService.testConnection();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await SupabaseSyncService.testConnection();
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
    switch (syncState.status) {
      case 'syncing':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Syncing...</span>
            <span className="sm:hidden">Sync</span>
          </div>
        );
      case 'synced':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Supabase Synced</span>
            <span className="sm:hidden">Synced</span>
            {syncState.latencyMs !== null && (
              <span className="hidden lg:inline text-[10px] opacity-75 font-mono ml-0.5">
                {syncState.latencyMs}ms
              </span>
            )}
          </div>
        );
      case 'offline':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold shadow-xs">
            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
            <span className="hidden sm:inline">Supabase Offline</span>
            <span className="sm:hidden">Offline</span>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        id="supabase-sync-status-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
        title={`Supabase Status: ${syncState.status.toUpperCase()} (${syncState.message}) - Click for details`}
        aria-label="Supabase Synchronization Status"
      >
        {getStatusBadge()}
      </button>

      {isOpen && (
        <div
          id="supabase-sync-popover"
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border ${styles.border} ${styles.cardBg} p-4 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${syncState.status === 'synced' ? 'bg-emerald-500/10 text-emerald-500' : syncState.status === 'syncing' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold ${styles.textPrimary} tracking-tight`}>
                  Supabase Real-Time Sync
                </h4>
                <p className={`text-[10px] ${styles.textMuted}`}>
                  PostgreSQL Data Layer
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                syncState.status === 'synced'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : syncState.status === 'syncing'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {syncState.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="py-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800">
              <span className={`text-[11px] ${styles.textMuted} flex items-center gap-1.5`}>
                <Wifi className="w-3.5 h-3.5 text-sky-500" />
                Connection Latency
              </span>
              <span className={`font-mono font-bold ${syncState.latencyMs && syncState.latencyMs < 150 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {syncState.latencyMs !== null ? `${syncState.latencyMs} ms` : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800">
              <span className={`text-[11px] ${styles.textMuted} flex items-center gap-1.5`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Last Synchronized
              </span>
              <span className={`font-mono text-[11px] font-semibold ${styles.textPrimary}`}>
                {syncState.lastSyncedAt
                  ? syncState.lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : 'Never'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium uppercase tracking-wider text-slate-400`}>
                  Status Message
                </span>
                {syncState.activeOperations > 0 && (
                  <span className="text-[10px] font-mono text-amber-500 font-bold">
                    {syncState.activeOperations} active op(s)
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-medium leading-tight ${styles.textPrimary}`}>
                {syncState.message}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {SUPABASE_URL}
            </div>
          </div>

          {/* Test results banner */}
          {testResult && (
            <div className={`mb-3 p-2 rounded-xl text-xs font-medium flex items-start gap-2 ${testResult.success ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
              {testResult.success ? <Zap className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="text-[11px] leading-tight">{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <button
              id="test-supabase-connection-btn"
              onClick={handleTestConnection}
              disabled={isTesting}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isTesting
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : `${styles.accent} text-white hover:opacity-90 shadow-sm active:scale-95`
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing Link...' : 'Test Connection'}
            </button>

            {onOpenSupabaseConsole && (user?.role === 'ADMIN' || user?.role === 'TECH_SUBADMIN' || user?.role === 'TECH_ADMIN') && (
              <button
                id="open-supabase-console-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSupabaseConsole();
                }}
                className={`py-2 px-3 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:opacity-90 transition-all text-xs font-semibold flex items-center gap-1.5`}
                title="Open Supabase Cloud Database Console"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                Console
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
