import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  PlusCircle,
  FolderX,
  UserCog,
  UserMinus,
  MessageSquareOff,
  PenTool
} from 'lucide-react';
import { ToastMessage } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { styles } = useTheme();
  const [progress, setProgress] = useState(100);

  const duration = toast.duration ?? 7000;

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss, toast.id]);

  const getThemeDetails = () => {
    if (toast.isAdminAction) {
      if (toast.type === 'error') {
        return {
          icon: <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />,
          borderColor: 'border-rose-500/50 dark:border-rose-500/60 shadow-lg shadow-rose-500/5',
          bgColor: 'bg-slate-50 dark:bg-slate-950',
          badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
          titleColor: 'text-rose-600 dark:text-rose-400 font-extrabold',
          progressBarColor: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 animate-pulse',
          isAdmin: true,
          adminBadgeText: 'SECURITY EVENT'
        };
      } else {
        let actionIcon = <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
        let barColor = 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600';
        let badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
        let titleCol = 'text-emerald-600 dark:text-emerald-400 font-extrabold';
        let badgeText = 'ADMIN PORTAL';

        if (toast.adminActionType === 'create') {
          actionIcon = <PlusCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
          badgeText = 'CATALOG CREATE';
        } else if (toast.adminActionType === 'delete') {
          actionIcon = <Trash2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
          badgeText = 'CATALOG DELETE';
          barColor = 'bg-gradient-to-r from-rose-500 to-red-500';
          titleCol = 'text-rose-600 dark:text-rose-400 font-extrabold';
          badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
        } else if (toast.adminActionType === 'clear') {
          actionIcon = <FolderX className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
          badgeText = 'CATALOG CLEAR';
          barColor = 'bg-gradient-to-r from-red-600 to-rose-600';
          titleCol = 'text-rose-600 dark:text-rose-400 font-extrabold';
          badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
        } else if (toast.adminActionType === 'user_role') {
          actionIcon = <UserCog className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
          badgeText = 'USER ROLE UPDATE';
          barColor = 'bg-gradient-to-r from-amber-500 to-yellow-500';
          titleCol = 'text-amber-600 dark:text-amber-400 font-extrabold';
          badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
        } else if (toast.adminActionType === 'user_delete') {
          actionIcon = <UserMinus className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
          badgeText = 'USER DELETE';
          barColor = 'bg-gradient-to-r from-rose-600 to-red-600';
          titleCol = 'text-rose-600 dark:text-rose-400 font-extrabold';
          badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
        } else if (toast.adminActionType === 'moderation') {
          actionIcon = <MessageSquareOff className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />;
          badgeText = 'MODERATION';
          barColor = 'bg-gradient-to-r from-purple-500 to-violet-500';
          titleCol = 'text-purple-600 dark:text-purple-400 font-extrabold';
          badgeColor = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
        } else if (toast.adminActionType === 'status') {
          actionIcon = <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />;
          badgeText = 'VERIFICATION';
          barColor = 'bg-gradient-to-r from-teal-500 to-emerald-500';
          titleCol = 'text-teal-600 dark:text-teal-400 font-extrabold';
          badgeColor = 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20';
        }

        return {
          icon: actionIcon,
          borderColor: toast.adminActionType === 'delete' || toast.adminActionType === 'clear' || toast.adminActionType === 'user_delete'
            ? 'border-rose-500/50 dark:border-rose-500/60 shadow-lg shadow-rose-500/5'
            : toast.adminActionType === 'user_role'
            ? 'border-amber-500/50 dark:border-amber-500/60 shadow-lg shadow-amber-500/5'
            : toast.adminActionType === 'moderation'
            ? 'border-purple-500/50 dark:border-purple-500/60 shadow-lg shadow-purple-500/5'
            : 'border-emerald-500/50 dark:border-emerald-500/60 shadow-lg shadow-emerald-500/5',
          bgColor: 'bg-slate-50 dark:bg-slate-950',
          badgeColor,
          titleColor: titleCol,
          progressBarColor: barColor,
          isAdmin: true,
          adminBadgeText: badgeText
        };
      }
    }

    switch (toast.type) {
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
          borderColor: 'border-rose-500/40 dark:border-rose-500/50',
          bgColor: 'bg-white dark:bg-slate-900',
          badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
          titleColor: 'text-rose-600 dark:text-rose-400',
          progressBarColor: 'bg-rose-500',
          isAdmin: false,
          adminBadgeText: undefined
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          borderColor: 'border-amber-500/40 dark:border-amber-500/50',
          bgColor: 'bg-white dark:bg-slate-900',
          badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
          titleColor: 'text-amber-700 dark:text-amber-400',
          progressBarColor: 'bg-amber-500',
          isAdmin: false,
          adminBadgeText: undefined
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
          borderColor: 'border-emerald-500/40 dark:border-emerald-500/50',
          bgColor: 'bg-white dark:bg-slate-900',
          badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
          titleColor: 'text-emerald-700 dark:text-emerald-400',
          progressBarColor: 'bg-emerald-500',
          isAdmin: false,
          adminBadgeText: undefined
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />,
          borderColor: 'border-sky-500/40 dark:border-sky-500/50',
          bgColor: 'bg-white dark:bg-slate-900',
          badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
          titleColor: 'text-sky-700 dark:text-sky-400',
          progressBarColor: 'bg-sky-500',
          isAdmin: false,
          adminBadgeText: undefined
        };
    }
  };

  const { icon, borderColor, bgColor, badgeColor, titleColor, progressBarColor, isAdmin, adminBadgeText } = getThemeDetails();

  return (
    <div
      id={`toast-${toast.id}`}
      role="alert"
      className={`relative w-full max-w-sm rounded-2xl border ${borderColor} ${bgColor} shadow-2xl overflow-hidden transition-all duration-300 pointer-events-auto animate-in slide-in-from-top-3 fade-in duration-200`}
    >
      <div className="p-4 flex items-start gap-3">
        {icon}

        <div className="flex-1 min-w-0 pr-1">
          {isAdmin && adminBadgeText && (
            <div className="flex items-center gap-1 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[8px] tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900 whitespace-nowrap">
                <ShieldCheck className="w-2.5 h-2.5" />
                {adminBadgeText}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-xs font-bold ${titleColor} truncate`}>{toast.title}</h4>
            {toast.code && (
              <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${badgeColor} truncate max-w-[140px]`}>
                {toast.code.replace('auth/', '')}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {toast.message}
          </p>

          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                id={`toast-action-btn-${toast.id}`}
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm transition-transform active:scale-[0.98]"
              >
                <span>{toast.action.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          id={`toast-dismiss-btn-${toast.id}`}
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Remaining Duration Progress Bar */}
      {duration > 0 && (
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full ${progressBarColor} transition-all ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = AuthAudit.onToast((newToast) => {
      setToasts((prev) => {
        // Prevent exact duplicate active toasts
        const exists = prev.some((t) => t.message === newToast.message && t.type === newToast.type);
        if (exists) return prev;
        // Keep max 4 active toasts
        return [newToast, ...prev.slice(0, 3)];
      });
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      id="global-toast-container"
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};
