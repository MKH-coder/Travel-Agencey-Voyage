import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, Download, FileJson, Calendar, ChevronLeft, ChevronRight, Eye, ShieldAlert, CheckCircle2, Info, Sliders } from 'lucide-react';
import { AuditLog } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { AuthAuditViewerModal } from './AuthAuditViewerModal.tsx';

interface AuditLogViewerProps {
  logs: AuditLog[];
  onRefresh: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  logFilter: string;
  onFilterChange: (filter: string) => void;
  onConfigureThresholds?: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  onRefresh,
  onExportCsv,
  onExportJson,
  logFilter,
  onFilterChange,
  onConfigureThresholds,
}) => {
  const { styles } = useTheme();

  // Search & Time Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected Log for Deep Inspection Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showAuthAuditModal, setShowAuthAuditModal] = useState(false);

  // Filter & Search Logic
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // 1. Time range filter
    const now = Date.now();
    if (timeRange === 'TODAY') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      result = result.filter(log => new Date(log.timestamp).getTime() >= todayStart.getTime());
    } else if (timeRange === 'WEEK') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(log => new Date(log.timestamp).getTime() >= weekAgo);
    } else if (timeRange === 'MONTH') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      result = result.filter(log => new Date(log.timestamp).getTime() >= monthAgo);
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(log => {
        const actionMatch = log.action.toLowerCase().includes(q);
        const actorMatch = (log.performedBy || '').toLowerCase().includes(q) || (log.performedByEmail || '').toLowerCase().includes(q);
        const targetMatch = (log.targetId || '').toLowerCase().includes(q) || (log.targetType || '').toLowerCase().includes(q);
        const ipMatch = (log.ipAddress || '').toLowerCase().includes(q);
        const detailsMatch = log.details ? JSON.stringify(log.details).toLowerCase().includes(q) : false;
        return actionMatch || actorMatch || targetMatch || ipMatch || detailsMatch;
      });
    }

    // 3. Sort order
    result.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return sortOrder === 'NEWEST' ? tB - tA : tA - tB;
    });

    return result;
  }, [logs, searchQuery, timeRange, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Control Bar */}
      <div className={`p-4 rounded-3xl border ${styles.border} ${styles.cardBg} space-y-3 shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="audit-log-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search audit trail by action, actor, target ID, IP, or payload details..."
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl outline-none ${styles.inputBg}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Filter & Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="audit-log-category-filter"
                value={logFilter}
                onChange={(e) => {
                  onFilterChange(e.target.value);
                  setCurrentPage(1);
                }}
                className={`py-2 px-3 text-xs rounded-xl font-medium outline-none cursor-pointer ${styles.inputBg}`}
              >
                <option value="ALL">All Event Types</option>
                <option value="TECH_ADMIN_LOGIN_SUCCESS">Admin Logins</option>
                <option value="EMERGENCY_BYPASS_ACTIVATED">Emergency Bypass</option>
                <option value="SUBMIT_PENDING_LISTING">Pending Submissions</option>
                <option value="APPROVE_LISTING">Listing Approvals</option>
                <option value="CREATE_AND_PUBLISH_LISTING">Listing Creation</option>
                <option value="DELETE_LISTING">Listing Deletions</option>
                <option value="UPDATE_USER_ROLE">Role Changes</option>
                <option value="ADD_NEW_USER_AND_POST">User Additions</option>
                <option value="RATE_LIMIT_BLOCKED">Rate Limit Blocks</option>
              </select>
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="audit-log-time-filter"
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value as any);
                  setCurrentPage(1);
                }}
                className={`py-2 px-3 text-xs rounded-xl font-medium outline-none cursor-pointer ${styles.inputBg}`}
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today Only</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>
            </div>

            <button
              onClick={onRefresh}
              className={`p-2 rounded-xl ${styles.buttonSecondary}`}
              title="Refresh Audit Logs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Export & Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredLogs.length}</span> of {logs.length} logged events
            {searchQuery && <span> matching "<span className="text-sky-500 font-semibold">{searchQuery}</span>"</span>}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Export Compliance Report:</span>
            <button
              id="audit-log-export-csv"
              type="button"
              onClick={onExportCsv}
              disabled={filteredLogs.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filteredLogs.length > 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                  : 'opacity-50 cursor-not-allowed border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              id="audit-log-export-json"
              type="button"
              onClick={onExportJson}
              disabled={filteredLogs.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filteredLogs.length > 0
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/30'
                  : 'opacity-50 cursor-not-allowed border border-slate-200 dark:border-slate-800'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            {onConfigureThresholds && (
              <button
                id="audit-log-configure-thresholds"
                type="button"
                onClick={onConfigureThresholds}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
                title="Configure custom alert risk thresholds for high-risk actions"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Risk Thresholds</span>
              </button>
            )}

            <button
              id="view-auth-audit-diagnostics-btn"
              type="button"
              onClick={() => setShowAuthAuditModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
              title="Inspect detailed client-side auth errors, OAuth popup restrictions, and debug logs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Auth Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Audit Logs Table */}
      <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 cursor-pointer hover:text-slate-600" onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}>
                  Timestamp {sortOrder === 'NEWEST' ? '↓' : '↑'}
                </th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Admin Actor</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800 font-mono text-[11px]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    No matching audit logs found for the selected search query and filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const act = log.action.toUpperCase();
                  const isHighRisk = act.includes('BYPASS') || act.includes('BLOCKED') || act.includes('DELETE');
                  const isSuccess = act.includes('APPROVE') || act.includes('CREATE') || act.includes('PUBLISH');

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()} <span className="text-[9px] opacity-70">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${
                            isHighRisk
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : isSuccess
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : act.includes('TECH_ADMIN')
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                          }`}
                        >
                          {isHighRisk && <ShieldAlert className="w-3 h-3 shrink-0" />}
                          {isSuccess && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                          <span>{log.action}</span>
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                        {log.performedByEmail || log.performedBy}
                      </td>
                      <td className="p-4 text-slate-400">
                        {log.targetId || '—'}
                      </td>
                      <td className="p-4 text-slate-400">
                        {log.ipAddress}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-sky-500 group-hover:text-white transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="text-slate-400">
              Page <span className="font-bold text-slate-700 dark:text-slate-200">{currentPage}</span> of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 ${
                  currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 ${
                  currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deep Log Detail Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`w-full max-w-xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-500">
                <Info className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  Audit Event Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Log ID</div>
                  <div className="text-slate-700 dark:text-slate-200 font-bold truncate">{selectedLog.id}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Timestamp</div>
                  <div className="text-slate-700 dark:text-slate-200">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Action</div>
                  <div className="text-sky-500 font-bold">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Performed By</div>
                  <div className="text-slate-700 dark:text-slate-200">{selectedLog.performedByEmail || selectedLog.performedBy}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Target Resource ID</div>
                  <div className="text-slate-700 dark:text-slate-200">{selectedLog.targetId || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans font-bold uppercase">Client IP Address</div>
                  <div className="text-slate-700 dark:text-slate-200">{selectedLog.ipAddress || '127.0.0.1'}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Action Detail Payload (JSON)
                </div>
                <pre className="p-3 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-48 leading-relaxed">
                  {selectedLog.details ? JSON.stringify(selectedLog.details, null, 2) : '// No additional details payload attached'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.buttonPrimary}`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client-Side Auth Audit Diagnostics Modal */}
      <AuthAuditViewerModal
        isOpen={showAuthAuditModal}
        onClose={() => setShowAuthAuditModal(false)}
      />
    </div>
  );
};
