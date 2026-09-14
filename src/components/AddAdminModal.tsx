import React, { useState } from 'react';
import { Shield, UserPlus, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole, User } from '../types.ts';

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
  const { token } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter an authorized administrative email.');
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
          role,
          recoveryEmail: recoveryEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add administrator.');
      } else {
        setSuccess(data.message || `Successfully added ${email} as ${role}!`);
        onAdminCreated(data.user);
        setTimeout(() => {
          onClose();
          setEmail('');
          setName('');
          setPhoneNumber('');
          setRecoveryEmail('');
          setSuccess('');
        }, 1200);
      }
    } catch {
      setError('Network error while creating administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-lg rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 sm:p-8 relative space-y-5`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
              Add New Administrator
            </h3>
            <p className={`text-xs ${styles.textMuted}`}>
              Technical Super Admin authorization to register and grant administrative privileges.
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
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. administrator@travelplatform.io"
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
                Phone Number (for OTP MFA)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +91 9567465135"
                className={`w-full p-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Assigned Administrative Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
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
                  <div className="font-bold text-xs">Standard Admin</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Can draft inventory and submit listings for Super Admin verification.
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
                  name="adminRole"
                  value="TECH_SUBADMIN"
                  checked={role === 'TECH_SUBADMIN'}
                  onChange={() => setRole('TECH_SUBADMIN')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>Technical Sub-Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Direct publish privilege, review moderation queue, and audit log access.
                  </div>
                </div>
              </label>
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
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Authorizing...' : 'Authorize & Add Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
