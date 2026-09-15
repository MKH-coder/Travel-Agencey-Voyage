import React, { useState } from 'react';
import { Sliders, ShieldAlert, Check, X, RotateCcw, ShieldCheck, AlertCircle } from 'lucide-react';
import { RiskThresholdConfig } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface RiskThresholdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RiskThresholdConfig;
  onSaveConfig: (newConfig: RiskThresholdConfig) => void;
}

export const DEFAULT_RISK_THRESHOLDS: RiskThresholdConfig = {
  BYPASS_EVENTS: true,
  RATE_LIMIT_EVENTS: true,
  CONTENT_DELETIONS: true,
  ROLE_MODIFICATIONS: true,
  SECURITY_2FA_CHANGES: true,
  CONTENT_CREATIONS: false,
  ADMIN_LOGINS: false,
};

export const RiskThresholdConfigModal: React.FC<RiskThresholdConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const { styles } = useTheme();
  const [tempConfig, setTempConfig] = useState<RiskThresholdConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof RiskThresholdConfig) => {
    setTempConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (preset: 'STRICT' | 'ALL' | 'CRITICAL') => {
    if (preset === 'STRICT') {
      setTempConfig({
        BYPASS_EVENTS: true,
        RATE_LIMIT_EVENTS: true,
        CONTENT_DELETIONS: true,
        ROLE_MODIFICATIONS: true,
        SECURITY_2FA_CHANGES: true,
        CONTENT_CREATIONS: false,
        ADMIN_LOGINS: false,
      });
    } else if (preset === 'ALL') {
      setTempConfig({
        BYPASS_EVENTS: true,
        RATE_LIMIT_EVENTS: true,
        CONTENT_DELETIONS: true,
        ROLE_MODIFICATIONS: true,
        SECURITY_2FA_CHANGES: true,
        CONTENT_CREATIONS: true,
        ADMIN_LOGINS: true,
      });
    } else if (preset === 'CRITICAL') {
      setTempConfig({
        BYPASS_EVENTS: true,
        RATE_LIMIT_EVENTS: true,
        CONTENT_DELETIONS: false,
        ROLE_MODIFICATIONS: false,
        SECURITY_2FA_CHANGES: false,
        CONTENT_CREATIONS: false,
        ADMIN_LOGINS: false,
      });
    }
  };

  const handleSave = () => {
    onSaveConfig(tempConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const categories: { key: keyof RiskThresholdConfig; title: string; desc: string; highRiskByDefault: boolean }[] = [
    {
      key: 'BYPASS_EVENTS',
      title: 'Bypass & Emergency Overrides',
      desc: 'Triggers alerts for emergency secret bypasses and root override activations.',
      highRiskByDefault: true,
    },
    {
      key: 'RATE_LIMIT_EVENTS',
      title: 'Rate Limit & Security Blocks',
      desc: 'Triggers alerts for blocked brute-force attempts or rate limit violations.',
      highRiskByDefault: true,
    },
    {
      key: 'CONTENT_DELETIONS',
      title: 'Content & Listing Deletions',
      desc: 'Triggers alerts when listings, comments, or posts are permanently removed.',
      highRiskByDefault: true,
    },
    {
      key: 'ROLE_MODIFICATIONS',
      title: 'User Role Escalations & Demotions',
      desc: 'Triggers alerts when user roles, posts, or designations are modified.',
      highRiskByDefault: true,
    },
    {
      key: 'SECURITY_2FA_CHANGES',
      title: '2FA Security Configuration',
      desc: 'Triggers alerts when 2FA authentication is disabled or updated by admins.',
      highRiskByDefault: true,
    },
    {
      key: 'CONTENT_CREATIONS',
      title: 'Listing Creations & Approvals',
      desc: 'Triggers alerts whenever new listings are submitted, created, or approved.',
      highRiskByDefault: false,
    },
    {
      key: 'ADMIN_LOGINS',
      title: 'Standard Admin Sign-Ins',
      desc: 'Triggers alerts for every routine administrative portal login event.',
      highRiskByDefault: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden p-6 space-y-5`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${styles.textPrimary}`}>
                Audit Alert Risk Thresholds
              </h3>
              <p className={`text-xs ${styles.textMuted}`}>
                Define which audit event categories automatically trigger high-risk banner alerts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Presets:</span>
          <div className="flex items-center gap-2">
            <button
              id="preset-strict"
              type="button"
              onClick={() => applyPreset('STRICT')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              Balanced (Recommended)
            </button>
            <button
              id="preset-critical"
              type="button"
              onClick={() => applyPreset('CRITICAL')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
            >
              Critical Only
            </button>
            <button
              id="preset-all"
              type="button"
              onClick={() => applyPreset('ALL')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-all"
            >
              All Events
            </button>
          </div>
        </div>

        {/* Category Toggles List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isEnabled = tempConfig[cat.key];
            return (
              <div
                key={cat.key}
                onClick={() => handleToggle(cat.key)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-75'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{cat.title}</span>
                    {cat.highRiskByDefault && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-500 uppercase">
                        High Severity
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{cat.desc}</p>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={isEnabled}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setTempConfig(DEFAULT_RISK_THRESHOLDS)}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
            >
              Cancel
            </button>

            <button
              id="save-risk-thresholds-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Thresholds'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
