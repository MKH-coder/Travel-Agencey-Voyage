import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Trash2,
  MapPin,
  UserPlus,
  Save,
  Pencil,
  Cloud,
  Utensils,
  Compass,
  Plus,
  Wifi,
  WifiOff,
  Briefcase,
  Database,
  Flame,
  FileSpreadsheet,
  Download,
  FileJson,
  Flag,
  MessageSquare,
  Star,
  Activity,
  Monitor,
  Radio,
  LogOut,
  Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Listing, User, AuditLog, ListingCategory, ListingStatus, CustomPost, Booking, Review } from '../types.ts';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MapLocationPicker, LocationResult } from './MapLocationPicker.tsx';
import { AddAdminModal } from './AddAdminModal.tsx';
import { SetPasswordModal } from './SetPasswordModal.tsx';
import { EditRolePostModal } from './EditRolePostModal.tsx';
import { EditContentModal } from './EditContentModal.tsx';
import { ActiveSessionTelemetryModal, ActiveUserSession } from './ActiveSessionTelemetryModal.tsx';
import { CloudSyncPanel } from './CloudSyncPanel.tsx';
import { CustomPostCreatorModal } from './CustomPostCreatorModal.tsx';
import { FirebaseConsoleModal } from './FirebaseConsoleModal.tsx';
import { SupabaseConsoleModal } from './SupabaseConsoleModal.tsx';
import { AuditVisualDashboard } from './AuditVisualDashboard.tsx';
import { AuditLogViewer } from './AuditLogViewer.tsx';
import { UserProfileModal } from './UserProfileModal.tsx';
import { HighRiskAuditBanner } from './HighRiskAuditBanner.tsx';
import { RiskThresholdConfigModal, DEFAULT_RISK_THRESHOLDS } from './RiskThresholdConfigModal.tsx';
import { AdminSecurityAdoptionCard } from './AdminSecurityAdoptionCard.tsx';
import { SecurityOverviewCard } from './SecurityOverviewCard.tsx';
import { AuditTrailDashboard } from './AuditTrailDashboard.tsx';
import { RiskThresholdConfig } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { FirebaseSyncService } from '../services/firebase.ts';

interface AdminPortalProps {
  onListingUpdated?: () => void;
  onNavigateExplore?: () => void;
  onTabChange?: (tab: 'analytics' | 'create' | 'inventory' | 'queue' | 'users' | 'logs' | 'cloud' | 'logins') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onListingUpdated,
  onNavigateExplore,
  onTabChange,
}) => {
  const { styles } = useTheme();
  const { user, token, sessionRemainingSec, verifyPasskey, refreshSessionHealth, logout, auditLog } = useAuth();

  const isTechAdmin = user?.role === 'TECH_ADMIN';
  const isTechSubAdmin = user?.role === 'TECH_SUBADMIN';
  const isElevatedAdmin = isTechAdmin || isTechSubAdmin;
  const isAdmin = user?.role === 'ADMIN' || isElevatedAdmin;

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'create' | 'inventory' | 'queue' | 'users' | 'logs' | 'cloud' | 'logins'>('queue');

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  // Listings data
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Users data (Tech Admin)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserUids, setSelectedUserUids] = useState<Set<string>>(new Set());
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  // Audit logs data (Tech Admin)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Map & Location auto-detector state
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  
  // Super Admin posting privilege toggle
  const [postAsSuperAdmin, setPostAsSuperAdmin] = useState<boolean>(isElevatedAdmin);

  // Multiple photos state for listing creation
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [newPhotoInput, setNewPhotoInput] = useState<string>('');

  // Reported reviews moderation state
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [loadingReportedReviews, setLoadingReportedReviews] = useState<boolean>(false);
  const [queueSubTab, setQueueSubTab] = useState<'listings' | 'reviews'>('listings');
  const [moderationFeedback, setModerationFeedback] = useState<string>('');
  const [moderatingReviewId, setModeratingReviewId] = useState<string | null>(null);

  // Modals for admin operations
  const [showAddAdminModal, setShowAddAdminModal] = useState<boolean>(false);
  const [editingRolePostUser, setEditingRolePostUser] = useState<User | null>(null);
  const [setPasswordModalUser, setSetPasswordModalUser] = useState<User | null>(null);
  const [editingContentListing, setEditingContentListing] = useState<Listing | null>(null);
  const [showCustomPostModal, setShowCustomPostModal] = useState<boolean>(false);
  const [editingCustomPost, setEditingCustomPost] = useState<CustomPost | null>(null);
  const [showFirebaseConsoleModal, setShowFirebaseConsoleModal] = useState<boolean>(false);
  const [showSupabaseConsoleModal, setShowSupabaseConsoleModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showRiskConfigModal, setShowRiskConfigModal] = useState<boolean>(false);
  const [riskThresholds, setRiskThresholds] = useState<RiskThresholdConfig>(() => {
    try {
      const saved = localStorage.getItem('voyage_risk_thresholds');
      return saved ? JSON.parse(saved) : DEFAULT_RISK_THRESHOLDS;
    } catch {
      return DEFAULT_RISK_THRESHOLDS;
    }
  });
  const [customPostsList, setCustomPostsList] = useState<CustomPost[]>([]);

  // Generate date array for the last 30 days of trends
  const getPast30DaysData = () => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Sep 15"
      
      // Filter bookings on this day
      const dayBookings = bookingsList.filter(b => {
        if (!b.createdAt) return false;
        return b.createdAt.split('T')[0] === dateStr;
      });
      const bookingCount = dayBookings.length;
      const bookingRevenue = dayBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      // Filter user registrations on this day
      const dayUsers = usersList.filter(u => {
        if (!u.createdAt) return false;
        return u.createdAt.split('T')[0] === dateStr;
      });
      const userRegistrations = dayUsers.length;

      data.push({
        dateStr,
        name: formattedDate,
        bookings: bookingCount,
        revenue: bookingRevenue,
        registrations: userRegistrations,
      });
    }
    return data;
  };

  // User management search & filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'TECH_ADMIN' | 'TECH_SUBADMIN' | 'ADMIN' | 'USER'>('ALL');

  // Active Logged-In User Sessions & Telemetry State
  const [activeSessions, setActiveSessions] = useState<ActiveUserSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'ONLINE' | 'IDLE' | 'OFFLINE'>('ALL');
  const [selectedTelemetryUser, setSelectedTelemetryUser] = useState<ActiveUserSession | null>(null);
  const [revokingSessionUid, setRevokingSessionUid] = useState<string | null>(null);

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
  const fetchListings = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoadingListings(true);
    try {
      const res = await fetch('/api/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setListings(data);
        return;
      }
    } catch {
      // ignore
    }

    // Static / Offline fallback
    try {
      const localListings = ClientStorageManager.getListings();
      setListings(localListings);
    } catch {
      // fallback
    } finally {
      if (!silent) setLoadingListings(false);
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
        return;
      }
    } catch {
      // ignore
    }

    // Static / Offline fallback
    try {
      const localUsers = ClientStorageManager.getUsers();
      setUsersList(localUsers);
    } catch {
      // fallback
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch active sessions telemetry (Tech Admin and Sub-Admin)
  const fetchActiveSessions = async () => {
    console.log(`[DEBUG] fetchActiveSessions called. Token: ${!!token}, isElevatedAdmin: ${isElevatedAdmin}`);
    if (!token || (!isTechAdmin && !isTechSubAdmin)) {
      console.log(`[DEBUG] fetchActiveSessions aborted (unauthorized)`);
      return;
    }
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/users/active-sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`[DEBUG] active-sessions response: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[DEBUG] Received sessions: ${JSON.stringify(data.sessions)}`);
        if (Array.isArray(data.sessions)) {
          setActiveSessions(data.sessions);
          return;
        }
      }
    } catch (err) {
      console.log(`[DEBUG] fetchActiveSessions error: ${err}`);
    }
    // ...


    // Static / Offline fallback for active sessions
    try {
      const activeMapRaw = localStorage.getItem('travel_active_sessions') || '{}';
      const activeMap = JSON.parse(activeMapRaw);
      const allUsers = usersList.length > 0 ? usersList : ClientStorageManager.getUsers();
      const nowMs = Date.now();

      const sessions: ActiveUserSession[] = allUsers.map(u => {
        const activeData = activeMap[u.uid];
        let lastActiveMs = 0;
        if (activeData?.lastActiveAt) {
          lastActiveMs = new Date(activeData.lastActiveAt).getTime();
        } else if (u.lastLoginAt) {
          lastActiveMs = new Date(u.lastLoginAt).getTime();
        } else if (u.createdAt) {
          lastActiveMs = new Date(u.createdAt).getTime();
        }

        const diffMin = (nowMs - lastActiveMs) / (1000 * 60);
        let status: 'ONLINE' | 'IDLE' | 'OFFLINE' = 'OFFLINE';
        if (lastActiveMs > 0 && diffMin <= 2) {
          status = 'ONLINE';
        } else if (lastActiveMs > 0 && diffMin <= 15) {
          status = 'IDLE';
        }

        return {
          uid: u.uid,
          email: u.email,
          name: u.name,
          role: u.role,
          customTitle: u.customTitle,
          department: u.department,
          status,
          lastActiveAt: activeData?.lastActiveAt || u.lastLoginAt || u.createdAt || new Date().toISOString(),
          lastLoginAt: u.lastLoginAt || u.createdAt || new Date().toISOString(),
          ipAddress: activeData?.ipAddress || u.lastLoginIp || '127.0.0.1 (Client Device)',
          browser: activeData?.browser || u.lastLoginBrowser || 'Chrome 122',
          os: activeData?.os || u.lastLoginOs || 'Windows',
          deviceType: activeData?.deviceType || 'Desktop',
          screenResolution: activeData?.screenResolution || u.lastLoginScreen || '1920x1080',
          viewport: activeData?.viewport || '1920x940',
          timezone: activeData?.timezone || u.lastLoginTimezone || 'UTC',
          mfaEnabled: u.mfaEnabled,
        };
      });

      setActiveSessions(sessions);
    } catch {
      // ignore
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (session: ActiveUserSession) => {
    if (!window.confirm(`Are you sure you want to force logout & revoke the active session for ${session.name} (${session.email})?`)) {
      return;
    }
    setRevokingSessionUid(session.uid);
    try {
      if (token) {
        await fetch(`/api/users/${session.uid}/revoke-session`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      try {
        const activeMapRaw = localStorage.getItem('travel_active_sessions') || '{}';
        const activeMap = JSON.parse(activeMapRaw);
        delete activeMap[session.uid];
        localStorage.setItem('travel_active_sessions', JSON.stringify(activeMap));
      } catch {
        // ignore
      }
      setActiveSessions(prev => prev.map(s => s.uid === session.uid ? { ...s, status: 'OFFLINE' } : s));
    } catch (err) {
      console.error('Revoke session error:', err);
    } finally {
      setRevokingSessionUid(null);
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
        return;
      }
    } catch {
      // ignore
    }

    // Static / Offline fallback
    try {
      const localLogs = ClientStorageManager.getAuditLogs(actionFilter);
      setAuditLogs(localLogs);
    } catch {
      // fallback
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch reported reviews for Admin Moderation Queue
  const fetchReportedReviews = async () => {
    if (!isElevatedAdmin) return;
    setLoadingReportedReviews(true);
    try {
      const reports = await FirebaseSyncService.getReportedReviews();
      setReportedReviews(reports);
    } catch (err) {
      console.error('Error fetching reported reviews for queue:', err);
    } finally {
      setLoadingReportedReviews(false);
    }
  };

  // Bookings data for Analytics
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchBookings = async () => {
    if (!token) return;
    setLoadingBookings(true);
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookingsList(data);
      }
    } catch (err) {
      console.error("Error fetching bookings for analytics:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Export Audit Logs as CSV or JSON compliance report
  const downloadAuditLogsCsv = () => {
    if (!auditLogs || auditLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Action', 'Performed By', 'Target ID', 'Target Type', 'Client IP', 'Details'];
    const rows = auditLogs.map(log => [
      `"${(log.id || '').replace(/"/g, '""')}"`,
      `"${(log.timestamp || '').replace(/"/g, '""')}"`,
      `"${(log.action || '').replace(/"/g, '""')}"`,
      `"${(log.performedByEmail || log.performedBy || '').replace(/"/g, '""')}"`,
      `"${(log.targetId || '').replace(/"/g, '""')}"`,
      `"${(log.targetType || '').replace(/"/g, '""')}"`,
      `"${(log.ipAddress || '').replace(/"/g, '""')}"`,
      `"${(JSON.stringify(log.details || {})).replace(/"/g, '""')}"`,
    ]);

    const csvData = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `voyage_audit_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAuditLogsJson = () => {
    if (!auditLogs || auditLogs.length === 0) return;
    const jsonString = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `voyage_audit_report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch Custom Posts templates (Super Admin)
  const fetchCustomPosts = async () => {
    try {
      const res = await fetch('/api/custom-posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomPostsList(data);
        return;
      }
    } catch {
      // ignore
    }

    // Static fallback
    try {
      const posts = ClientStorageManager.getCustomPosts();
      setCustomPostsList(posts);
    } catch {
      // ignore
    }
  };

  const handleDeleteCustomPost = (postId: string, title: string) => {
    executeWithPasskey(async () => {
      try {
        await fetch(`/api/custom-posts/${postId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        // ignore
      }
      ClientStorageManager.deleteCustomPost(postId);
      fetchCustomPosts();
      fetchLogs();
    });
  };

  // Global Escape handler for AdminPortal specific modals
  useEffect(() => {
    const handleAdminKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddAdminModal(false);
        setEditingRolePostUser(null);
        setEditingContentListing(null);
        setShowCustomPostModal(false);
        setEditingCustomPost(null);
        setShowFirebaseConsoleModal(false);
        setShowSupabaseConsoleModal(false);
        setShowProfileModal(false);
        setShowRiskConfigModal(false);
        setShowPasskeyModal(false);
        setReviewListing(null);
      }
    };
    window.addEventListener('keydown', handleAdminKeyDown);
    return () => window.removeEventListener('keydown', handleAdminKeyDown);
  }, []);

  useEffect(() => {
    if (token) {
      fetchListings();
      fetchBookings();
      if (isTechAdmin) {
        fetchUsers();
        fetchCustomPosts();
      }
      if (isElevatedAdmin) {
        fetchLogs();
        fetchReportedReviews();
        fetchActiveSessions();
      }

      // Auto poll active logged-in sessions and listings every 10 seconds for real-time accuracy
      const sessionInterval = setInterval(() => {
        fetchListings(true);
        if (isElevatedAdmin) {
          fetchActiveSessions();
        }
      }, 10000);

      return () => clearInterval(sessionInterval);
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

    const allImages = [
      ...(formData.imageUrl ? [formData.imageUrl.trim()] : []),
      ...additionalPhotos,
    ];
    const imagesToUse = allImages.length > 0 
      ? allImages 
      : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'];

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(Boolean);
    const effectiveStatus = (isElevatedAdmin && postAsSuperAdmin) ? 'PUBLISHED' : targetStatus;

    const resetListingForm = () => {
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
      setAdditionalPhotos([]);
      setNewPhotoInput('');
      setSelectedCoordinates(undefined);
      setShowMapPicker(false);
      setUploadPreview(null);
      fetchListings();
      if (onListingUpdated) onListingUpdated();
    };

    try {
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
          images: imagesToUse,
          tags: tagsArray,
          amenities: amenitiesArray,
          status: effectiveStatus,
          coordinates: selectedCoordinates,
          postAsSuperAdmin: isElevatedAdmin && postAsSuperAdmin,
        }),
      });

      if (res.ok) {
        setFormSuccessMessage(
          effectiveStatus === 'PENDING_APPROVAL'
            ? 'Listing successfully submitted to Technical Super Admin Queue for verification!'
            : effectiveStatus === 'PUBLISHED'
            ? 'Listing published directly to public explorer with Super Admin Privilege & Verified Badge!'
            : 'Draft saved to your inventory tracker.'
        );
        resetListingForm();
        await fetchListings();
        if (onListingUpdated) onListingUpdated();
        return;
      }
    } catch {
      // Backend offline - continue to static ClientStorageManager fallback
    }

    // Static / Offline fallback
    try {
      const now = new Date().toISOString();
      const newListing: Listing = {
        id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        location: formData.location,
        country: formData.country,
        description: formData.description,
        rating: 4.9,
        reviewCount: 1,
        images: imagesToUse,
        tags: tagsArray,
        amenities: amenitiesArray,
        status: effectiveStatus,
        coordinates: selectedCoordinates,
        createdBy: user?.uid || 'super_admin_001',
        createdByName: user?.name || 'Super Admin',
        approvedBy: effectiveStatus === 'PUBLISHED' ? (user?.name || 'Super Admin') : undefined,
        timestamps: {
          createdAt: now,
          updatedAt: now,
          submittedAt: effectiveStatus === 'PENDING_APPROVAL' ? now : undefined,
          approvedAt: effectiveStatus === 'PUBLISHED' ? now : undefined,
        },
      };

      ClientStorageManager.saveListing(newListing);
      await auditLog(
        effectiveStatus === 'PUBLISHED' ? 'CREATE_AND_PUBLISH_LISTING' : 'CREATE_LISTING_DRAFT',
        newListing.id,
        'LISTING',
        { title: newListing.title, status: newListing.status, adminId: user?.uid }
      );

      setFormSuccessMessage(
        effectiveStatus === 'PENDING_APPROVAL'
          ? 'Listing submitted to Technical Super Admin Queue (Offline/Static Storage)!'
          : effectiveStatus === 'PUBLISHED'
          ? 'Listing published directly with Super Admin Verified Status (Static/Local Storage)!'
          : 'Draft saved to local inventory.'
      );
      resetListingForm();
      await fetchListings();
      if (onListingUpdated) onListingUpdated();
    } catch {
      setUploadError('Error creating listing.');
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
        return;
      }
    } catch {
      // Backend offline - continue to ClientStorageManager fallback
    }

    // Static fallback
    try {
      const currentListings = ClientStorageManager.getListings();
      const item = currentListings.find(l => l.id === id);
      if (item) {
        const now = new Date().toISOString();
        item.status = newStatus;
        item.timestamps = {
          ...item.timestamps,
          updatedAt: now,
        };
        if (newStatus === 'PUBLISHED') {
          item.timestamps.approvedAt = now;
          item.approvedBy = user?.name || 'Super Admin';
        } else if (newStatus === 'REJECTED') {
          item.rejectionReason = reason;
        }
        ClientStorageManager.saveListing(item);
        await auditLog(
          newStatus === 'PUBLISHED' ? 'APPROVE_LISTING' : 'REJECT_LISTING',
          id,
          'LISTING',
          { status: newStatus, reason, adminId: user?.uid }
        );
        setReviewListing(null);
        setRejectionReason('');
        await fetchListings();
        if (isElevatedAdmin) fetchLogs();
        if (onListingUpdated) onListingUpdated();
      }
    } finally {
      setActionProcessing(false);
    }
  };

  // Delete Listing (All Admins)
  const canDeleteListing = (item: Listing) => {
    if (isAdmin) return true;
    if (user?.uid && item.createdBy === user.uid) return true;
    if (user?.email && item.createdBy === user.email) return true;
    const userPost = customPostsList.find(p => p.title === user?.customTitle);
    if (userPost?.privileges?.includes('DELETE_LISTINGS')) return true;
    return false;
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing from the master catalog?')) {
      return;
    }
    ClientStorageManager.deleteListing(id);
    try {
      await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // Static fallback
    }

    await auditLog(
      'DELETE_LISTING',
      id,
      'LISTING',
      { adminId: user?.uid, adminEmail: user?.email }
    );
    await fetchListings();
    if (isElevatedAdmin) fetchLogs();
    if (onListingUpdated) onListingUpdated();
  };

  const handleDeleteAllListings = async () => {
    if (!window.confirm('CRITICAL WARNING: Are you sure you want to permanently delete ALL listings in the master catalog? This action is irreversible and will empty the explore screen.')) {
      return;
    }
    ClientStorageManager.deleteAllListings();
    try {
      await fetch('/api/listings', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // Static fallback
    }

    await auditLog(
      'CLEAR_CATALOGUE',
      'TRAVEL_PLATFORM_CORE',
      'SYSTEM',
      { adminId: user?.uid, adminEmail: user?.email, message: 'Admin deleted all listings.' }
    );
    await fetchListings();
    if (isElevatedAdmin) fetchLogs();
    if (onListingUpdated) onListingUpdated();
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
      try {
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
          return;
        }
      } catch {
        // Static fallback
      }

      ClientStorageManager.updateUserRoleAndPost(targetUser.uid, nextRole);
      fetchUsers();
      fetchLogs();
    });
  };

  // Delete user (Tech Super Admin option)
  const handleDeleteUser = (targetUserId: string, targetEmail: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account ${targetEmail}?`)) {
      return;
    }
    executeWithPasskey(async () => {
      try {
        const res = await fetch(`/api/users/${targetUserId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          fetchUsers();
          fetchLogs();
          return;
        }
      } catch {
        // Static fallback
      }

      ClientStorageManager.deleteUser(targetUserId);
      fetchUsers();
      fetchLogs();
    });
  };

  // Moderation handlers for Reported Reviews
  const handleDismissReport = async (reviewId: string) => {
    setModeratingReviewId(reviewId);
    try {
      await FirebaseSyncService.dismissReviewReport(reviewId, user?.email || 'admin@voyage.org');
      setReportedReviews(prev => prev.filter(r => r.id !== reviewId));
      setModerationFeedback('Report dismissed. Review approved and retained in explore feed.');
      setTimeout(() => setModerationFeedback(''), 5000);
      if (isElevatedAdmin) fetchLogs();
    } catch (err) {
      console.error('Error dismissing review report:', err);
    } finally {
      setModeratingReviewId(null);
    }
  };

  const handleDeleteReportedReview = (reviewId: string, authorName: string) => {
    if (!window.confirm(`Are you sure you want to remove the review by ${authorName}? This will permanently delete it from the listing.`)) {
      return;
    }
    executeWithPasskey(async () => {
      setModeratingReviewId(reviewId);
      try {
        await FirebaseSyncService.deleteReview(reviewId, user?.email || 'admin@voyage.org');
        setReportedReviews(prev => prev.filter(r => r.id !== reviewId));
        setModerationFeedback('Violating review was permanently removed and action was recorded to the audit trail.');
        setTimeout(() => setModerationFeedback(''), 5000);
        if (isElevatedAdmin) fetchLogs();
      } catch (err) {
        console.error('Error removing reported review:', err);
      } finally {
        setModeratingReviewId(null);
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

        {/* Profile & 2FA Control Badge */}
        <div className="flex items-center gap-3">
          <button
            id="admin-profile-2fa-btn"
            type="button"
            onClick={() => setShowProfileModal(true)}
            className={`px-3 py-2 rounded-2xl border ${styles.border} ${styles.cardBg} hover:opacity-90 transition-all flex items-center gap-2 text-xs font-semibold`}
            title="Manage My Account Profile & 2FA Settings"
          >
            <ShieldCheck className={`w-4 h-4 ${user?.mfaEnabled ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>2FA Security:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${user?.mfaEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
              {user?.mfaEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </button>

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
      </div>

      {/* High-Risk Audit Action Notification Banner */}
      <HighRiskAuditBanner
        logs={auditLogs}
        onViewAuditTrail={() => setActiveTab('logs')}
        thresholdConfig={riskThresholds}
        onConfigureThresholds={() => setShowRiskConfigModal(true)}
      />

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
            {(pendingQueue.length + reportedReviews.length) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                {pendingQueue.length + reportedReviews.length}
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

        {/* Analytics & Trends (Standard & Tech) */}
        <button
          id="tab-admin-analytics"
          onClick={() => {
            setActiveTab('analytics');
            fetchBookings();
            fetchUsers();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? `${styles.accent} text-white shadow-md`
              : `${styles.buttonSecondary}`
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Analytics & Trends</span>
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

        {/* Client Login History (Tech Admin only) */}
        {isTechAdmin && (
          <button
            id="tab-admin-logins"
            onClick={() => {
              setActiveTab('logins');
              fetchActiveSessions();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logins'
                ? `${styles.accent} text-white shadow-md`
                : `${styles.buttonSecondary}`
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Client Login History</span>
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

        {/* Cloud & GitHub Sync (mukundkrishna.h@gmail.com) */}
        {isElevatedAdmin && (
          <button
            id="tab-admin-cloud"
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cloud'
                ? `${styles.accent} text-white shadow-md`
                : `${styles.buttonSecondary}`
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Cloud & GitHub Sync</span>
          </button>
        )}
      </div>

      {/* --- TAB 1: Verification Queue (Tech Admin & Sub-Admin) --- */}
      {activeTab === 'queue' && isElevatedAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                Verification & Moderation Queue
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                Review destination drafts from Standard Admins and evaluate flagged community reviews.
              </p>
            </div>
            <button
              onClick={() => {
                fetchListings();
                fetchReportedReviews();
              }}
              className={`p-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Queue Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
            <button
              id="subtab-queue-listings"
              onClick={() => setQueueSubTab('listings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                queueSubTab === 'listings'
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Pending Listings</span>
              {pendingQueue.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingQueue.length}
                </span>
              )}
            </button>

            <button
              id="subtab-queue-reviews"
              onClick={() => setQueueSubTab('reviews')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                queueSubTab === 'reviews'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-amber-500" />
              <span>Reported Reviews & Moderation</span>
              {reportedReviews.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {reportedReviews.length}
                </span>
              )}
            </button>
          </div>

          {/* Moderation Feedback Toast */}
          {moderationFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{moderationFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setModerationFeedback('')}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 text-xs"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* SUBTAB 1: Listings Pending Verification */}
          {queueSubTab === 'listings' && (
            <div>
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

          {/* SUBTAB 2: Reported Reviews Moderation Queue */}
          {queueSubTab === 'reviews' && (
            <div className="space-y-4">
              {loadingReportedReviews ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span>Scanning reported reviews queue...</span>
                </div>
              ) : reportedReviews.length === 0 ? (
                <div className={`p-10 rounded-3xl border ${styles.border} ${styles.cardBg} text-center space-y-3`}>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className={`text-base font-bold ${styles.textPrimary}`}>No Flagged Reviews</h3>
                  <p className={`text-xs ${styles.textMuted} max-w-md mx-auto`}>
                    The review moderation queue is clear. When guests flag comments for spam, inappropriate language, or policy violations, they appear here for admin review.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reportedReviews.map((rev) => (
                    <div
                      key={rev.id}
                      id={`reported-review-card-${rev.id}`}
                      className={`p-5 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          {rev.userAvatar ? (
                            <img
                              src={rev.userAvatar}
                              alt={rev.userName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm">
                              {rev.userName ? rev.userName[0].toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-bold ${styles.textPrimary}`}>{rev.userName}</span>
                              <span className="text-[11px] text-slate-400 font-mono">({rev.userEmail || 'Anonymous'})</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                                <Flag className="w-2.5 h-2.5 fill-amber-500" />
                                <span>Pending Moderation</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(st => (
                                  <Star
                                    key={st}
                                    className={`w-3 h-3 ${
                                      st <= rev.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-slate-400">• Posted on {rev.listingTitle || 'Destination Listing'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id={`dismiss-report-${rev.id}`}
                            onClick={() => handleDismissReport(rev.id)}
                            disabled={moderatingReviewId === rev.id}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5 hover:border-emerald-500/50 hover:text-emerald-600 transition-all`}
                            title="Dismiss flag and keep review published"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Dismiss Flag (Approve)</span>
                          </button>

                          <button
                            type="button"
                            id={`delete-reported-review-${rev.id}`}
                            onClick={() => handleDeleteReportedReview(rev.id, rev.userName)}
                            disabled={moderatingReviewId === rev.id}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                            title="Permanently remove violating review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Review</span>
                          </button>
                        </div>
                      </div>

                      {/* Flag Reason Callout Banner */}
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Report Reason:</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Flagged by: {rev.reportedByEmail || 'Community Member'}
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 dark:text-amber-200 font-medium pl-5">
                          {rev.reportReason || 'Unspecified community guideline concern'}
                        </p>
                      </div>

                      {/* Review Comment Quote */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                        <p className={`text-xs sm:text-sm ${styles.textPrimary} italic leading-relaxed`}>
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 1.5: Client Login History --- */}
      {activeTab === 'logins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                Client Login History
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                View the last login timestamps for all registered clients.
              </p>
            </div>
          </div>
          <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm`}>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Last Login</th>
                  <th className="p-4">Login IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
                {usersList.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-4">{u.name} ({u.email})</td>
                    <td className="p-4">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'N/A'}</td>
                    <td className="p-4">{u.lastLoginIp || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

          {/* Super Admin Privilege Toggle */}
          {isElevatedAdmin && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-bold ${styles.textPrimary} flex items-center gap-1.5`}>
                    <span>Post with Super Admin Privilege</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold uppercase tracking-wide">
                      Instant Live
                    </span>
                  </div>
                  <p className={`text-[11px] ${styles.textMuted} mt-0.5`}>
                    Bypasses standard queue, applies verified golden crown badge, and directly publishes to the public feed.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={postAsSuperAdmin}
                  onChange={(e) => setPostAsSuperAdmin(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          )}

          {/* Interactive Map & Restaurant Location Auto-Detector */}
          <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-500" />
                <span className={`text-xs font-bold ${styles.textPrimary}`}>
                  Interactive Map & Restaurant Location Auto-Detector
                </span>
                {selectedCoordinates && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    📍 {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(prev => !prev)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{showMapPicker ? 'Close Map Picker' : '🗺️ Open Map & Pick Restaurant'}</span>
              </button>
            </div>

            {showMapPicker && (
              <div className="pt-2 animate-in fade-in">
                <MapLocationPicker
                  initialCoordinates={selectedCoordinates || { lat: 35.6719, lng: 139.7640 }}
                  initialLocation={formData.location}
                  onSelectLocation={(res: LocationResult) => {
                    setFormData(prev => ({
                      ...prev,
                      location: res.location,
                      country: res.country,
                      title: prev.title.trim() ? prev.title : (res.suggestedTitle || prev.title),
                      category: res.category || prev.category,
                      tags: res.tags ? res.tags.join(', ') : prev.tags,
                      amenities: res.diningSpecialties ? res.diningSpecialties.join(', ') : prev.amenities,
                    }));
                    setSelectedCoordinates(res.coordinates);
                    setShowMapPicker(false);
                  }}
                  onClose={() => setShowMapPicker(false)}
                />
              </div>
            )}
          </div>

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
                  placeholder="Primary Photo URL (https://images.unsplash.com/...)"
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

              {/* Additional Photos for Listing */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Additional Photos ({additionalPhotos.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Add URLs to create a photo carousel</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPhotoInput}
                    onChange={(e) => setNewPhotoInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={`flex-1 p-2 text-xs rounded-xl outline-none ${styles.inputBg}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPhotoInput.trim()) {
                        e.preventDefault();
                        setAdditionalPhotos(prev => [...prev, newPhotoInput.trim()]);
                        setNewPhotoInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoInput.trim()) {
                        setAdditionalPhotos(prev => [...prev, newPhotoInput.trim()]);
                        setNewPhotoInput('');
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${styles.buttonSecondary} flex items-center gap-1`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {additionalPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {additionalPhotos.map((url, idx) => (
                      <div key={idx} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img src={url} alt={`Extra photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAdditionalPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

            {isElevatedAdmin && postAsSuperAdmin ? (
              <button
                id="publish-direct-btn"
                type="button"
                disabled={isSubmittingListing}
                onClick={() => handleSubmitListing('PUBLISHED')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Publish with Super Admin Privilege</span>
              </button>
            ) : isTechAdmin ? (
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

      {/* --- TAB: Analytics & Trends --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
              Analytics & Data Trends
            </h2>
            <p className={`text-xs ${styles.textMuted}`}>
              Visualize booking behavior, platform revenue velocity, and user registration activity over the last 30 days.
            </p>
          </div>

          {/* KPI Cards Grid */}
          {(() => {
            const bookingsCount = bookingsList.length;
            const totalRevenue = bookingsList.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
            const avgBookingVal = bookingsCount > 0 ? Math.round(totalRevenue / bookingsCount) : 0;
            const totalUsersCount = usersList.length;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
                  <div className="text-xs font-semibold text-slate-400">Total Bookings</div>
                  <div className={`text-2xl font-black mt-1 ${styles.textPrimary}`}>{bookingsCount}</div>
                  <div className="text-[10px] text-emerald-500 mt-1 font-medium">↑ 14% vs last period</div>
                </div>

                <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
                  <div className="text-xs font-semibold text-slate-400">Platform Revenue</div>
                  <div className="text-2xl font-black mt-1 text-emerald-500">${totalRevenue.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-500 mt-1 font-medium">↑ 22% vs last period</div>
                </div>

                <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
                  <div className="text-xs font-semibold text-slate-400">Average Order Value</div>
                  <div className={`text-2xl font-black mt-1 ${styles.textPrimary}`}>${avgBookingVal}</div>
                  <div className="text-[10px] text-sky-500 mt-1 font-medium">Direct Contract Rates</div>
                </div>

                <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
                  <div className="text-xs font-semibold text-slate-400">Registered Travelers</div>
                  <div className={`text-2xl font-black mt-1 ${styles.textPrimary}`}>{totalUsersCount}</div>
                  <div className="text-[10px] text-emerald-500 mt-1 font-medium">↑ 8% active rate</div>
                </div>
              </div>
            );
          })()}

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Booking & Revenue Trends */}
            <div className={`p-5 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
              <div className="mb-4">
                <h3 className={`text-sm font-bold ${styles.textPrimary}`}>Destination Booking Trends</h3>
                <p className="text-[10px] text-slate-400">Daily reservation counts and revenue velocity (30d)</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getPast30DaysData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="opacity-20" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#475569', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#f8fafc' 
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" name="Revenue ($)" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area yAxisId="right" type="monotone" name="Bookings" dataKey="bookings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Registration Activity */}
            <div className={`p-5 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
              <div className="mb-4">
                <h3 className={`text-sm font-bold ${styles.textPrimary}`}>User Registration Activity</h3>
                <p className="text-[10px] text-slate-400">New traveler account enrollments (30d)</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getPast30DaysData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="opacity-20" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#475569', 
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#f8fafc' 
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar name="New Registrations" dataKey="registrations" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Lower Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category Booking Breakdown */}
            <div className={`p-5 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm flex flex-col justify-between`}>
              <div>
                <h3 className={`text-sm font-bold ${styles.textPrimary}`}>Category Booking Breakdown</h3>
                <p className="text-[10px] text-slate-400">Total bookings split by destination types</p>
              </div>

              {(() => {
                const categories = { PLACE: 0, HOTEL: 0, FOOD: 0 };
                bookingsList.forEach(b => {
                  if (categories[b.listingCategory] !== undefined) {
                    categories[b.listingCategory]++;
                  }
                });

                const pieData = [
                  { name: 'Places/Sights', value: categories.PLACE, color: '#f43f5e' },
                  { name: 'Hotels/Stays', value: categories.HOTEL, color: '#0ea5e9' },
                  { name: 'Culinary/Dining', value: categories.FOOD, color: '#10b981' },
                ].filter(item => item.value > 0);

                if (pieData.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No categories to display. Place bookings to see category distribution.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                    <div className="h-44 w-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 text-xs flex-1">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                          </div>
                          <span className={`font-bold ${styles.textPrimary}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Popular Booked Destinations List */}
            <div className={`p-5 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm lg:col-span-2`}>
              <div className="mb-4">
                <h3 className={`text-sm font-bold ${styles.textPrimary}`}>Most Requested Destinations</h3>
                <p className="text-[10px] text-slate-400">The most popular bookings requested by travelers</p>
              </div>

              {bookingsList.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No direct bookings have been placed yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(() => {
                    // Count destinations
                    const counts: Record<string, { count: number; title: string; image: string; category: string; revenue: number }> = {};
                    bookingsList.forEach(b => {
                      if (!counts[b.listingId]) {
                        counts[b.listingId] = {
                          count: 0,
                          title: b.listingTitle,
                          image: b.listingImage,
                          category: b.listingCategory,
                          revenue: 0,
                        };
                      }
                      counts[b.listingId].count++;
                      counts[b.listingId].revenue += b.totalPrice;
                    });

                    const popularList = Object.values(counts)
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 4);

                    return popularList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className={`text-xs font-bold ${styles.textPrimary}`}>{item.title}</div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">{item.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-bold ${styles.textPrimary}`}>{item.count} Bookings</div>
                          <div className="text-[10px] text-emerald-500 font-semibold">${item.revenue.toLocaleString()} Revenue</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

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
            <div className="flex items-center gap-2">
              {(isTechAdmin || isElevatedAdmin) && (
                <button
                  onClick={handleDeleteAllListings}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-all"
                  title="Delete all listings from platform"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Entire Catalog</span>
                </button>
              )}
              <button
                onClick={() => fetchListings()}
                className={`p-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
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
                            {/* Option for ALL admins to add new photo and description */}
                            <button
                              onClick={() => setEditingContentListing(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                              title="Edit Photos & Description"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {item.status === 'PUBLISHED' && onNavigateExplore && (
                              <button
                                onClick={onNavigateExplore}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500"
                                title="View in Explorer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                            {canDeleteListing(item) && (
                              <button
                                onClick={() => handleDeleteListing(item.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Delete Listing from Catalog"
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
        <div className="space-y-6">
          {/* User 2FA Adoption & Security Summary Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdminSecurityAdoptionCard users={usersList} />
            </div>
            <div className="lg:col-span-1">
              <SecurityOverviewCard users={usersList} />
            </div>
          </div>

          {/* --- LIVE LOGGED-IN USERS TELEMETRY HUB --- */}
          <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} space-y-4 shadow-sm`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-extrabold ${styles.textPrimary}`}>
                      Live Active Logged-In Users & Session Telemetry
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {activeSessions.filter(s => s.status === 'ONLINE').length} ONLINE NOW
                    </span>
                  </div>
                  <p className={`text-xs ${styles.textMuted}`}>
                    Real-time monitoring of currently logged-in users, client IP addresses, browser versions, operating systems, and active security sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fetchActiveSessions()}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refresh Sessions</span>
                </button>
              </div>
            </div>

            {/* Live Session Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Online Now</div>
                <div className="text-xl font-extrabold text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  {activeSessions.filter(s => s.status === 'ONLINE').length}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Idle Sessions</div>
                <div className="text-xl font-extrabold text-amber-500 mt-0.5">
                  {activeSessions.filter(s => s.status === 'IDLE').length}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total Registered</div>
                <div className="text-xl font-extrabold text-sky-400 mt-0.5">
                  {usersList.length} Accounts
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">2FA Protected</div>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">
                  {usersList.filter(u => u.mfaEnabled).length} Users
                </div>
              </div>
            </div>

            {/* Filter Pills for Active Sessions */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto">
              {(['ALL', 'ONLINE', 'IDLE', 'OFFLINE'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSessionFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    sessionFilter === st
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All User Sessions' : st === 'ONLINE' ? '🟢 Online Now' : st === 'IDLE' ? '🟡 Idle' : '⚪ Offline'}
                </button>
              ))}
            </div>

            {/* Active Sessions Grid / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {activeSessions
                .filter(s => sessionFilter === 'ALL' || s.status === sessionFilter)
                .map((session) => {
                  const isOnline = session.status === 'ONLINE';
                  const isIdle = session.status === 'IDLE';

                  return (
                    <div
                      key={session.uid}
                      className={`p-4 rounded-2xl border transition-all ${
                        isOnline
                          ? 'bg-emerald-950/10 border-emerald-500/30 dark:bg-emerald-950/20 shadow-sm'
                          : isIdle
                          ? 'bg-amber-950/10 border-amber-500/30 dark:bg-amber-950/20'
                          : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : isIdle ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {session.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">{session.name}</div>
                            <div className="text-[10px] text-sky-400 font-mono line-clamp-1">{session.email}</div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 flex items-center gap-1 ${
                          isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : isIdle ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : isIdle ? 'bg-amber-500' : 'bg-slate-500'}`} />
                          {isOnline ? 'ONLINE' : isIdle ? 'IDLE' : 'OFFLINE'}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-400">Client IP:</span>
                          <span className="font-mono font-bold text-slate-300">{session.ipAddress}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Device & OS:</span>
                          <span className="font-semibold text-slate-200">{session.browser} ({session.os})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Last Active:</span>
                          <span className="font-mono text-emerald-400">
                            {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedTelemetryUser(session)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Telemetry</span>
                        </button>

                        {isOnline && (
                          <button
                            onClick={() => handleRevokeSession(session)}
                            disabled={revokingSessionUid === session.uid}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 transition-colors flex items-center gap-1"
                            title="Force Disconnect Active Session"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary} flex items-center gap-2`}>
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>User & Admin Privilege Administration</span>
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                Create custom posts with granular privileges, search accounts, designate official titles & departments, and promote or demote administrator permissions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="create-custom-post-btn"
                onClick={() => {
                  setEditingCustomPost(null);
                  setShowCustomPostModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md flex items-center gap-1.5 transition-all"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Make Custom Post (Special Window)</span>
              </button>
              <button
                id="open-firebase-console-btn"
                onClick={() => setShowFirebaseConsoleModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 shadow-md flex items-center gap-1.5 transition-all"
              >
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Firebase Cloud Database</span>
              </button>
              <button
                id="open-supabase-console-btn"
                onClick={() => setShowSupabaseConsoleModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 shadow-md flex items-center gap-1.5 transition-all"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Cloud Database</span>
              </button>
              <button
                id="add-new-admin-btn"
                onClick={() => setShowAddAdminModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5 text-emerald-100" />
                <span>Add & Save User</span>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Travel Post</span>
              </button>
              <button
                onClick={() => {
                  fetchUsers();
                  fetchCustomPosts();
                }}
                className={`p-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5`}
                title="Refresh user and custom post database"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Custom Post & Privilege Templates Showcase Matrix */}
          <div className={`p-4 rounded-3xl border ${styles.border} ${styles.cardBg} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.textPrimary}`}>
                  Custom Post Designation Templates ({customPostsList.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingCustomPost(null);
                  setShowCustomPostModal(true);
                }}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Custom Post Window</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customPostsList.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                        {post.title}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        {post.baseRole}
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-500 font-semibold">{post.department}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {post.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex flex-wrap gap-1">
                      {post.privileges?.slice(0, 3).map((priv) => (
                        <span key={priv} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {priv.replace('_', ' ')}
                        </span>
                      ))}
                      {(post.privileges?.length || 0) > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">
                          +{(post.privileges?.length || 0) - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] text-slate-500 font-mono">ID: {post.id.slice(0, 12)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCustomPost(post);
                            setShowCustomPostModal(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Edit Custom Post"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomPost(post.id, post.title)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Custom Post"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3`}>
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search specific email (e.g. mukundkrishna.h@gmail.com), name, post, or department..."
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter by Role */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'TECH_ADMIN', 'TECH_SUBADMIN', 'ADMIN', 'USER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                    userRoleFilter === r
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r === 'TECH_ADMIN' ? 'Super Admin' : r === 'TECH_SUBADMIN' ? 'Sub-Admin' : r === 'ADMIN' ? 'Admin' : 'User'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className={`rounded-3xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 w-4">
                      <input
                        type="checkbox"
                        checked={selectAllUsers}
                        onChange={(e) => {
                          setSelectAllUsers(e.target.checked);
                          if (e.target.checked) {
                            setSelectedUserUids(new Set(usersList.map(u => u.uid)));
                          } else {
                            setSelectedUserUids(new Set());
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="p-4">User & Email</th>
                    <th className="p-4">Assigned Post / Designation</th>
                    <th className="p-4">Phone / MFA</th>
                    <th className="p-4">Role Tier</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4">Account Created</th>
                    <th className="p-4">Last Password Update</th>
                    <th className="p-4">Recovery Contact</th>
                    <th className="p-4 text-right">Privilege & Designation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
                  {(() => {
                    const query = userSearchQuery.trim().toLowerCase();
                    const filtered = usersList.filter(u => {
                      const matchesSearch = !query || 
                        u.email.toLowerCase().includes(query) ||
                        u.name.toLowerCase().includes(query) ||
                        (u.customTitle && u.customTitle.toLowerCase().includes(query)) ||
                        (u.department && u.department.toLowerCase().includes(query));
                      
                      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                      return matchesSearch && matchesRole;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No user records match "{userSearchQuery}". You can register this email with any role using the "Add User & Post" button above.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map(u => (
                      <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 w-4">
                          <input
                            type="checkbox"
                            checked={selectedUserUids.has(u.uid)}
                            onChange={(e) => {
                              const next = new Set(selectedUserUids);
                              if (e.target.checked) {
                                next.add(u.uid);
                              } else {
                                next.delete(u.uid);
                              }
                              setSelectedUserUids(next);
                              setSelectAllUsers(next.size === usersList.length);
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                u.role === 'TECH_ADMIN' ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-200 dark:bg-slate-800'
                              }`}>
                                {u.name.charAt(0)}
                              </div>
                              <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                                 (u.status || 'ACTIVE') === 'ACTIVE' ? 'bg-emerald-500' :
                                 (u.status || 'ACTIVE') === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                              }`} title={u.status || 'ACTIVE'} />
                            </div>
                            <div>
                              <div className={`font-bold ${styles.textPrimary}`}>{u.name}</div>
                              <div className="text-[10px] text-sky-400 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-xs text-amber-500 dark:text-amber-400">
                            {u.customTitle || (u.role === 'TECH_ADMIN' ? 'Chief Technology Architect' : u.role === 'ADMIN' ? 'Destination Content Curator' : 'Traveler')}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {u.department || 'Platform Operations'}
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
                              : u.role === 'TECH_SUBADMIN'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold'
                              : u.role === 'ADMIN'
                              ? 'bg-sky-500/20 text-sky-500 border border-sky-500/30'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px] font-mono">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Never'}
                        </td>
                        <td className="p-4 text-slate-400 text-[11px] font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="p-4 text-slate-400 text-[11px] font-mono">
                          {u.lastPasswordUpdateAt ? new Date(u.lastPasswordUpdateAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="p-4 text-slate-400 text-[11px] font-mono">
                          {u.recoveryEmail || 'None configured'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Super Admin Set Password Button */}
                            <button
                              onClick={() => setSetPasswordModalUser(u)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 border border-teal-500/30 transition-all flex items-center gap-1"
                              title="Super Admin: Set or Reset User Password"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Set Password</span>
                            </button>

                            {/* Promote & Assign Post Modal Button */}
                            <button
                              onClick={() => setEditingRolePostUser(u)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1"
                              title="Promote and assign official designation / post"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Promote / Edit Post</span>
                            </button>

                            {(u.status || 'ACTIVE') === 'SUSPENDED' && (
                              <button
                                onClick={() => {
                                  ClientStorageManager.updateUserStatus(u.uid, 'ACTIVE');
                                  setUsersList(ClientStorageManager.getUsers());
                                }}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1"
                                title="Restore User Access"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                            )}

                            {u.role !== 'TECH_ADMIN' && (
                              <>
                                <button
                                  onClick={() => handleToggleUserRole(u)}
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                    u.role === 'ADMIN' || u.role === 'TECH_SUBADMIN'
                                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30'
                                      : 'bg-sky-500 text-white hover:bg-sky-400'
                                  }`}
                                >
                                  {u.role === 'ADMIN' || u.role === 'TECH_SUBADMIN' ? 'Demote' : 'Quick Admin'}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u.uid, u.email)}
                                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                                  title="Delete User (Super Admin)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: Security Audit Logs (Tech Admin & Sub-Admin) --- */}
      {activeTab === 'logs' && isElevatedAdmin && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className={`text-lg font-bold ${styles.textPrimary}`}>
                System Security & Modification Audit Trail
              </h2>
              <p className={`text-xs ${styles.textMuted}`}>
                Immutable security logs tracking logins, emergency bypass attempts, rate limiting, and administrative database writes.
              </p>
            </div>
          </div>

          {/* Visual Recharts Analytics Dashboard */}
          <AuditVisualDashboard logs={auditLogs} />

          {/* Chronological Security & 2FA Audit Trail Dashboard */}
          <AuditTrailDashboard logs={auditLogs} onRefresh={() => fetchLogs(logFilter)} />

          {/* Interactive AuditLogViewer Component */}
          <AuditLogViewer
            logs={auditLogs}
            onRefresh={() => fetchLogs(logFilter)}
            onExportCsv={downloadAuditLogsCsv}
            onExportJson={downloadAuditLogsJson}
            logFilter={logFilter}
            onFilterChange={(newFilter) => {
              setLogFilter(newFilter);
              fetchLogs(newFilter);
            }}
          />
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

      {/* --- ADD ADMIN / USER MODAL --- */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onAdminCreated={(newUser) => {
          setUsersList(prev => [newUser, ...prev.filter(u => u.uid !== newUser.uid)]);
          setShowAddAdminModal(false);
          fetchLogs();
        }}
      />

      {/* --- SET USER PASSWORD MODAL (SUPER ADMIN PRIVILEGE) --- */}
      <SetPasswordModal
        isOpen={!!setPasswordModalUser}
        user={setPasswordModalUser}
        onClose={() => setSetPasswordModalUser(null)}
        onPasswordUpdated={(updatedUser) => {
          setUsersList(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
          setSetPasswordModalUser(null);
          fetchLogs();
        }}
      />

      {/* --- EDIT ROLE & ASSIGNED POST MODAL --- */}
      <EditRolePostModal
        isOpen={!!editingRolePostUser}
        user={editingRolePostUser}
        onClose={() => setEditingRolePostUser(null)}
        onUserUpdated={(updatedUser) => {
          setUsersList(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
          setEditingRolePostUser(null);
          fetchLogs();
        }}
        onOpenCustomPostCreator={() => {
          setEditingCustomPost(null);
          setShowCustomPostModal(true);
        }}
      />

      {/* --- CUSTOM POST CREATOR MODAL (SPECIAL WINDOW) --- */}
      <CustomPostCreatorModal
        isOpen={showCustomPostModal}
        onClose={() => {
          setShowCustomPostModal(false);
          setEditingCustomPost(null);
        }}
        postToEdit={editingCustomPost}
        onPostSaved={(savedPost) => {
          fetchCustomPosts();
          fetchLogs();
        }}
      />

      {/* --- FIREBASE CLOUD DATABASE CONSOLE MODAL --- */}
      <FirebaseConsoleModal
        isOpen={showFirebaseConsoleModal}
        onClose={() => setShowFirebaseConsoleModal(false)}
        onSyncCompleted={() => {
          fetchCustomPosts();
          fetchUsers();
          fetchListings();
          fetchLogs();
        }}
      />

      {/* --- SUPABASE CLOUD DATABASE CONSOLE MODAL --- */}
      <SupabaseConsoleModal
        isOpen={showSupabaseConsoleModal}
        onClose={() => setShowSupabaseConsoleModal(false)}
        onSyncCompleted={() => {
          fetchCustomPosts();
          fetchUsers();
          fetchListings();
          fetchLogs();
        }}
      />

      {/* --- EDIT CONTENT LISTING MODAL --- */}
      {editingContentListing && (
        <EditContentModal
          isOpen={!!editingContentListing}
          listing={editingContentListing}
          onClose={() => setEditingContentListing(null)}
          onListingUpdated={() => {
            fetchListings();
            setEditingContentListing(null);
            if (onListingUpdated) onListingUpdated();
          }}
        />
      )}

      {/* --- USER PROFILE & 2FA MODAL --- */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* --- RISK THRESHOLD CONFIG MODAL --- */}
      <RiskThresholdConfigModal
        isOpen={showRiskConfigModal}
        onClose={() => setShowRiskConfigModal(false)}
        config={riskThresholds}
        onSaveConfig={(newConfig) => {
          setRiskThresholds(newConfig);
          localStorage.setItem('voyage_risk_thresholds', JSON.stringify(newConfig));
          setShowRiskConfigModal(false);
        }}
      />

      {/* --- ACTIVE USER SESSION TELEMETRY INSPECTOR MODAL --- */}
      <ActiveSessionTelemetryModal
        isOpen={!!selectedTelemetryUser}
        session={selectedTelemetryUser}
        onClose={() => setSelectedTelemetryUser(null)}
        onRevokeSession={(session) => handleRevokeSession(session)}
        onSetPassword={(email) => {
          const u = usersList.find(x => x.email === email);
          if (u) setSetPasswordModalUser(u);
        }}
        onEditRolePost={(session) => {
          const u = usersList.find(x => x.uid === session.uid);
          if (u) setEditingRolePostUser(u);
        }}
      />

    </div>
  );
};
