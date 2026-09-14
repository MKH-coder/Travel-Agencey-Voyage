import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, X, AlertTriangle, CheckCircle2, Award, Briefcase, Building2, Sparkles, PlusCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole, User, CustomPost } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';

interface EditRolePostModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
  onOpenCustomPostCreator?: () => void;
}

export const EditRolePostModal: React.FC<EditRolePostModalProps> = ({
  isOpen,
  user,
  onClose,
  onUserUpdated,
  onOpenCustomPostCreator,
}) => {
  const { styles } = useTheme();
  const { token } = useAuth();

  const [role, setRole] = useState<UserRole>('ADMIN');
  const [customTitle, setCustomTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [availablePosts, setAvailablePosts] = useState<CustomPost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      const posts = ClientStorageManager.getCustomPosts();
      setAvailablePosts(posts);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setCustomTitle(user.customTitle || '');
      setDepartment(user.department || '');
      setSelectedPostId(user.customPostId || '');
      setError('');
      setSuccess('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSelectCustomPost = (post: CustomPost) => {
    setSelectedPostId(post.id);
    setCustomTitle(post.title);
    setDepartment(post.department);
    setRole(post.baseRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // 1. Try server endpoint
      const res = await fetch(`/api/users/${user.uid}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          customTitle: customTitle.trim() || undefined,
          department: department.trim() || undefined,
          customPostId: selectedPostId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Updated ${user.name}'s role and post successfully!`);
        onUserUpdated(data.user);
        setTimeout(() => {
          onClose();
        }, 1000);
        return;
      }
    } catch {
      // Backend not accessible / static host fallback
    }

    // 2. ClientStorageManager fallback
    try {
      const updated = ClientStorageManager.updateUserRoleAndPost(
        user.uid,
        role,
        customTitle.trim() || undefined,
        department.trim() || undefined
      );
      if (updated) {
        setSuccess(`Updated ${user.name}'s role to ${role} (${customTitle || 'Standard'})!`);
        onUserUpdated(updated);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError('Failed to update user privilege.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className={`w-full max-w-lg rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 sm:p-8 relative space-y-5 max-h-[90vh] overflow-y-auto`}>
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
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
              Promote & Assign Post / Designation
            </h3>
            <p className={`text-xs ${styles.textMuted}`}>
              Configure access tier, custom post designation, and department for <span className="font-semibold text-sky-400">{user.email}</span>.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Custom Post Templates Section */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                <span>Select From Defined Custom Posts</span>
              </label>
              {onOpenCustomPostCreator && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCustomPostCreator();
                  }}
                  className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Create New Post</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {availablePosts.map((p) => {
                const isSelected = selectedPostId === p.id || customTitle === p.title;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectCustomPost(p)}
                    className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{p.title}</div>
                      <div className="text-[10px] text-slate-400">{p.department} • {p.baseRole}</div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {p.privileges?.length || 0} privs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Administrative Tier & Permissions *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  role === 'TECH_ADMIN'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="userRole"
                  value="TECH_ADMIN"
                  checked={role === 'TECH_ADMIN'}
                  onChange={() => setRole('TECH_ADMIN')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Technical Super Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Root privileges, user promotion, audit trail & direct publish.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  role === 'TECH_SUBADMIN'
                    ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="userRole"
                  value="TECH_SUBADMIN"
                  checked={role === 'TECH_SUBADMIN'}
                  onChange={() => setRole('TECH_SUBADMIN')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Technical Sub-Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Verification queue moderation and direct publishing.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  role === 'ADMIN'
                    ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="userRole"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs">Standard Admin</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Create drafts & submit content for review.
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  role === 'USER'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="userRole"
                  value="USER"
                  checked={role === 'USER'}
                  onChange={() => setRole('USER')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs">Verified Traveler (User)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Standard member account without admin access.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                <span>Assigned Post / Official Title</span>
              </label>
              <span className="text-[10px] text-slate-400">Custom Title</span>
            </div>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Lead Content Editor, Regional Destination Manager..."
              className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Department / Team</span>
              </label>
            </div>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Executive Engineering, Content & Editorial..."
              className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
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
              <Award className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Privilege...' : 'Save Role & Assigned Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
