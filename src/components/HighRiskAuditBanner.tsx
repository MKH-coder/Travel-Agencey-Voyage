import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, Eye, X, ChevronRight, Sliders } from 'lucide-react';
import { AuditLog, RiskThresholdConfig } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { DEFAULT_RISK_THRESHOLDS } from './RiskThresholdConfigModal.tsx';

interface HighRiskAuditBannerProps {
  logs: AuditLog[];
  onViewAuditTrail: () => void;
  thresholdConfig?: RiskThresholdConfig;
  onConfigureThresholds?: () => void;
}

export const HighRiskAuditBanner: React.FC<HighRiskAuditBannerProps> = ({
  logs,
  onViewAuditTrail,
  thresholdConfig = DEFAULT_RISK_THRESHOLDS,
  onConfigureThresholds,
}) => {
  const { styles } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Identify high-risk logs based on active threshold configuration
  const highRiskLogs = useMemo(() => {
    return logs.filter((log) => {
      const act = (log.action || '').toUpperCase();

      const matchesBypass = thresholdConfig.BYPASS_EVENTS && (act.includes('BYPASS') || act.includes('SECURITY'));
      const matchesRateLimit = thresholdConfig.RATE_LIMIT_EVENTS && (act.includes('RATE_LIMIT') || act.includes('BLOCKED'));
      const matchesDeletions = thresholdConfig.CONTENT_DELETIONS && act.includes('DELETE');
      const matchesRole = thresholdConfig.ROLE_MODIFICATIONS && (act.includes('ROLE') || act.includes('DEMOTE') || act.includes('USER_ADD'));
      const matches2FA = thresholdConfig.SECURITY_2FA_CHANGES && act.includes('2FA');
      const matchesCreation = thresholdConfig.CONTENT_CREATIONS && (act.includes('CREATE') || act.includes('PUBLISH') || act.includes('APPROVE'));
      const matchesLogins = thresholdConfig.ADMIN_LOGINS && (act.includes('LOGIN') || act.includes('AUTH'));

      return matchesBypass || matchesRateLimit || matchesDeletions || matchesRole || matches2FA || matchesCreation || matchesLogins;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, thresholdConfig]);

  if (dismissed || highRiskLogs.length === 0) {
    return null;
  }

  const latestEvent = highRiskLogs[0];

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900/90 via-amber-900/80 to-slate-900 border border-rose-500/40 p-4 sm:p-5 shadow-xl text-white transition-all animate-in fade-in slide-in-from-top-2">
        {/* Decorative Background Accent */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white uppercase tracking-wider">
                  SECURITY ALERT
                </span>
                <span className="text-xs font-bold text-rose-200">
                  {highRiskLogs.length} High-Risk Administrative Action{highRiskLogs.length > 1 ? 's' : ''} Flagged
                </span>
              </div>

              <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                Latest event: <span className="font-bold text-rose-300">{latestEvent.action}</span> performed by{' '}
                <strong className="text-white">{latestEvent.performedByEmail || latestEvent.performedBy}</strong> on{' '}
                <span className="font-mono text-slate-300">{new Date(latestEvent.timestamp).toLocaleTimeString()}</span>{' '}
                (Target: <span className="font-mono text-amber-300">{latestEvent.targetId || 'SYSTEM'}</span>, IP: <span className="font-mono text-slate-300">{latestEvent.ipAddress}</span>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {onConfigureThresholds && (
              <button
                id="high-risk-threshold-config-btn"
                type="button"
                onClick={onConfigureThresholds}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 transition-all flex items-center gap-1.5"
                title="Configure custom alert risk thresholds"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Thresholds</span>
              </button>
            )}

            <button
              id="high-risk-inspect-btn"
              type="button"
              onClick={() => setSelectedLog(latestEvent)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Event</span>
            </button>

            <button
              id="high-risk-view-trail-btn"
              type="button"
              onClick={onViewAuditTrail}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Dismiss banner alert for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* High Risk Event Deep Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
              <div className="flex items-center gap-2 text-rose-500">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  High-Risk Audit Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-200 font-bold text-sm px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>This action is classified as elevated risk due to administrative state changes or security bypasses.</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Action Code</div>
                  <div className="text-rose-500 font-bold">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Timestamp</div>
                  <div className="text-slate-700 dark:text-slate-200">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Admin Actor</div>
                  <div className="text-slate-700 dark:text-slate-200">{selectedLog.performedByEmail || selectedLog.performedBy}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Target ID</div>
                  <div className="text-amber-500 font-bold">{selectedLog.targetId || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Client IP Source</div>
                  <div className="text-slate-700 dark:text-slate-200">{selectedLog.ipAddress || '127.0.0.1'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Target Type</div>
                  <div className="text-slate-700 dark:text-slate-200">{selectedLog.targetType || 'SYSTEM'}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Event Payload Details
                </div>
                <pre className="p-3 rounded-2xl bg-slate-900 text-rose-400 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-40">
                  {selectedLog.details ? JSON.stringify(selectedLog.details, null, 2) : '// No detail payload attached'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedLog(null);
                  onViewAuditTrail();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors flex items-center gap-1.5"
              >
                <span>Jump to Audit Log Trail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
