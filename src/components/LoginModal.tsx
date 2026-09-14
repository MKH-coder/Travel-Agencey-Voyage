import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Smartphone,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginModal: React.FC = () => {
  const { styles } = useTheme();
  const {
    showLoginModal,
    setShowLoginModal,
    showBypassModal,
    setShowBypassModal,
    twoFactorChallenge,
    setTwoFactorChallenge,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    verify2FA,
    verifyEmergencyBypass,
    isLoading,
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  
  // Google form state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [dispatchedDevCode, setDispatchedDevCode] = useState<string | null>(null);

  // 2FA state
  const [totpInput, setTotpInput] = useState('');

  // Bypass state
  const [bypassCodeInput, setBypassCodeInput] = useState('EMERGENCY-SUPERADMIN-RECOVERY-9567-2008');
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('8c15mukundkrishna.h@gmail.com');

  // Error/Status message
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!showLoginModal && !showBypassModal && !twoFactorChallenge) {
    return null;
  }

  // 1. Handle Google Login
  const handleGoogleSubmit = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const emailToUse = customEmail || googleEmail;
    
    // Secret code trigger for bypass
    if (emailToUse === 'adminbypass@gmail.com' || emailToUse === 'adminbypass') {
      setShowLoginModal(false);
      setShowBypassModal(true);
      return;
    }

    if (!emailToUse) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    setErrorMsg('');
    setInfoMsg('');

    const res = await loginWithGoogle(emailToUse, googleName);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  // 2. Handle Send Phone OTP
  const handleSendOtp = async (customPhone?: string) => {
    const phoneToUse = customPhone || phone;
    if (!phoneToUse) {
      setErrorMsg('Please enter a phone number.');
      return;
    }
    setErrorMsg('');
    setInfoMsg('');

    const res = await sendOtp(phoneToUse);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to send SMS OTP.');
    } else {
      setOtpSent(true);
      if (res.devCode) {
        setDispatchedDevCode(res.devCode);
        setOtpCode(res.devCode); // Pre-fill for ease of review
      }
      setInfoMsg(`Verification SMS sent to ${phoneToUse}`);
    }
  };

  // 3. Handle Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Secret code trigger for bypass
    if (otpCode === 'adminbypass') {
      setShowLoginModal(false);
      setShowBypassModal(true);
      return;
    }

    if (!otpCode) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setErrorMsg('');
    const res = await verifyOtp(phone, otpCode);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  // 4. Handle 2FA TOTP Submission
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpInput) {
      setErrorMsg('Please enter your 6-digit 2FA authenticator code.');
      return;
    }
    setErrorMsg('');
    const res = await verify2FA(totpInput);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid 2FA code.');
    }
  };

  // 5. Handle Emergency Bypass Code
  const handleBypassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bypassCodeInput) {
      setErrorMsg('Please enter the emergency bypass authorization code.');
      return;
    }
    setErrorMsg('');
    const res = await verifyEmergencyBypass(bypassCodeInput, recoveryEmailInput);
    if (!res.success) {
      setErrorMsg(res.error || 'Emergency bypass failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 sm:p-7 overflow-hidden`}
      >
        
        {/* Modal Close Button */}
        <button
          onClick={() => {
            setShowLoginModal(false);
            setShowBypassModal(false);
            setTwoFactorChallenge(null);
            setErrorMsg('');
            setInfoMsg('');
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- VIEW 1: 2FA Prompt Modal (Triggered when Technical Admin logs in) --- */}
        {twoFactorChallenge ? (
          <div className="space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className={`text-xl font-bold ${styles.textPrimary}`}>
                Two-Factor Authentication
              </h3>
              <p className={`text-xs ${styles.textMuted} leading-relaxed`}>
                High-security administrative account detected: <br />
                <span className="font-semibold text-amber-500">{twoFactorChallenge.email}</span>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
              <strong>Mandatory Technical Super Admin Policy:</strong> TOTP / Authenticator App verification is strictly required for root privileges.
            </div>

            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} />
                  <input
                    id="totp-code-input"
                    type="text"
                    maxLength={6}
                    value={totpInput}
                    onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="849201"
                    className={`w-full pl-10 pr-4 py-2.5 text-center tracking-widest text-lg font-mono font-bold rounded-xl outline-none ${styles.inputBg}`}
                    autoFocus
                  />
                </div>
              </div>

              {/* Demo Helper Button */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setTotpInput('849201')}
                  className="text-sky-500 hover:underline font-medium text-[11px] flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-fill demo TOTP (849201)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorChallenge(null);
                    setShowBypassModal(true);
                  }}
                  className="text-rose-500 hover:underline font-medium text-[11px]"
                >
                  Lost 2FA Device?
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                id="verify-2fa-btn"
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md`}
              >
                {isLoading ? 'Verifying 2FA...' : 'Verify & Enter Super Admin'}
              </button>
            </form>
          </div>
        ) : showBypassModal ? (
          
          /* --- VIEW 2: Emergency Bypass Code Modal --- */
          <div className="space-y-5 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto shadow-sm">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className={`text-xl font-bold ${styles.textPrimary}`}>
                Emergency Account Bypass
              </h3>
              <p className={`text-xs ${styles.textMuted} leading-relaxed`}>
                Cryptographic recovery mechanism for Technical Super Admin when 2FA or SMS is unavailable.
              </p>
            </div>

            <form onSubmit={handleBypassSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Master Recovery Code
                </label>
                <input
                  id="bypass-code-input"
                  type="text"
                  value={bypassCodeInput}
                  onChange={(e) => setBypassCodeInput(e.target.value)}
                  placeholder="EMERGENCY-SUPERADMIN-RECOVERY-9567-2008"
                  className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Authorized Backup Recovery Email
                </label>
                <input
                  id="recovery-email-input"
                  type="email"
                  value={recoveryEmailInput}
                  onChange={(e) => setRecoveryEmailInput(e.target.value)}
                  placeholder="8c15mukundkrishna.h@gmail.com"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                id="verify-bypass-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
              >
                {isLoading ? 'Decrypting Recovery Access...' : 'Authenticate Master Bypass'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBypassModal(false);
                  setShowLoginModal(true);
                }}
                className={`w-full py-2 rounded-xl text-xs font-medium ${styles.textMuted} hover:${styles.textPrimary}`}
              >
                Back to Standard Login
              </button>
            </form>
          </div>
        ) : (

          /* --- VIEW 3: Main Dual Authentication (Google Sign-In & Phone OTP) --- */
          <div className="space-y-5">
            
            {/* Title */}
            <div className="space-y-1">
              <h3 className={`text-2xl font-bold tracking-tight ${styles.textPrimary}`}>
                Sign In to Voyage
              </h3>
              <p className={`text-xs ${styles.textMuted}`}>
                Access your bookings, saved itineraries, or administrative portal.
              </p>
            </div>

            {/* Auth Method Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                id="tab-google-auth"
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMethod === 'google'
                    ? `${styles.cardBg} ${styles.textPrimary} shadow-sm`
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Google OAuth</span>
              </button>

              <button
                id="tab-phone-auth"
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  authMethod === 'phone'
                    ? `${styles.cardBg} ${styles.textPrimary} shadow-sm`
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone SMS OTP</span>
              </button>
            </div>

            {/* Tab A: Google Sign-In */}
            {authMethod === 'google' && (
              <div className="space-y-4">
                <form onSubmit={handleGoogleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Google Email Address
                    </label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} />
                      <input
                        id="google-email-input"
                        type="email"
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl outline-none ${styles.inputBg}`}
                      />
                    </div>
                  </div>

                  <button
                    id="submit-google-signin-btn"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md`}
                  >
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </button>
                </form>

                {/* Quick Demo Logins Bar for Seamless Evaluation */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Role Demonstrator
                  </div>
                  <div className="space-y-1.5">
                    
                    {/* Technical Super Admin (Mukund Krishna) */}
                    <button
                      id="demo-tech-admin-btn"
                      type="button"
                      onClick={() => {
                        setGoogleEmail('mukundkrishna2008@gmail.com');
                        setGoogleName('Mukund Krishna (Technical Super Admin)');
                        handleGoogleSubmit(undefined, 'mukundkrishna2008@gmail.com');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all text-xs"
                    >
                      <div>
                        <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Technical Super Admin (2FA Required)</span>
                        </div>
                        <div className="text-[10px] text-slate-500">mukundkrishna2008@gmail.com</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                    </button>

                    {/* Technical Sub-Admin (mukundkrishna.h@gmail.com) */}
                    <button
                      id="demo-tech-subadmin-btn"
                      type="button"
                      onClick={() => {
                        setGoogleEmail('mukundkrishna.h@gmail.com');
                        setGoogleName('Mukund Krishna (Technical Sub-Admin)');
                        handleGoogleSubmit(undefined, 'mukundkrishna.h@gmail.com');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-xs"
                    >
                      <div>
                        <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Technical Sub-Admin (Direct Access)</span>
                        </div>
                        <div className="text-[10px] text-slate-500">mukundkrishna.h@gmail.com / 8c15mukundkrishna.h@gmail.com</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                    </button>

                    {/* Standard Admin */}
                    <button
                      id="demo-std-admin-btn"
                      type="button"
                      onClick={() => {
                        setGoogleEmail('sarah.content@travelplatform.io');
                        setGoogleName('Sarah Jenkins');
                        handleGoogleSubmit(undefined, 'sarah.content@travelplatform.io');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 transition-all text-xs"
                    >
                      <div>
                        <div className="font-bold text-sky-600 dark:text-sky-400">Standard Content Admin</div>
                        <div className="text-[10px] text-slate-500">sarah.content@travelplatform.io</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
                    </button>

                    {/* Standard Traveler */}
                    <button
                      id="demo-traveler-btn"
                      type="button"
                      onClick={() => {
                        setGoogleEmail('alex.globetrotter@example.com');
                        setGoogleName('Alex Rivera');
                        handleGoogleSubmit(undefined, 'alex.globetrotter@example.com');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-700 dark:text-slate-300">Standard Traveler Account</div>
                        <div className="text-[10px] text-slate-500">alex.globetrotter@example.com</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                  </div>
                </div>

              </div>
            )}

            {/* Tab B: Phone SMS OTP */}
            {authMethod === 'phone' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Mobile Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${styles.textMuted}`} />
                        <input
                          id="phone-number-input"
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 555-0123"
                          className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl outline-none font-mono ${styles.inputBg}`}
                        />
                      </div>
                      <button
                        id="send-otp-btn"
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isLoading}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold shrink-0 ${styles.buttonSecondary}`}
                      >
                        {otpSent ? 'Resend' : 'Send Code'}
                      </button>
                    </div>
                  </div>

                  {/* Pre-configured Super Admin phone helper */}
                  <div className="text-[11px] flex items-center justify-between text-slate-400">
                    <span>Technical staff phone: <span className="font-mono text-sky-500">+1 555-0123</span></span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhone('+1 555-0123');
                        handleSendOtp('+1 555-0123');
                      }}
                      className="text-sky-500 hover:underline font-medium text-[10px]"
                    >
                      Use & Send
                    </button>
                  </div>

                  {otpSent && (
                    <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2">
                      {dispatchedDevCode && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
                          <span>Verification code sent: <strong className="font-mono text-sm">{dispatchedDevCode}</strong></span>
                          <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Enter 6-Digit SMS Code
                        </label>
                        <input
                          id="phone-otp-input"
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="956746"
                          className={`w-full py-2.5 text-center tracking-widest text-lg font-mono font-bold rounded-xl outline-none ${styles.inputBg}`}
                        />
                      </div>

                      <button
                        id="verify-phone-otp-btn"
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md`}
                      >
                        {isLoading ? 'Verifying OTP...' : 'Verify Phone Code'}
                      </button>
                    </form>
                  )}

                </div>
              </div>
            )}

            {/* Status / Error feedback */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-medium">
                {errorMsg}
              </div>
            )}
            {infoMsg && (
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 text-xs font-medium">
                {infoMsg}
              </div>
            )}

            {/* Emergency Recovery Footer Link */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 text-center">
              <button
                id="trigger-emergency-bypass-btn"
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setShowBypassModal(true);
                }}
                className="text-[11px] text-rose-500 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Technical Super Admin Emergency Bypass</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
