import React, { useState } from 'react';
import { Shield, ShieldCheck, UserPlus, X, AlertTriangle, CheckCircle2, Briefcase, Building2, KeyRound, Eye, EyeOff, RefreshCw, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole, User } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminCreated: (user: User) => void;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({
  isOpen,
  onClose,
  onAdminCreated,
}) => {
  const { styles } = useTheme();
  const { token, auditLog } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [customTitle, setCustomTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter an authorized email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          password: password ? password.trim() : undefined,
          role,
          customTitle: customTitle.trim() || undefined,
          department: department.trim() || undefined,
          recoveryEmail: recoveryEmail.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || `Successfully registered ${email} as ${role}!`);
        onAdminCreated(data.user);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1200);
        return;
      }
    } catch {
      // Backend offline / static fallback
    }

    // Static fallback execution
    try {
      const newUser: User = {
        uid: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: email.trim().toLowerCase(),
        name: name.trim() || email.trim().split('@')[0],
        phoneNumber: phoneNumber.trim() || undefined,
        password: password ? password.trim() : undefined,
        role,
        customTitle: customTitle.trim() || (role === 'TECH_ADMIN' ? 'Chief Technology Architect' : role === 'TECH_SUBADMIN' ? 'Infrastructure Specialist' : role === 'ADMIN' ? 'Head of Destination Curation' : 'Traveler'),
        department: department.trim() || (role === 'TECH_ADMIN' ? 'Executive Engineering' : 'Operations'),
        recoveryEmail: recoveryEmail.trim() || undefined,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };

      ClientStorageManager.saveUser(newUser);
      await auditLog(
        'ADD_NEW_USER_AND_POST',
        newUser.uid,
        'USER',
        { email: newUser.email, role: newUser.role, customTitle: newUser.customTitle, hasPassword: Boolean(password) }
      );

      setSuccess(`Successfully added ${email} with assigned post: ${newUser.customTitle}!`);
      onAdminCreated(newUser);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error adding member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPhoneNumber('');
    setPassword('');
    setShowPassword(false);
    setCustomTitle('');
    setDepartment('');
    setRecoveryEmail('');
    setSuccess('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-lg rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 sm:p-8 relative space-y-5 max-h-[90vh] overflow-y-auto`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
                Add & Save User (Super Admin Privilege)
              </h3>
              <p className={`text-xs ${styles.textMuted}`}>
                Technical Super Admin privilege to register emails, assign passwords, roles, and official job posts.
              </p>
            </div>
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
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mukundkrishna.h@gmail.com"
              className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mukund Krishna"
                className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Phone Number (for MFA OTP)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91 9567465134"
                className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Initial Account Password (Optional)
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Assign account password (or leave blank for passwordless OAuth)"
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
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Assigned Privilege Tier *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2 ${
                  role === 'TECH_ADMIN'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="adminRole"
                  value="TECH_ADMIN"
                  checked={role === 'TECH_ADMIN'}
                  onChange={() => setRole('TECH_ADMIN')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Super Admin</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Root control</div>
                </div>
              </label>

              <label
                className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2 ${
                  role === 'TECH_SUBADMIN'
                    ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="adminRole"
                  value="TECH_SUBADMIN"
                  checked={role === 'TECH_SUBADMIN'}
                  onChange={() => setRole('TECH_SUBADMIN')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-[11px] flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>Sub-Admin</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Verification</div>
                </div>
              </label>

              <label
                className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2 ${
                  role === 'ADMIN'
                    ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="adminRole"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-[11px]">Standard Admin</div>
                  <div className="text-[9px] text-slate-400">Content editor</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-amber-500" />
                <span>Assigned Post / Title</span>
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Lead Travel Curator"
                className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-sky-500" />
                <span>Department</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Platform Operations"
                className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Emergency Recovery Email (Optional)
            </label>
            <input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="e.g. mukundkrishna.h@gmail.com"
              className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
            />
          </div>

          <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4 text-emerald-100" />
              <span>{isSubmitting ? 'Saving User...' : 'Save & Authorize User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
