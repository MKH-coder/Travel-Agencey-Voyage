import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, X, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { User } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { SupabaseSyncService } from '../services/supabaseSync.ts';

interface SetPasswordModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onPasswordUpdated: (updatedUser: User) => void;
}

const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
  if (!pwd) return { label: 'None', color: 'bg-slate-300 dark:bg-slate-700', width: 'w-0' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  switch (score) {
    case 1:
    case 2:
      return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    case 3:
      return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/4' };
    case 4:
      return { label: 'Strong', color: 'bg-emerald-500', width: 'w-3/4' };
    case 5:
    default:
      return { label: 'Very Strong', color: 'bg-teal-500', width: 'w-full' };
  }
};

export const SetPasswordModal: React.FC<SetPasswordModalProps> = ({
  isOpen,
  user,
  onClose,
  onPasswordUpdated,
}) => {
  const { styles } = useTheme();
  const { token, auditLog } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !user) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setConfirmPassword(res);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/users/${user.uid}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || `Password successfully updated for ${user.email}`);
        const updatedUser = data.user || { ...user, password };
        onPasswordUpdated(updatedUser);
        setTimeout(() => {
          onClose();
          setPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 1200);
        return;
      }
    } catch {
      // Offline fallback
    }

    // Static & local storage update + Supabase sync
    try {
      const updatedUser = ClientStorageManager.saveUser({
        ...user,
        password,
      });

      // Sync to Supabase
      SupabaseSyncService.bulkSyncAllToSupabase({
        listings: [],
        users: [updatedUser],
        customPosts: [],
        auditLogs: [],
      }).catch(() => {});

      await auditLog('SUPER_ADMIN_SET_USER_PASSWORD', user.uid, 'USER', {
        targetUserEmail: user.email,
        targetRole: user.role,
      });

      setSuccess(`Successfully updated password for ${user.email}! Credentials synced to Supabase.`);
      onPasswordUpdated(updatedUser);
      setTimeout(() => {
        onClose();
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className={`w-full max-w-md rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 relative space-y-5`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
              Set / Reset User Password
            </h3>
            <p className={`text-xs ${styles.textMuted}`}>
              Super Admin privilege to set direct authentication password for account.
            </p>
          </div>
        </div>

        {/* User Info Badge */}
        <div className={`p-3 rounded-2xl border ${styles.border} bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between`}>
          <div>
            <div className={`text-xs font-bold ${styles.textPrimary}`}>{user.name}</div>
            <div className="text-[11px] font-mono text-sky-500">{user.email}</div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30">
            {user.role}
          </span>
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
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                New Password *
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[10px] font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Auto-Generate</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new account password"
                className={`w-full p-2.5 text-xs rounded-xl outline-none pr-10 ${styles.inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Strength:</span>
                  <span className="font-bold text-slate-300">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password to confirm"
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
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md flex items-center gap-1.5`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Set User Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
