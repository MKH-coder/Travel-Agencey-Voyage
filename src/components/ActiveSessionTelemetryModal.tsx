import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Monitor,
  Wifi,
  Clock,
  Shield,
  ShieldCheck,
  Globe,
  Radio,
  LogOut,
  X,
  KeyRound,
  Pencil,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ActiveUserSession {
  uid: string;
  email: string;
  name: string;
  role: string;
  customTitle?: string;
  department?: string;
  status: 'ONLINE' | 'IDLE' | 'OFFLINE';
  lastActiveAt: string;
  lastLoginAt: string;
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  viewport: string;
  timezone: string;
  mfaEnabled?: boolean;
}

interface ActiveSessionTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ActiveUserSession | null;
  onRevokeSession?: (session: ActiveUserSession) => void;
  onSetPassword?: (email: string) => void;
  onEditRolePost?: (session: ActiveUserSession) => void;
}

export const ActiveSessionTelemetryModal: React.FC<ActiveSessionTelemetryModalProps> = ({
  isOpen,
  onClose,
  session,
  onRevokeSession,
  onSetPassword,
  onEditRolePost
}) => {
  const { theme } = useTheme();

  if (!isOpen || !session) return null;

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark-slate':
      case 'crimson-black':
      case 'royal-gold':
      case 'violet-glass':
        return {
          modalBg: 'bg-slate-900 border-slate-800 text-slate-100',
          cardBg: 'bg-slate-950/80 border-slate-800',
          textMuted: 'text-slate-400',
        };
      default:
        return {
          modalBg: 'bg-white border-slate-200 text-slate-900',
          cardBg: 'bg-slate-50 border-slate-200/80',
          textMuted: 'text-slate-500',
        };
    }
  };

  const styles = getThemeStyles();

  const isOnline = session.status === 'ONLINE';
  const isIdle = session.status === 'IDLE';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`w-full max-w-2xl rounded-3xl border ${styles.modalBg} p-6 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] overflow-y-auto`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                isOnline ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : isIdle ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
              }`}>
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">{session.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                    isOnline ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : isIdle ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : isIdle ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    {isOnline ? 'ONLINE NOW' : isIdle ? 'IDLE SESSION' : 'OFFLINE'}
                  </span>
                </div>
                <div className="text-xs text-sky-400 font-mono mt-0.5">{session.email}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account & Role Overview Banner */}
          <div className={`p-4 rounded-2xl ${styles.cardBg} border flex items-center justify-between flex-wrap gap-3`}>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Official Designation</div>
              <div className="text-sm font-bold text-amber-500 dark:text-amber-400">
                {session.customTitle || (session.role === 'TECH_ADMIN' ? 'Chief Technology Architect' : session.role === 'ADMIN' ? 'Destination Curator' : 'Traveler')}
              </div>
              <div className="text-xs text-slate-400 font-medium">{session.department || 'Platform Operations'}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase ${
                session.role === 'TECH_ADMIN' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : session.role === 'TECH_SUBADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-sky-500/20 text-sky-500 border border-sky-500/30'
              }`}>
                {session.role}
              </span>
              <span className={`px-2 py-1 rounded-xl text-[10px] font-bold ${session.mfaEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400'}`}>
                {session.mfaEnabled ? '2FA ENABLED' : 'NO 2FA'}
              </span>
            </div>
          </div>

          {/* Telemetry Information Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-Time Client & Network Telemetry</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={`p-3.5 rounded-2xl ${styles.cardBg} border space-y-1`}>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-sky-400" /> Client IP Address
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs">
                  {session.ipAddress}
                </div>
                <div className="text-[10px] text-slate-400">Authenticated remote client connection</div>
              </div>

              <div className={`p-3.5 rounded-2xl ${styles.cardBg} border space-y-1`}>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-amber-400" /> Browser Engine & Operating System
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {session.browser} ({session.os})
                </div>
                <div className="text-[10px] text-slate-400">Device Type: {session.deviceType}</div>
              </div>

              <div className={`p-3.5 rounded-2xl ${styles.cardBg} border space-y-1`}>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Session Timestamps
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Login: {session.lastLoginAt ? new Date(session.lastLoginAt).toLocaleTimeString() : 'N/A'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Last Active: {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleTimeString() : 'Just now'}
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl ${styles.cardBg} border space-y-1`}>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> Viewport & Timezone
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {session.screenResolution} • {session.timezone}
                </div>
                <div className="text-[10px] text-slate-400">Active Viewport: {session.viewport}</div>
              </div>
            </div>
          </div>

          {/* Super Admin Actions */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {onSetPassword && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSetPassword(session.email);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border border-sky-500/30 transition-all flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Set Password</span>
                </button>
              )}

              {onEditRolePost && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditRolePost(session);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Promote / Edit Post</span>
                </button>
              )}
            </div>

            {onRevokeSession && isOnline && (
              <button
                type="button"
                onClick={() => {
                  onRevokeSession(session);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Force Disconnect & Revoke Session</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
