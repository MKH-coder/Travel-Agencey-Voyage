import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Users, AlertTriangle, CheckCircle2, Lock, Sparkles, Mail, Send } from 'lucide-react';
import { User } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface AdminSecurityAdoptionCardProps {
  users: User[];
  onRemindUser?: (user: User) => void;
}

export const AdminSecurityAdoptionCard: React.FC<AdminSecurityAdoptionCardProps> = ({ users, onRemindUser }) => {
  const { styles } = useTheme();
  const [notifiedEmail, setNotifiedEmail] = useState<string | null>(null);

  const totalUsers = users.length;
  const mfaEnabledCount = users.filter((u) => u.mfaEnabled).length;
  const adoptionRate = totalUsers > 0 ? Math.round((mfaEnabledCount / totalUsers) * 100) : 0;

  const usersWithoutMfa = users.filter((u) => !u.mfaEnabled);
  const elevatedWithoutMfa = usersWithoutMfa.filter(
    (u) => u.role === 'ADMIN' || u.role === 'TECH_SUBADMIN' || u.role === 'TECH_ADMIN'
  );

  const handleSendReminder = (u: User) => {
    setNotifiedEmail(u.email);
    if (onRemindUser) onRemindUser(u);
    setTimeout(() => setNotifiedEmail(null), 3000);
  };

  return (
    <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-6`}>
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-extrabold text-base ${styles.textPrimary}`}>
              User 2FA Adoption & Security Audit
            </h3>
            <p className={`text-xs ${styles.textMuted}`}>
              Monitoring two-factor authentication compliance and cryptographic base32 secret enrollment across accounts.
            </p>
          </div>
        </div>

        {/* Adoption Percentage Badge */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Adoption Rate</span>
            <span className="font-extrabold text-base text-emerald-500">{adoptionRate}%</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-emerald-500">
            {mfaEnabledCount}/{totalUsers}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400">Security Enrollment Progress</span>
          <span className="text-slate-700 dark:text-slate-200">{mfaEnabledCount} Protected • {usersWithoutMfa.length} Unprotected</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500"
            style={{ width: `${Math.max(5, adoptionRate)}%` }}
          />
        </div>
      </div>

      {/* Elevated Accounts Warning Banner */}
      {elevatedWithoutMfa.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Privileged Administrative Accounts Lacking 2FA Protection</h4>
            <p className="text-[11px] leading-relaxed opacity-90">
              There {elevatedWithoutMfa.length === 1 ? 'is' : 'are'} <strong className="font-bold underline">{elevatedWithoutMfa.length} admin/sub-admin account{elevatedWithoutMfa.length > 1 ? 's' : ''}</strong> currently operating without 2FA base32 secret encryption enabled.
            </p>
          </div>
        </div>
      )}

      {/* Accounts Without 2FA List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${styles.textMuted}`}>
            Accounts Without Enhanced Security ({usersWithoutMfa.length})
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Base32 Secrets Uninitialized</span>
        </div>

        {usersWithoutMfa.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
            <p className="font-bold">All registered users have 2FA enabled!</p>
            <p className="text-[11px] opacity-80">100% compliance rate achieved across all user accounts.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {usersWithoutMfa.map((u) => {
              const isPrivileged = u.role === 'ADMIN' || u.role === 'TECH_SUBADMIN' || u.role === 'TECH_ADMIN';
              const justNotified = notifiedEmail === u.email;

              return (
                <div
                  key={u.uid}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isPrivileged
                      ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPrivileged ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{u.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                          isPrivileged ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate font-mono">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {justNotified ? (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reminder Sent</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendReminder(u)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-1.5"
                        title="Send 2FA security prompt & base32 secret enrollment reminder"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-500" />
                        <span>Remind 2FA</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
