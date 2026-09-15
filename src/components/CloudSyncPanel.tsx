import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  GitBranch, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Shield, 
  Database, 
  ExternalLink, 
  HardDrive, 
  KeyRound, 
  Play, 
  Terminal, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Check, 
  Eye, 
  EyeOff, 
  Server,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { FirebaseSyncService, FIREBASE_PROJECT_ID, FIRESTORE_DATABASE_ID } from '../services/firebase.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';

interface SyncStatusData {
  targetAccount: string;
  connectedAccount?: string;
  github: {
    configuredAccount: string;
    status: string;
    exportMethod: string;
    lastExportSnapshot: string;
    totalFilesTracked: number;
  };
  firebase: {
    configuredAccount: string;
    status: string;
    syncMode: string;
    collections: {
      listings: number;
      users: number;
      auditLogs: number;
      bookings: number;
    };
    lastSyncTimestamp: string;
  };
}

export const CloudSyncPanel: React.FC = () => {
  const { styles } = useTheme();
  const { token } = useAuth();

  // Local Sync and Export Status
  const [syncStatus, setSyncStatus] = useState<SyncStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  // Firebase Live Sync Checker States
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<{
    tested: boolean;
    online: boolean;
    latencyMs?: number;
    message?: string;
  }>({ tested: false, online: true });

  // Supabase Live Sync Connection States
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('voyage_supabase_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('voyage_supabase_anon_key') || '');
  const [supabaseTableName, setSupabaseTableName] = useState('listings');
  const [showKey, setShowKey] = useState(false);

  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isPushingSupabase, setIsPushingSupabase] = useState(false);
  const [isPullingSupabase, setIsPullingSupabase] = useState(false);
  const [showSqlBlueprint, setShowSqlBlueprint] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const [supabaseStatus, setSupabaseStatus] = useState<{
    tested: boolean;
    online: boolean;
    latencyMs?: number;
    message?: string;
    dataRows?: any[];
  }>({ tested: false, online: false });

  const fetchSyncStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cloud-sync/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      }
    } catch {
      // ignore fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    handleTestFirebase();
  }, [token]);

  // Persist credentials in LocalStorage dynamically
  useEffect(() => {
    localStorage.setItem('voyage_supabase_url', supabaseUrl);
  }, [supabaseUrl]);

  useEffect(() => {
    localStorage.setItem('voyage_supabase_anon_key', supabaseAnonKey);
  }, [supabaseAnonKey]);

  // Firebase Live Verification API
  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    try {
      const res = await FirebaseSyncService.testConnection();
      setFirebaseStatus({
        tested: true,
        online: res.success,
        latencyMs: res.latencyMs,
        message: res.message
      });
    } catch (err: any) {
      setFirebaseStatus({
        tested: true,
        online: false,
        message: err?.message || 'Firebase connection failed.'
      });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  // Supabase REST Live Verification API
  const handleTestSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setSupabaseStatus({
        tested: true,
        online: false,
        message: 'Credentials missing. Please enter your Supabase URL and Anon Key.'
      });
      return;
    }

    setIsTestingSupabase(true);
    const start = Date.now();
    try {
      // Clean and structure URL endpoint
      const cleanedUrl = supabaseUrl.trim().replace(/\/$/, '');
      const testEndpoint = `${cleanedUrl}/rest/v1/`;

      const res = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey.trim(),
          'Authorization': `Bearer ${supabaseAnonKey.trim()}`
        }
      });

      const latencyMs = Date.now() - start;

      if (res.ok) {
        setSupabaseStatus({
          tested: true,
          online: true,
          latencyMs,
          message: `Connected successfully to Supabase API (Latency: ${latencyMs}ms). REST Endpoints are reachable!`
        });
      } else {
        const errText = await res.text();
        setSupabaseStatus({
          tested: true,
          online: false,
          latencyMs,
          message: `Supabase API returned error code ${res.status}: ${errText || 'Verify URL & Anon API Key'}`
        });
      }
    } catch (err: any) {
      setSupabaseStatus({
        tested: true,
        online: false,
        latencyMs: Date.now() - start,
        message: `Network Error: Could not resolve Supabase endpoint. Verify DNS resolution and CORS headers. Details: ${err?.message || err}`
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Pull Data Row from Supabase
  const handlePullFromSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    setIsPullingSupabase(true);
    try {
      const cleanedUrl = supabaseUrl.trim().replace(/\/$/, '');
      const pullEndpoint = `${cleanedUrl}/rest/v1/${supabaseTableName.trim()}?select=*&limit=5`;

      const res = await fetch(pullEndpoint, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey.trim(),
          'Authorization': `Bearer ${supabaseAnonKey.trim()}`,
          'Range-Unit': 'items'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(prev => ({
          ...prev,
          tested: true,
          online: true,
          dataRows: data,
          message: `Fetched ${data.length} records successfully from table "${supabaseTableName}"!`
        }));
      } else {
        const errText = await res.text();
        setSupabaseStatus(prev => ({
          ...prev,
          tested: true,
          online: false,
          message: `Fetch failed for table "${supabaseTableName}". Code ${res.status}: ${errText}`
        }));
      }
    } catch (err: any) {
      setSupabaseStatus(prev => ({
        ...prev,
        tested: true,
        online: false,
        message: `Pull error: ${err?.message || err}`
      }));
    } finally {
      setIsPullingSupabase(false);
    }
  };

  // Push Local Database to Supabase PostgreSQL table
  const handlePushToSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    setIsPushingSupabase(true);
    try {
      const localListings = ClientStorageManager.getListings();
      const cleanedUrl = supabaseUrl.trim().replace(/\/$/, '');
      const pushEndpoint = `${cleanedUrl}/rest/v1/${supabaseTableName.trim()}`;

      // Convert Listings to match the custom Supabase PostgreSQL blueprint structure
      const payload = localListings.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        country: item.country,
        price: item.price,
        rating: item.rating,
        images: item.images
      }));

      const res = await fetch(pushEndpoint, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey.trim(),
          'Authorization': `Bearer ${supabaseAnonKey.trim()}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates' // UPSERT simulation
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 201 || res.status === 200 || res.ok) {
        setSupabaseStatus(prev => ({
          ...prev,
          tested: true,
          online: true,
          message: `Successfully seeded/upserted ${payload.length} listings into Supabase table "${supabaseTableName}"!`
        }));
      } else {
        const errText = await res.text();
        setSupabaseStatus(prev => ({
          ...prev,
          tested: true,
          online: false,
          message: `Seed failed: Ensure table "${supabaseTableName}" exists with matching properties. Error: ${errText}`
        }));
      }
    } catch (err: any) {
      setSupabaseStatus(prev => ({
        ...prev,
        tested: true,
        online: false,
        message: `Push error: ${err?.message || err}`
      }));
    } finally {
      setIsPushingSupabase(false);
    }
  };

  // Trigger JSON download snapshot
  const handleExportAndDownload = async () => {
    if (!token) return;
    setExporting(true);
    setDownloadSuccess('');
    try {
      const res = await fetch('/api/cloud-sync/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
      if (res.ok) {
        const result = await res.json();
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result.exportPayload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `voyage-cloud-backup-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setDownloadSuccess('Cloud & GitHub backup snapshot generated and downloaded!');
        fetchSyncStatus();
      }
    } catch {
      // ignore fallbacks
    } finally {
      setExporting(false);
    }
  };

  const sqlCode = `-- Voyage Supabase PostgreSQL Database Schema Setup Script
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT,
  country TEXT,
  price NUMERIC,
  rating NUMERIC,
  images TEXT[]
);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div id="cloud-database-console" className="space-y-6 max-w-6xl mx-auto">
      
      {/* Title Header Row */}
      <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-sky-500 animate-pulse" />
            <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
              Multi-Database Cloud Sync & Management Console
            </h2>
          </div>
          <p className={`text-xs ${styles.textMuted} mt-1`}>
            Simultaneously manage and analyze synchronized connections to <span className="font-semibold text-sky-500">Google Cloud Firebase Firestore</span> and <span className="font-semibold text-emerald-500">Supabase SQL Database</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchSyncStatus();
              handleTestFirebase();
            }}
            disabled={loading}
            className={`p-2.5 rounded-xl border ${styles.border} hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-500 flex items-center gap-1.5 transition-all`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refetch Live Stats</span>
          </button>

          <button
            type="button"
            disabled={exporting}
            onClick={handleExportAndDownload}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md flex items-center gap-1.5 transition-all`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export Cloud Bundle'}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Grid Row: Firebase Firestore & Supabase side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* --- PANEL A: FIREBASE FIRESTORE --- */}
        <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-5 flex flex-col justify-between`}>
          <div className="space-y-4">
            
            {/* Header Status Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${styles.textPrimary}`}>Google Cloud Firestore</h4>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {FIRESTORE_DATABASE_ID}</span>
                </div>
              </div>

              {firebaseStatus.tested ? (
                firebaseStatus.online ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </span>
                )
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                  Unchecked
                </span>
              )}
            </div>

            {/* Quick Metrics display */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="text-lg font-bold text-sky-500">
                  {syncStatus?.firebase.collections.listings ?? '...'}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Listings Collection</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="text-lg font-bold text-emerald-500">
                  {syncStatus?.firebase.collections.users ?? '...'}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Users Directory</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="text-lg font-bold text-amber-500">
                  {syncStatus?.firebase.collections.auditLogs ?? '...'}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Security Logs</div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="text-lg font-bold text-indigo-500">
                  {syncStatus?.firebase.collections.bookings ?? '...'}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Verified Bookings</div>
              </div>
            </div>

            {/* Logs console message */}
            <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] space-y-1 overflow-auto max-h-[110px]">
              <div><span className="text-amber-500">Firestore Console logs:</span></div>
              <div className="opacity-80">Project ID: {FIREBASE_PROJECT_ID}</div>
              <div className="opacity-80">Connection check: {firebaseStatus.message || 'Standby.'}</div>
              {firebaseStatus.latencyMs !== undefined && (
                <div className="text-emerald-400">Response latency: {firebaseStatus.latencyMs}ms</div>
              )}
            </div>

          </div>

          {/* Verification buttons */}
          <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              onClick={handleTestFirebase}
              disabled={isTestingFirebase}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border ${styles.border} ${styles.buttonSecondary} flex items-center justify-center gap-1.5`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingFirebase ? 'animate-spin' : ''}`} />
              <span>Verify Ping</span>
            </button>

            <a
              href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore`}
              target="_blank"
              referrerPolicy="no-referrer"
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl ${styles.buttonPrimary} text-center flex items-center justify-center gap-1.5`}
            >
              <span>Firebase Web Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* --- PANEL B: SUPABASE RELATIONAL --- */}
        <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-4`}>
          
          {/* Header Status Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${styles.textPrimary}`}>Supabase PostgreSQL</h4>
                <span className="text-[10px] text-slate-400 font-mono">Restful API Endpoint Connection</span>
              </div>
            </div>

            {supabaseStatus.tested ? (
              supabaseStatus.online ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1 flex-wrap">
                  <WifiOff className="w-3 h-3" />
                  Not Connected
                </span>
              )
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                Unchecked
              </span>
            )}
          </div>

          {/* Form fields for API setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Supabase URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl outline-none border ${styles.border} ${styles.inputBg}`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Anon Key (Public API Key)</span>
                <button 
                  type="button" 
                  onClick={() => setShowKey(!showKey)} 
                  className="text-[9px] lowercase font-semibold text-sky-500 hover:underline"
                >
                  {showKey ? 'hide' : 'show'}
                </button>
              </label>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl outline-none border ${styles.border} ${styles.inputBg}`}
              />
            </div>
          </div>

          {/* Target Table Settings */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Target Schema Table Name
              </label>
              <input
                type="text"
                value={supabaseTableName}
                onChange={(e) => setSupabaseTableName(e.target.value)}
                className={`w-full px-2 py-1.5 text-xs font-mono rounded-lg outline-none border ${styles.border} ${styles.inputBg}`}
              />
            </div>
            <div className="flex items-end gap-2.5 self-end">
              <button
                onClick={() => setShowSqlBlueprint(!showSqlBlueprint)}
                className="px-3 py-1.5 rounded-lg border border-sky-500/20 text-sky-500 hover:bg-sky-500/5 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SQL Setup Schema</span>
              </button>
            </div>
          </div>

          {/* SQL Blueprint Collapse */}
          {showSqlBlueprint && (
            <div className="p-3 rounded-xl bg-slate-900/90 text-slate-300 font-mono text-[10px] border border-slate-800 space-y-2 animate-in slide-in-from-top duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-sky-400">PostgreSQL Schema Blueprint</span>
                <button
                  onClick={copySqlToClipboard}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 font-semibold"
                >
                  {sqlCopied ? 'Copied!' : 'Copy Schema SQL'}
                </button>
              </div>
              <pre className="overflow-x-auto text-[9.5px] leading-relaxed max-h-[140px] whitespace-pre">{sqlCode}</pre>
            </div>
          )}

          {/* Logs console message */}
          <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] space-y-1 overflow-auto max-h-[110px]">
            <div><span className="text-emerald-500">Supabase Connection logs:</span></div>
            <div className="opacity-80">Endpoint: {supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/rest/v1` : 'Not Configured'}</div>
            <div className="opacity-80">Connection Status: {supabaseStatus.message || 'Standby.'}</div>
            {supabaseStatus.dataRows && (
              <div className="text-sky-400 mt-1">
                <div>Sample Response Content (Limit 1 row):</div>
                <pre className="p-1 rounded bg-slate-950 max-h-[60px] overflow-auto text-[8.5px] whitespace-pre">
                  {JSON.stringify(supabaseStatus.dataRows[0] || 'Empty Table', null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Interactive control buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className={`flex-1 min-w-[120px] py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-all`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
              <span>Verify Key Ping</span>
            </button>

            <button
              onClick={handlePullFromSupabase}
              disabled={isPullingSupabase || !supabaseUrl || !supabaseAnonKey}
              className={`flex-1 min-w-[120px] py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-sky-500/20 bg-sky-500/5 text-sky-500 hover:bg-sky-500/10 flex items-center justify-center gap-1.5 transition-all`}
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>{isPullingSupabase ? 'Fetching...' : 'Fetch Rows'}</span>
            </button>

            <button
              onClick={handlePushToSupabase}
              disabled={isPushingSupabase || !supabaseUrl || !supabaseAnonKey}
              className={`flex-1 min-w-[120px] py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center gap-1.5 shadow-md transition-all`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPushingSupabase ? 'Syncing...' : 'Push Listings'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* GitHub Repository Sync Card (Below) */}
      <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-white border border-slate-700">
              <GitBranch className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${styles.textPrimary}`}>GitHub Version Control & CI/CD pipeline</h4>
              <span className="text-[11px] text-slate-400">Account: mukundkrishna.h@gmail.com</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Production Ready
          </span>
        </div>

        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-500">
          <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <span>GitHub Sync & Deploy Operations Instructions:</span>
          </div>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
            <li>Click <strong>Settings</strong> in the top AI Studio navigation bar.</li>
            <li>Click <strong>Export to GitHub</strong> or <strong>Download ZIP</strong>.</li>
            <li>Authenticate with your personal account <span className="font-semibold text-sky-500">mukundkrishna.h2008@gmail.com</span> to automatically sync all custom routes, ticking clocks, and dynamic breadcrumbs.</li>
          </ol>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <span>Branch: main (Autobuild Pipeline)</span>
          <span className="font-mono text-[10px]">48 Workspace Files Monitored</span>
        </div>
      </div>

    </div>
  );
};
