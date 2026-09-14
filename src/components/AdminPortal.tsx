import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlusCircle,
  FileCheck,
  Users,
  ScrollText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  KeyRound,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Trash2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Listing, User, AuditLog, ListingCategory, ListingStatus } from '../types.ts';

interface AdminPortalProps {
  onListingUpdated?: () => void;
  onNavigateExplore?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onListingUpdated,
  onNavigateExplore,
}) => {
  const { styles } = useTheme();
  const { user, token, sessionRemainingSec, verifyPasskey, refreshSessionHealth, logout } = useAuth();

  const isTechAdmin = user?.role === 'TECH_ADMIN';
  const isTechSubAdmin = user?.role === 'TECH_SUBADMIN';
  const isElevatedAdmin = isTechAdmin || isTechSubAdmin;
  const isAdmin = user?.role === 'ADMIN' || isElevatedAdmin;

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'create' | 'inventory' | 'queue' | 'users' | 'logs'>(
    isElevatedAdmin ? 'queue' : 'inventory'
  );

  // Listings data
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Users data (Tech Admin)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Audit logs data (Tech Admin)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Form State for creating a listing
  const [formData, setFormData] = useState({
    title: '',
    category: 'PLACE' as ListingCategory,
    price: 250,
    location: '',
    country: '',
    description: '',
    imageUrl: '',
    tags: 'Romantic, Scenic, Historic',
    amenities: 'Guided Walking Tour, Audio Headsets, Panoramic Overlook',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Elevated Passkey Modal State
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [pendingElevatedAction, setPendingElevatedAction] = useState<(() => Promise<void>) | null>(null);
  const [passkeyInput, setPasskeyInput] = useState('SEC-ROOT-TRAVEL-2026');
  const [passkeyError, setPasskeyError] = useState('');

  // Queue Review Modal State (Side-by-Side Comparison)
  const [reviewListing, setReviewListing] = useState<Listing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  // Fetch all listings for admin view
  const fetchListings = async () => {
    if (!token) return;
    setLoadingListings(true);
    try {
      const res = await fetch('/api/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch users (Tech Admin only)
  const fetchUsers = async () => {
    if (!token || !isTechAdmin) return;
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch audit logs (Tech Admin and Sub-Admin)
  const fetchLogs = async (actionFilter = 'ALL') => {
    if (!token || !isElevatedAdmin) return;
    setLoadingLogs(true);
    try {
      const url = actionFilter !== 'ALL' ? `/api/audit-logs?action=${actionFilter}` : '/api/audit-logs';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings();
      if (isTechAdmin) {
        fetchUsers();
      }
      if (isElevatedAdmin) {
        fetchLogs();
      }
    }
  }, [token, isTechAdmin, isElevatedAdmin]);

  // File upload handler with strict 5MB check
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Invalid format. Only JPG, PNG, and WebP are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      return;
    }

    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result as string);
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Create listing submission
  const handleSubmitListing = async (targetStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED') => {
    if (!formData.title || !formData.location || !formData.country || !formData.description) {
      setUploadError('Please fill out all required listing details.');
      return;
    }

    setIsSubmittingListing(true);
    setUploadError('');
    setFormSuccessMessage('');

    try {
      const imageToUse = formData.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(Boolean);

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          price: Number(formData.price),
          location: formData.location,
          country: formData.country,
          description: formData.description,
          images: [imageToUse],
          tags: tagsArray,
          amenities: amenitiesArray,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Failed to submit inventory item.');
      } else {
        setFormSuccessMessage(
          targetStatus === 'PENDING_APPROVAL'
            ? 'Listing successfully submitted to Technical Super Admin Queue for verification!'
            : targetStatus === 'PUBLISHED'
            ? 'Listing published directly to public explorer!'
            : 'Draft saved to your inventory tracker.'
        );
        // Reset form
        setFormData({
          title: '',
          category: 'PLACE',
          price: 250,
          location: '',
          country: '',
          description: '',
          imageUrl: '',
          tags: 'Romantic, Scenic, Historic',
          amenities: 'Guided Walking Tour, Audio Headsets, Panoramic Overlook',
        });
        setUploadPreview(null);
        fetchListings();
        if (onListingUpdated) onListingUpdated();
      }
    } catch {
      setUploadError('Network error while creating listing.');
    } finally {
      setIsSubmittingListing(false);
    }
  };

  // Tech Admin: Approve or Reject
  const handleUpdateStatus = async (id: string, newStatus: ListingStatus, reason?: string) => {
    setActionProcessing(true);
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason }),
      });
      if (res.ok) {
        setReviewListing(null);
        setRejectionReason('');
        await fetchListings();
        if (isElevatedAdmin) fetchLogs();
        if (onListingUpdated) onListingUpdated();
      }
    } catch {
      // ignore
    } finally {
      setActionProcessing(false);
    }
  };

  // Delete Listing (Tech Admin or Sub-Admin)
  const handleDeleteListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchListings();
        if (isElevatedAdmin) fetchLogs();
        if (onListingUpdated) onListingUpdated();
      }
    } catch {
      // ignore
    }
  };

  // Elevated Action Protection: Prompt Passkey before executing
  const executeWithPasskey = (action: () => Promise<void>) => {
    setPendingElevatedAction(() => action);
    setShowPasskeyModal(true);
    setPasskeyError('');
  };

  const confirmPasskeyAction = async () => {
    if (!passkeyInput) {
      setPasskeyError('Passkey is required.');
      return;
    }
    const isValid = await verifyPasskey(passkeyInput);
    if (!isValid) {
      setPasskeyError('Invalid administrative passkey.');
      return;
    }

    setShowPasskeyModal(false);
    if (pendingElevatedAction) {
      await pendingElevatedAction();
      setPendingElevatedAction(null);
    }
  };

  // Toggle user role
  const handleToggleUserRole = (targetUser: User) => {
    const nextRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    executeWithPasskey(async () => {
      const res = await fetch(`/api/users/${targetUser.uid}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        fetchUsers();
        fetchLogs();
      }
    });
  };

  // Filter listings
  const pendingQueue = listings.filter(l => l.status === 'PENDING_APPROVAL');
  const myInventory = isTechAdmin ? listings : listings.filter(l => l.createdBy === user?.uid);

  // Inactivity timer format
  const formatSec = (sec: number | null) => {
    if (sec === null) return 'Active';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className={`text-2xl font-bold ${styles.textPrimary}`}>Access Restricted</h2>
        <p className={`text-sm ${styles.textSecondary} max-w-md mx-auto`}>
          The Admin Portal requires Standard Admin or Technical Super Admin privileges. Sign in with an authorized administrative account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Privilege Indicator */}
      <div className={`p-5 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            isTechAdmin 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
              : isTechSubAdmin
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
              : 'bg-sky-500/10 text-sky-500 border border-sky-500/30'
          }`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-extrabold tracking-tight ${styles.textPrimary}`}>
                {isTechAdmin ? 'Technical Super Admin Portal' : isTechSubAdmin ? 'Technical Sub-Admin Portal' : 'Standard Content Admin Portal'}
              </h1>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isTechAdmin
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  : isTechSubAdmin
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-sky-500/20 text-sky-500 border border-sky-500/30'
              }`}>
                {user?.role}
              </span>
            </div>
            <p className={`text-xs ${styles.textMuted} mt-0.5`}>
              Connected as <strong className={styles.textPrimary}>{user?.email}</strong> • Session security watchdog active
            </p>
          </div>
        </div>

        {/* Inactivity Security Badge & Keep-Alive */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Session Timeout</span>
              <span className="font-mono font-bold text-sky-500">{formatSec(sessionRemainingSec)}</span>
            </div>
          </div>
          <button
            onClick={() => refreshSessionHealth()}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-2"
            title="Reset Inactivity Watchdog"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
        
        {/* Verification Queue (Tech Admin & Sub-Admin) */}
        {isElevatedAdmin && (
          <button
            id="tab-admin-queue"
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'queue'
                ? `${styles.accent} text-white shadow-md`
                : `${styles.buttonSecondary}`
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Verification Queue</span>
            {pendingQueue.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                {pendingQueue.length}
              </span>
            )}
          </button>
        )}

        {/* Create Inventory (Standard & Tech) */}
        <button
          id="tab-admin-create"
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'create'
              ? `${styles.accent} text-white shadow-md`
              : `${styles.buttonSecondary}`
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Travel Listing</span>
        </button>

        {/* Draft Inventory Tracker */}
        <button
          id="tab-admin-inventory"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory'
              ? `${styles.accent} text-white shadow-md`
              : `${styles.buttonSecondary}`
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isElevatedAdmin ? 'Master Catalog' : 'My Draft Inventory'}</span>
          <span className="text-[10px] opacity-70">({myInventory.length})</span>
        </button>

        {/* User Management (Tech Super Admin only) */}
        {isTechAdmin && (
          <button
            id="tab-admin-users"
            onClick={() => {
              setActiveTab('users');
              fetchUsers();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? `${styles.accent} text-white shadow-md`
                : `${styles.buttonSecondary}`
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User & Admin Privileges</span>
          </button>
        )}

        {/* System Health Audit Logs (Tech Admin & Sub-Admin) */}
        {isElevatedAdmin && (
          <button
            id="tab-admin-logs"
            onClick={() => {
              setActiveTab('logs');
              fetchLogs();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? `${styles.accent} text-white shadow-md`
                : `${styles.buttonSecondary}`
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span>Security Audit Logs</span>
          </button>
        )}
      </div>

      {/* --- TAB 1: Verification Queue (Tech Admin & Sub-Admin) --- */}
      {activeTab === 'queue' && isElevatedAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                Pending Verification Queue
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                Review content submissions drafted by Standard Admins before publishing live to the global explore feed.
              </p>
            </div>
            <button
              onClick={fetchListings}
              className={`p-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {loadingListings ? (
            <div className="py-12 text-center text-xs text-slate-400">Scanning verification queue...</div>
          ) : pendingQueue.length === 0 ? (
            <div className={`p-10 rounded-3xl border ${styles.border} ${styles.cardBg} text-center space-y-3`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-bold ${styles.textPrimary}`}>Verification Queue is Clear</h3>
              <p className={`text-xs ${styles.textMuted} max-w-sm mx-auto`}>
                All submissions have been reviewed and published. Standard admin drafts will appear here when submitted.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingQueue.map(item => (
                <div
                  key={item.id}
                  className={`rounded-3xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm flex flex-col justify-between`}
                >
                  <div className="relative aspect-[16/9] bg-slate-200 dark:bg-slate-800">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500 text-white shadow-md">
                      Pending Approval
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-xs font-mono bg-black/70 text-white">
                      ${item.price}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase">
                        {item.category} • {item.location}, {item.country}
                      </div>
                      <h3 className={`text-base font-bold ${styles.textPrimary} mt-0.5`}>
                        {item.title}
                      </h3>
                      <p className={`text-xs ${styles.textMuted} mt-1.5 line-clamp-2 leading-relaxed`}>
                        {item.description}
                      </p>
                      <div className="mt-3 text-[11px] text-slate-400">
                        Submitted by: <strong className="text-slate-600 dark:text-slate-300">{item.createdByName || item.createdBy}</strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => setReviewListing(item)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${styles.buttonSecondary} flex items-center justify-center gap-1.5`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Side-by-Side Review</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item.id, 'PUBLISHED')}
                        className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1"
                        title="Quick Approve & Publish"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: Add Travel Listing Form --- */}
      {activeTab === 'create' && (
        <div className={`p-6 sm:p-8 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-6 max-w-4xl mx-auto`}>
          <div>
            <h2 className={`text-xl font-bold ${styles.textPrimary}`}>
              Create New Travel Inventory Item
            </h2>
            <p className={`text-xs ${styles.textMuted}`}>
              {isTechAdmin
                ? 'Technical Super Admins can publish items directly to the live feed or save drafts.'
                : 'Submissions from Standard Admins will enter Pending Verification status until Super Admin approval.'}
            </p>
          </div>

          {formSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="space-y-4">
            
            {/* Category & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ListingCategory }))}
                  className={`w-full p-2.5 text-xs rounded-xl outline-none font-medium cursor-pointer ${styles.inputBg}`}
                >
                  <option value="PLACE">Destination / Landmark</option>
                  <option value="HOTEL">Luxury Hotel / Resort</option>
                  <option value="FOOD">Local Gastronomy / Dining</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Listing Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Cappadocia Hot Air Balloon Sunrise & Cave Suites"
                  className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>
            </div>

            {/* Location, Country, Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Starting Price ($ USD) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  City / Region *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Göreme, Cappadocia"
                  className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g. Turkey"
                  className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Description & Highlights *
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the experience, architectural beauty, vistas, and insider guest perks..."
                className={`w-full p-3 text-xs rounded-xl outline-none leading-relaxed ${styles.inputBg}`}
              />
            </div>

            {/* Tags & Amenities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Amenities / Inclusions (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
                  className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>
            </div>

            {/* Image Upload & URL input (Security enforced: max 5MB, format check) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Imagery (Web URL or Upload - Max 5MB, JPG/PNG/WebP)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />

                <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed ${styles.border} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-500`}>
                  <Upload className="w-4 h-4" />
                  <span>Upload Image File (&lt; 5MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadPreview && (
                <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={uploadPreview} alt="Upload preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded">Preview</span>
                </div>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
            <button
              id="save-draft-btn"
              type="button"
              disabled={isSubmittingListing}
              onClick={() => handleSubmitListing('DRAFT')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold ${styles.buttonSecondary}`}
            >
              Save as Draft
            </button>

            {isTechAdmin ? (
              <button
                id="publish-direct-btn"
                type="button"
                disabled={isSubmittingListing}
                onClick={() => handleSubmitListing('PUBLISHED')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md`}
              >
                Publish Directly
              </button>
            ) : (
              <button
                id="submit-verification-btn"
                type="button"
                disabled={isSubmittingListing}
                onClick={() => handleSubmitListing('PENDING_APPROVAL')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md flex items-center gap-2`}
              >
                <span>Submit for Verification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: Inventory / Draft Tracker --- */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                {isTechAdmin ? 'All Platform Listings' : 'My Content Submissions'}
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                Track submission statuses, verification reviews, and published items.
              </p>
            </div>
            <button
              onClick={fetchListings}
              className={`p-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Listing</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
                  {myInventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No listings found in this view. Use the "Add Travel Listing" tab to create one.
                      </td>
                    </tr>
                  ) : (
                    myInventory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className={`font-bold ${styles.textPrimary} line-clamp-1`}>{item.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {item.location}, {item.country}
                        </td>
                        <td className="p-4 font-bold text-sky-500">
                          ${item.price}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              item.status === 'PUBLISHED'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : item.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                                : item.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'PENDING_APPROVAL' && isElevatedAdmin && (
                              <button
                                onClick={() => setReviewListing(item)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                              >
                                Review
                              </button>
                            )}
                            {item.status === 'DRAFT' && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'PENDING_APPROVAL')}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500 text-white"
                              >
                                Submit
                              </button>
                            )}
                            {item.status === 'PUBLISHED' && onNavigateExplore && (
                              <button
                                onClick={onNavigateExplore}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500"
                                title="View in Explorer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                            {isElevatedAdmin && (
                              <button
                                onClick={() => handleDeleteListing(item.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Delete Listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: User Management (Tech Admin only) --- */}
      {activeTab === 'users' && isTechAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                User & Admin Privilege Administration
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                Manage system roles, grant or revoke Standard Admin privileges, and inspect MFA security status.
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className={`p-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Users</span>
            </button>
          </div>

          <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Phone / MFA</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4">Recovery Email</th>
                    <th className="p-4 text-right">Privilege Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
                  {usersList.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className={`font-bold ${styles.textPrimary}`}>{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-xs">{u.phoneNumber || 'N/A'}</div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${u.mfaEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                          {u.mfaEnabled ? 'MFA ACTIVE' : 'NO MFA'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          u.role === 'TECH_ADMIN'
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-extrabold'
                            : u.role === 'ADMIN'
                            ? 'bg-sky-500/20 text-sky-500 border border-sky-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px] font-mono">
                        {u.recoveryEmail || 'None configured'}
                      </td>
                      <td className="p-4 text-right">
                        {u.role === 'TECH_ADMIN' ? (
                          <span className="text-[10px] font-semibold text-amber-500 flex items-center justify-end gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Root Protected</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              u.role === 'ADMIN'
                                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30'
                                : 'bg-sky-500 text-white hover:bg-sky-400'
                            }`}
                          >
                            {u.role === 'ADMIN' ? 'Revoke Admin' : 'Promote to Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: Security Audit Logs (Tech Admin & Sub-Admin) --- */}
      {activeTab === 'logs' && isElevatedAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                System Security & Modification Audit Trail
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                Immutable security logs tracking logins, emergency bypass attempts, rate limiting, and administrative database writes.
              </p>
            </div>

            {/* Filter by action */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={logFilter}
                onChange={(e) => {
                  setLogFilter(e.target.value);
                  fetchLogs(e.target.value);
                }}
                className={`py-1.5 px-3 text-xs rounded-xl font-medium outline-none cursor-pointer ${styles.inputBg}`}
              >
                <option value="ALL">All Event Types</option>
                <option value="TECH_ADMIN_LOGIN_SUCCESS">Admin Logins</option>
                <option value="EMERGENCY_BYPASS_ACTIVATED">Emergency Bypass</option>
                <option value="SUBMIT_PENDING_LISTING">Pending Submissions</option>
                <option value="APPROVE_LISTING">Listing Approvals</option>
                <option value="UPDATE_USER_ROLE">Role Changes</option>
                <option value="RATE_LIMIT_BLOCKED">Rate Limit Blocks</option>
              </select>

              <button
                onClick={() => fetchLogs(logFilter)}
                className={`p-1.5 rounded-xl ${styles.buttonSecondary}`}
                title="Refresh Logs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Security Action</th>
                    <th className="p-4">Performed By</th>
                    <th className="p-4">Target Resource</th>
                    <th className="p-4">Client IP</th>
                    <th className="p-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800 font-mono text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                        No audit logs recorded for this filter.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()} <span className="text-[9px] opacity-70">{new Date(log.timestamp).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action.includes('BYPASS') || log.action.includes('BLOCKED')
                                ? 'bg-rose-500/10 text-rose-500'
                                : log.action.includes('APPROVE')
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : log.action.includes('TECH_ADMIN')
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-sky-500/10 text-sky-500'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {log.performedBy}
                        </td>
                        <td className="p-4 text-slate-400">
                          {log.targetId}
                        </td>
                        <td className="p-4 text-slate-400">
                          {log.ipAddress}
                        </td>
                        <td className="p-4 text-slate-500 font-sans text-[10px] max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDE-BY-SIDE VERIFICATION QUEUE REVIEW MODAL --- */}
      {reviewListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className={`relative w-full max-w-4xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden p-6 space-y-5`}>
            
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
                  Side-by-Side Content Verification & Approval
                </h3>
              </div>
              <button
                onClick={() => setReviewListing(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Side by side comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card A: Submitted Metadata */}
              <div className={`p-4 rounded-2xl border ${styles.border} ${styles.bg} space-y-3`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Original Standard Admin Submission
                </div>
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img src={reviewListing.images[0]} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className={`text-base font-bold ${styles.textPrimary}`}>{reviewListing.title}</h4>
                  <div className="text-xs text-sky-500 font-semibold">{reviewListing.location}, {reviewListing.country}</div>
                  <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-1">${reviewListing.price} / rate</div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{reviewListing.description}</p>
                </div>
              </div>

              {/* Card B: Live Feed Simulation / Action Panel */}
              <div className={`p-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 space-y-4 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-sky-500 mb-2">
                    <span>Target Feed Outcome</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-white">READY TO PUBLISH</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Approving this item will immediately promote its status to <strong className="text-emerald-500">PUBLISHED</strong>, propagating it to the global traveler explore feed.
                  </p>

                  <div className="mt-4 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Rejection Notes (Optional if rejecting)
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Please clarify high-season rates or upload a higher resolution photo..."
                      className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    disabled={actionProcessing}
                    onClick={() => handleUpdateStatus(reviewListing.id, 'REJECTED', rejectionReason)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition-all"
                  >
                    Reject Submission
                  </button>

                  <button
                    disabled={actionProcessing}
                    onClick={() => handleUpdateStatus(reviewListing.id, 'PUBLISHED')}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- ELEVATED ACTION SECURITY PASSKEY MODAL --- */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className={`relative w-full max-w-sm rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 space-y-4`}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
                Elevated Passkey Verification
              </h3>
              <p className={`text-xs ${styles.textMuted}`}>
                This administrative action modifies user access control. Enter your dynamic administrative passkey to proceed.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Security Passkey
              </label>
              <input
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="SEC-ROOT-TRAVEL-2026"
                className={`w-full px-3 py-2 text-xs font-mono rounded-xl outline-none ${styles.inputBg}`}
                autoFocus
              />
              <div className="text-[10px] text-slate-400 mt-1">Default security passkey: <span className="font-mono text-sky-500">SEC-ROOT-TRAVEL-2026</span></div>
            </div>

            {passkeyError && (
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-medium">
                {passkeyError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowPasskeyModal(false);
                  setPendingElevatedAction(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmPasskeyAction}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary}`}
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
