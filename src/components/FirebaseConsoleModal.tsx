import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Cloud, 
  Server, 
  ShieldCheck, 
  Layers, 
  Users, 
  Briefcase, 
  Activity,
  ArrowUpRight,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { 
  FirebaseSyncService, 
  FIREBASE_PROJECT_ID, 
  FIRESTORE_DATABASE_ID, 
  FIREBASE_CONSOLE_URL 
} from '../services/firebase.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { Listing, User, CustomPost, AuditLog } from '../types.ts';

interface FirebaseConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted?: () => void;
}

export const FirebaseConsoleModal: React.FC<FirebaseConsoleModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted
}) => {
  const { styles } = useTheme();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CUSTOM_POSTS' | 'USERS' | 'LISTINGS' | 'LOGS'>('OVERVIEW');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    online: boolean;
    latencyMs?: number;
    message?: string;
  }>({ tested: false, online: true });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    counts?: { listings: number; users: number; customPosts: number; auditLogs: number };
  } | null>(null);

  const [customPosts, setCustomPosts] = useState<CustomPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLocalData();
      handleTestConnection();
    }
  }, [isOpen]);

  const loadLocalData = () => {
    setCustomPosts(ClientStorageManager.getCustomPosts());
    setUsers(ClientStorageManager.getUsers());
    setListings(ClientStorageManager.getListings());
    setLogs(ClientStorageManager.getAuditLogs());
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await FirebaseSyncService.testConnection();
      setConnectionStatus({
        tested: true,
        online: res.success,
        latencyMs: res.latencyMs,
        message: res.message
      });
    } catch (err: unknown) {
      setConnectionStatus({
        tested: true,
        online: false,
        message: err instanceof Error ? err.message : 'Connection failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleBulkSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const payload = {
        listings: ClientStorageManager.getListings(),
        users: ClientStorageManager.getUsers(),
        customPosts: ClientStorageManager.getCustomPosts(),
        auditLogs: ClientStorageManager.getAuditLogs()
      };

      const res = await FirebaseSyncService.bulkSyncAllToFirestore(payload);
      if (res.success) {
        setSyncResult({
          success: true,
          message: `Successfully pushed all collections to Cloud Firestore!`,
          counts: res.syncedCounts
        });
        if (onSyncCompleted) onSyncCompleted();
      } else {
        setSyncResult({
          success: false,
          message: `Sync partially completed or throttled: ${res.error || 'Check permissions'}`
        });
      }
    } catch (err: unknown) {
      setSyncResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to synchronize with Firebase.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const data = {
      firebaseProject: FIREBASE_PROJECT_ID,
      firestoreDatabaseId: FIRESTORE_DATABASE_ID,
      exportedAt: new Date().toISOString(),
      customPosts,
      users,
      listings,
      auditLogs: logs.slice(0, 100)
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-database-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(FIREBASE_PROJECT_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className={`w-full max-w-4xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-5 sm:p-7 relative space-y-5 max-h-[92vh] overflow-y-auto flex flex-col`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-sm">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-bold ${styles.textPrimary}`}>
                  Firebase Cloud Database Console
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Connected
                </span>
              </div>
              <p className={`text-xs ${styles.textMuted} mt-0.5`}>
                Manage Cloud Firestore collections, seed initial database tables, and trigger live cloud synchronization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={FIREBASE_CONSOLE_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Open Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Project Credentials Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Firebase Project ID</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-amber-400">{FIREBASE_PROJECT_ID}</span>
              <button 
                onClick={handleCopyProjectId}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Copy Project ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Firestore Database</div>
            <div className="text-xs font-mono text-sky-400 truncate mt-1" title={FIRESTORE_DATABASE_ID}>
              {FIRESTORE_DATABASE_ID}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Connection & Ping</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold ${connectionStatus.online ? 'text-emerald-400' : 'text-rose-400'}`}>
                {connectionStatus.latencyMs !== undefined ? `${connectionStatus.latencyMs}ms latency` : 'Active (Dual Mode)'}
              </span>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sync Controls and Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Posts</div>
              <div className="text-xl font-bold text-amber-400">{customPosts.length}</div>
            </div>
            <Briefcase className="w-5 h-5 text-amber-500/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Users & Admins</div>
              <div className="text-xl font-bold text-sky-400">{users.length}</div>
            </div>
            <Users className="w-5 h-5 text-sky-500/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travel Listings</div>
              <div className="text-xl font-bold text-emerald-400">{listings.length}</div>
            </div>
            <Layers className="w-5 h-5 text-emerald-500/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Trail</div>
              <div className="text-xl font-bold text-purple-400">{logs.length}</div>
            </div>
            <ShieldCheck className="w-5 h-5 text-purple-500/50" />
          </div>
        </div>

        {/* Sync Status Feedback */}
        {syncResult && (
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
            syncResult.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center gap-2.5">
              {syncResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
              <div>
                <div className="text-xs font-bold">{syncResult.message}</div>
                {syncResult.counts && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Synced: {syncResult.counts.customPosts} Custom Posts, {syncResult.counts.users} Users, {syncResult.counts.listings} Listings, {syncResult.counts.auditLogs} Logs.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'OVERVIEW', label: 'Cloud Architecture' },
              { id: 'CUSTOM_POSTS', label: `Custom Posts (${customPosts.length})` },
              { id: 'USERS', label: `Users (${users.length})` },
              { id: 'LISTINGS', label: `Listings (${listings.length})` },
              { id: 'LOGS', label: 'Audit Logs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleBulkSync}
              disabled={isSyncing}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold ${styles.buttonPrimary} shadow-md flex items-center gap-1.5`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Syncing to Firestore...' : 'Sync Database to Firebase'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-[260px] max-h-[380px] overflow-y-auto space-y-3">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  <span>Firestore Collections Map (Rules Version 2 Deployed)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="font-mono font-bold text-amber-300">/custom_posts/{'{postId}'}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Stores custom post privilege templates with granular permissions and badge styling.
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="font-mono font-bold text-sky-300">/users/{'{userId}'}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Stores user profiles, administrative role tiers, custom titles, and MFA credentials.
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="font-mono font-bold text-emerald-300">/listings/{'{listingId}'}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Travel destinations, luxury hotels, and culinary spots with verification workflow states.
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="font-mono font-bold text-purple-300">/audit_logs/{'{logId}'}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Append-only immutable security audit trails, logins, role edits, and bypass events.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-400">Security Rules & Super Admin Access</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Security rules on Firestore protect collections with role-based access control. As Technical Super Admin (<span className="text-amber-300 font-mono">mukundkrishna2008@gmail.com</span>), you have full root authorization to publish, moderate, seed, and manage all documents across both web and cloud environments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CUSTOM_POSTS' && (
            <div className="space-y-2">
              {customPosts.map(post => (
                <div key={post.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{post.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {post.department}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{post.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.privileges?.map(priv => (
                        <span key={priv} className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                          {priv}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{post.id}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'USERS' && (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.uid} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-bold text-slate-200">{u.name} <span className="font-mono text-slate-400">({u.email})</span></div>
                      <div className="text-[11px] text-amber-400 font-semibold">{u.customTitle || u.role} • {u.department || 'General'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'LISTINGS' && (
            <div className="space-y-2">
              {listings.slice(0, 15).map(l => (
                <div key={l.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={l.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-slate-200">{l.title}</div>
                      <div className="text-[11px] text-slate-400">{l.location}, {l.country} • ${l.price} / night</div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    l.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'LOGS' && (
            <div className="space-y-2">
              {logs.slice(0, 15).map(log => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-amber-400">{log.action}</div>
                    <div className="text-[11px] text-slate-400">By: {log.performedBy} • Target: {log.targetId}</div>
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual-Mode active: Cloud Firestore + Offline/Static local cache synchronization.</span>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
