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
  Download,
  Copy,
  Check,
  Compass,
  Bell,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { 
  SupabaseSyncService, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  SUPABASE_CONSOLE_URL 
} from '../services/supabaseSync.ts';
import { FirebaseSyncService } from '../services/firebase.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { Listing, User, CustomPost, AuditLog, Booking, PriceAlert } from '../types.ts';

interface SupabaseConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted?: () => void;
}

export const SupabaseConsoleModal: React.FC<SupabaseConsoleModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted
}) => {
  const { styles } = useTheme();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CUSTOM_POSTS' | 'USERS' | 'LISTINGS' | 'BOOKINGS' | 'ALERTS'>('OVERVIEW');
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
    counts?: { listings: number; users: number; customPosts: number; auditLogs: number; bookings: number; priceAlerts: number };
  } | null>(null);

  const [customPosts, setCustomPosts] = useState<CustomPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      handleTestConnection();
    }
  }, [isOpen]);

  const loadData = async () => {
    // Load local storage states
    setCustomPosts(ClientStorageManager.getCustomPosts());
    setUsers(ClientStorageManager.getUsers());
    setListings(ClientStorageManager.getListings());
    setLogs(ClientStorageManager.getAuditLogs());

    // Fetch dynamic items if available
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.warn("Local bookings fallback:", e);
    }

    // Load Price Alerts
    const firstUser = ClientStorageManager.getUsers()[0];
    if (firstUser) {
      const alerts = await FirebaseSyncService.getPriceAlertsForUser(firstUser.uid);
      setPriceAlerts(alerts);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await SupabaseSyncService.testConnection();
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
        listings,
        users,
        customPosts,
        auditLogs: logs,
        bookings,
        priceAlerts
      };

      const res = await SupabaseSyncService.bulkSyncAllToSupabase(payload);
      if (res.success) {
        setSyncResult({
          success: true,
          message: `Successfully synchronized and mapped all PostgreSQL tables in Supabase Cloud!`,
          counts: res.syncedCounts
        });
        if (onSyncCompleted) onSyncCompleted();
      } else {
        setSyncResult({
          success: false,
          message: `Sync warning or partial constraint failure: ${res.error || 'Verify schemas match'}`
        });
      }
    } catch (err: unknown) {
      setSyncResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to connect and push to Supabase.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const data = {
      supabaseUrl: SUPABASE_URL,
      provider: 'Supabase PostgreSQL',
      exportedAt: new Date().toISOString(),
      customPosts,
      users,
      listings,
      bookings,
      priceAlerts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-database-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(SUPABASE_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SUPABASE_ANON_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
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
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-sm">
              <Database className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-bold ${styles.textPrimary}`}>
                  Supabase Cloud Database Console
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse animate-duration-1000"></span>
                  Connected
                </span>
              </div>
              <p className={`text-xs ${styles.textMuted} mt-0.5`}>
                Provision relational tables, inspect schema definitions, and upsert records into Supabase PostgreSQL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={SUPABASE_CONSOLE_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Open Supabase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Credentials and Connection Benchmarking */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Supabase API URL</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[180px]">{SUPABASE_URL}</span>
              <button 
                onClick={handleCopyUrl}
                className="p-1 text-slate-400 hover:text-slate-200 shrink-0"
                title="Copy API URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Public Anon Key</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-sky-400 truncate max-w-[150px]">{SUPABASE_ANON_KEY}</span>
              <button 
                onClick={handleCopyKey}
                className="p-1 text-slate-400 hover:text-slate-200 shrink-0"
                title="Copy Anon Key"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Connection & Ping</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold ${connectionStatus.online ? 'text-emerald-400' : 'text-rose-400'}`}>
                {connectionStatus.latencyMs !== undefined ? `${connectionStatus.latencyMs}ms latency` : 'Acquiring Link...'}
              </span>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 ml-auto"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>
            </div>
          </div>
        </div>

        {/* Database Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PostgreSQL Listings</div>
              <div className="text-xl font-bold text-emerald-400">{listings.length}</div>
            </div>
            <Layers className="w-5 h-5 text-emerald-500/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traveler Accounts</div>
              <div className="text-xl font-bold text-sky-400">{users.length}</div>
            </div>
            <Users className="w-5 h-5 text-sky-500/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Bookings</div>
              <div className="text-xl font-bold text-purple-400">{bookings.length}</div>
            </div>
            <Compass className="w-5 h-5 text-purple-500/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Price Alerts</div>
              <div className="text-xl font-bold text-amber-400">{priceAlerts.length}</div>
            </div>
            <Bell className="w-5 h-5 text-amber-500/50" />
          </div>
        </div>

        {/* Sync Status Alert */}
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
                    Synced: {syncResult.counts.listings} Listings, {syncResult.counts.users} Users, {syncResult.counts.customPosts} Custom Posts, {syncResult.counts.bookings} Bookings, {syncResult.counts.priceAlerts} Price Alerts.
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
              { id: 'BOOKINGS', label: `Bookings (${bookings.length})` },
              { id: 'ALERTS', label: `Price Alerts (${priceAlerts.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
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
              className={`px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md flex items-center gap-1.5 transition-colors`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Syncing to PostgreSQL...' : 'Sync Database to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 min-h-[260px] max-h-[380px] overflow-y-auto space-y-3">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  <span>Supabase PostgreSQL Tables Map (RLS Enforced)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-300">listings</span>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-mono">TABLE</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Contains destination names, pricing models, geolocation links, descriptions, and ratings.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-300">users</span>
                      <span className="text-[8px] bg-sky-500/10 text-sky-400 px-1.5 py-0.2 rounded font-mono">TABLE</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Stores user profile structures, administrative tiers, custom avatars, and department maps.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-300">bookings</span>
                      <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded font-mono">TABLE</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Houses active and historic itinerary reservations linking users and listings securely.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-300">price_alerts</span>
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded font-mono">TABLE</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Stores active user subscriptions for receiving price drops on selected destinations.
                    </div>
                  </div>

                </div>
              </div>

              {/* RLS Policy Insight */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-400">PostgreSQL Row-Level Security (RLS) & REST Routing</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                    Tables are mapped directly to a PostgREST backend server. When RLS is enabled, users can select, update, or delete records matching their authenticated UID. Sync actions seamlessly proxy payload arrays using standard CJS and ESM schema definitions.
                  </p>
                </div>
              </div>

              {/* Sample SQL Console Output */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Postgres CLI Seed Sample Code</span>
                  </span>
                  <span>SQL Console</span>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre p-2 bg-slate-900 rounded-lg">
{`CREATE TABLE public.price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_email text NOT NULL,
  listing_id text NOT NULL,
  listing_title text NOT NULL,
  target_price numeric NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);`}
                </pre>
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
                      <div className="text-[11px] text-emerald-400 font-semibold">{u.customTitle || u.role} • {u.department || 'General'}</div>
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

          {activeTab === 'BOOKINGS' && (
            <div className="space-y-2">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No traveler bookings found.
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={b.listingImage} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-200">{b.listingTitle}</div>
                        <div className="text-[11px] text-slate-400">Guests: {b.guests} • Stay: {b.checkInDate} to {b.checkOutDate || 'Flexible'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      ${b.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'ALERTS' && (
            <div className="space-y-2">
              {priceAlerts.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No active price drop alerts created yet.
                </div>
              ) : (
                priceAlerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="font-bold text-slate-200">{alert.listingTitle}</div>
                        <div className="text-[11px] text-slate-400">Emailed to: <strong>{alert.userEmail}</strong></div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      Target: ${alert.targetPrice}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>PostgreSQL Synchronizer fully active. Live mapping with RLS tables.</span>
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
