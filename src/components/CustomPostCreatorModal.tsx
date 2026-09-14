import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  X, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Shield, 
  Sparkles, 
  Flame, 
  Database,
  Lock,
  Layers,
  FileCheck2,
  Trash2,
  Eye,
  Sliders,
  Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { CustomPost, PostPrivilege, UserRole } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { FirebaseSyncService } from '../services/firebase.ts';

interface CustomPostCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSaved: (post: CustomPost) => void;
  postToEdit?: CustomPost | null;
}

interface PrivilegeOption {
  id: PostPrivilege;
  label: string;
  category: 'CONTENT' | 'GOVERNANCE' | 'SECURITY' | 'CLOUD';
  description: string;
  icon: React.ElementType;
}

const AVAILABLE_PRIVILEGES: PrivilegeOption[] = [
  {
    id: 'PUBLISH_DIRECTLY',
    label: 'Direct Publishing',
    category: 'CONTENT',
    description: 'Bypass review queue and publish travel listings directly to the live explorer.',
    icon: Sparkles
  },
  {
    id: 'APPROVE_QUEUE',
    label: 'Approve Submission Queue',
    category: 'GOVERNANCE',
    description: 'Review pending draft listings submitted by standard administrators and approve them.',
    icon: FileCheck2
  },
  {
    id: 'REJECT_QUEUE',
    label: 'Reject Submission Queue',
    category: 'GOVERNANCE',
    description: 'Reject pending listings with detailed feedback notes back to submitters.',
    icon: Sliders
  },
  {
    id: 'EDIT_ALL_CONTENT',
    label: 'Edit Any Travel Listing',
    category: 'CONTENT',
    description: 'Modify photos, pricing, amenities, and details on any listing in the catalog.',
    icon: Layers
  },
  {
    id: 'DELETE_LISTINGS',
    label: 'Delete Travel Listings',
    category: 'CONTENT',
    description: 'Permanently remove listings and destinations from the database.',
    icon: Trash2
  },
  {
    id: 'MANAGE_USERS',
    label: 'Manage Users & Admins',
    category: 'SECURITY',
    description: 'Register, edit credentials, and modify administrative privileges for platform users.',
    icon: ShieldCheck
  },
  {
    id: 'ASSIGN_POSTS',
    label: 'Assign Official Posts & Titles',
    category: 'SECURITY',
    description: 'Promote users and assign custom designated administrative posts.',
    icon: Briefcase
  },
  {
    id: 'VIEW_AUDIT_LOGS',
    label: 'View Security Audit Logs',
    category: 'SECURITY',
    description: 'Access full system forensic audit logs, login timestamps, and IP addresses.',
    icon: Eye
  },
  {
    id: 'FIREBASE_CONSOLE_SYNC',
    label: 'Firebase Cloud DB Sync',
    category: 'CLOUD',
    description: 'Execute live cloud database synchronization with Firebase Firestore collections.',
    icon: Database
  },
  {
    id: 'BYPASS_SECURITY_2FA',
    label: 'Emergency Security Bypass',
    category: 'SECURITY',
    description: 'Use recovery email credentials and emergency bypass authentication routes.',
    icon: Lock
  }
];

const PRESET_TEMPLATES: Partial<CustomPost>[] = [
  {
    title: 'Lead Destination & Hotel Curator',
    department: 'Content & Editorial',
    baseRole: 'ADMIN',
    description: 'Responsible for curating luxury destinations and editing curated hotel collections.',
    privileges: ['PUBLISH_DIRECTLY', 'EDIT_ALL_CONTENT'],
    badgeColor: 'sky'
  },
  {
    title: 'Senior Information Security Architect',
    department: 'Information Security',
    baseRole: 'TECH_SUBADMIN',
    description: 'Monitors audit logs, evaluates security compliance, and oversees verification queues.',
    privileges: ['APPROVE_QUEUE', 'REJECT_QUEUE', 'VIEW_AUDIT_LOGS', 'FIREBASE_CONSOLE_SYNC'],
    badgeColor: 'purple'
  },
  {
    title: 'Executive Platform Director',
    department: 'Platform Operations',
    baseRole: 'TECH_ADMIN',
    description: 'Full strategic oversight of content moderation, cloud synchronization, and user administration.',
    privileges: [
      'PUBLISH_DIRECTLY',
      'APPROVE_QUEUE',
      'REJECT_QUEUE',
      'MANAGE_USERS',
      'ASSIGN_POSTS',
      'VIEW_AUDIT_LOGS',
      'DELETE_LISTINGS',
      'EDIT_ALL_CONTENT',
      'FIREBASE_CONSOLE_SYNC'
    ],
    badgeColor: 'amber'
  }
];

export const CustomPostCreatorModal: React.FC<CustomPostCreatorModalProps> = ({
  isOpen,
  onClose,
  onPostSaved,
  postToEdit
}) => {
  const { styles } = useTheme();
  const { user, token } = useAuth();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [baseRole, setBaseRole] = useState<UserRole>('ADMIN');
  const [description, setDescription] = useState('');
  const [privileges, setPrivileges] = useState<PostPrivilege[]>(['PUBLISH_DIRECTLY']);
  const [badgeColor, setBadgeColor] = useState<'amber' | 'purple' | 'sky' | 'emerald' | 'rose' | 'indigo'>('sky');
  const [syncToFirebase, setSyncToFirebase] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setDepartment(postToEdit.department);
      setBaseRole(postToEdit.baseRole);
      setDescription(postToEdit.description);
      setPrivileges(postToEdit.privileges || []);
      setBadgeColor(postToEdit.badgeColor || 'sky');
    } else {
      setTitle('');
      setDepartment('');
      setBaseRole('ADMIN');
      setDescription('');
      setPrivileges(['PUBLISH_DIRECTLY', 'EDIT_ALL_CONTENT']);
      setBadgeColor('sky');
    }
    setError('');
    setSuccess('');
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const togglePrivilege = (privId: PostPrivilege) => {
    setPrivileges(prev => 
      prev.includes(privId) ? prev.filter(p => p !== privId) : [...prev, privId]
    );
  };

  const applyPreset = (preset: Partial<CustomPost>) => {
    if (preset.title) setTitle(preset.title);
    if (preset.department) setDepartment(preset.department);
    if (preset.baseRole) setBaseRole(preset.baseRole);
    if (preset.description) setDescription(preset.description);
    if (preset.privileges) setPrivileges(preset.privileges);
    if (preset.badgeColor) setBadgeColor(preset.badgeColor);
  };

  const selectAllPrivileges = () => {
    setPrivileges(AVAILABLE_PRIVILEGES.map(p => p.id));
  };

  const clearAllPrivileges = () => {
    setPrivileges([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a post title / designation.');
      return;
    }
    if (!department.trim()) {
      setError('Please provide a department name.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const newPost: CustomPost = {
      id: postToEdit?.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      department: department.trim(),
      baseRole,
      description: description.trim() || 'Custom designated administrative post with configured privileges.',
      privileges,
      badgeColor,
      createdBy: user?.email || 'mukundkrishna2008@gmail.com',
      createdAt: postToEdit?.createdAt || new Date().toISOString()
    };

    try {
      // 1. Backend API (if available)
      try {
        await fetch('/api/custom-posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newPost)
        });
      } catch {
        // Backend fallback
      }

      // 2. ClientStorageManager persistence
      ClientStorageManager.saveCustomPost(newPost);

      // 3. Direct Firebase Cloud Sync (if toggled)
      if (syncToFirebase) {
        await FirebaseSyncService.saveCustomPost(newPost);
      }

      setSuccess(`Post "${newPost.title}" saved successfully with ${privileges.length} privileges!`);
      onPostSaved(newPost);
      setTimeout(() => {
        onClose();
      }, 1100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving custom post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const badgeColorClasses: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-5 sm:p-7 relative space-y-5 max-h-[92vh] overflow-y-auto`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg sm:text-xl font-bold ${styles.textPrimary}`}>
                {postToEdit ? 'Edit Custom Post & Privileges' : 'Create Custom Post Window'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Super Admin Tool
              </span>
            </div>
            <p className={`text-xs ${styles.textMuted} mt-0.5`}>
              Design custom organizational designations with granular permissions to assign in User & Admin Privilege Administration.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Quick Starter Presets */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Start Templates:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-slate-300 font-medium transition-all shadow-xs"
              >
                + {p.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Post Title / Designation *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Travel Architect, Senior Security Lead..."
                className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Department / Team *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Executive Engineering, Content & Editorial..."
                className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
            </div>
          </div>

          {/* Underlying Base Role Tier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Underlying Administrative Role Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { r: 'TECH_ADMIN', label: 'Super Admin', color: 'amber', icon: ShieldCheck },
                { r: 'TECH_SUBADMIN', label: 'Sub-Admin', color: 'purple', icon: Shield },
                { r: 'ADMIN', label: 'Admin', color: 'sky', icon: Sliders },
                { r: 'USER', label: 'Traveler / User', color: 'emerald', icon: Briefcase }
              ].map(({ r, label, color, icon: IconComponent }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setBaseRole(r as UserRole)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                    baseRole === r
                      ? `border-${color}-500 bg-${color}-500/10 text-${color}-400 font-bold shadow-xs`
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Role Mandate & Scope Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this post's responsibilities and permissions..."
              className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
            />
          </div>

          {/* Badge Color & Preview */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400">Badge Theme:</span>
              <div className="flex items-center gap-1.5 ml-1">
                {(['amber', 'purple', 'sky', 'emerald', 'rose', 'indigo'] as const).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBadgeColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === 'amber' ? 'bg-amber-500' :
                      color === 'purple' ? 'bg-purple-500' :
                      color === 'sky' ? 'bg-sky-500' :
                      color === 'emerald' ? 'bg-emerald-500' :
                      color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
                    } ${badgeColor === color ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            {/* Live Badge Preview */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Preview:</span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeColorClasses[badgeColor]}`}>
                {title || 'Official Designation'}
              </span>
            </div>
          </div>

          {/* Granular Privilege Selector Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Selected Privileges ({privileges.length} of {AVAILABLE_PRIVILEGES.length})</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllPrivileges}
                  className="text-[11px] text-sky-400 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={clearAllPrivileges}
                  className="text-[11px] text-slate-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_PRIVILEGES.map((priv) => {
                const isSelected = privileges.includes(priv.id);
                const IconComp = priv.icon;
                return (
                  <div
                    key={priv.id}
                    onClick={() => togglePrivilege(priv.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                      isSelected
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 opacity-75'
                    }`}
                  >
                    <div className={`mt-0.5 p-1 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{priv.label}</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-400'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {priv.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Firebase Cloud Sync Toggle */}
          <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-amber-400">Live Firebase Firestore Sync</div>
                <div className="text-[10px] text-slate-400">Save template to Cloud Firestore collection `/custom_posts`</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={syncToFirebase}
                onChange={(e) => setSyncToFirebase(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md flex items-center gap-1.5`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Post Template...' : 'Save Custom Post & Privileges'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
