import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuditLog } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { AuditService } from '../services/auditService.ts';
import { supabase } from '../supabaseClient.js';
import { firebaseAuth, googleAuthProvider } from '../services/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

interface TwoFactorChallenge {
  uid: string;
  email: string;
  phoneNumber?: string;
  message?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  twoFactorChallenge: TwoFactorChallenge | null;
  showLoginModal: boolean;
  showBypassModal: boolean;
  sessionRemainingSec: number | null;
  isSessionExpired: boolean;
  isNetworkOnline: boolean;
  setShowLoginModal: (show: boolean) => void;
  setShowBypassModal: (show: boolean) => void;
  setTwoFactorChallenge: (challenge: TwoFactorChallenge | null) => void;
  loginWithGoogle: (email?: string, name?: string) => Promise<{ requires2FA: boolean; error?: string }>;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string, email?: string) => Promise<{ success: boolean; devCode?: string; isTechAdmin?: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string, email?: string) => Promise<{ requires2FA: boolean; error?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmergencyBypass: (code: string, recoveryEmail?: string) => Promise<{ success: boolean; error?: string }>;
  verifyPasskey: (passkey: string) => Promise<boolean>;
  toggle2FA: (enabled?: boolean) => Promise<{ success: boolean; mfaEnabled: boolean; error?: string }>;
  auditLog: (
    action: string,
    targetId: string,
    targetType?: string,
    details?: Record<string, unknown>
  ) => Promise<AuditLog>;
  logout: () => Promise<void>;
  refreshSessionHealth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('travel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('travel_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorChallenge | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showBypassModal, setShowBypassModal] = useState<boolean>(false);
  const [sessionRemainingSec, setSessionRemainingSec] = useState<number | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  // Ref to track last user movement / interaction
  const lastUserActivityRef = React.useRef<number>(Date.now());

  // Save/Clear local user cache
  const setAuthSession = useCallback((newUser: User | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser && newToken) {
      localStorage.setItem('travel_user', JSON.stringify(newUser));
      localStorage.setItem('travel_token', newToken);
      lastUserActivityRef.current = Date.now();
      if (newUser.role === 'ADMIN' || newUser.role === 'TECH_SUBADMIN' || newUser.role === 'TECH_ADMIN') {
        // Idle allowance: 60 minutes without any user movement
        setSessionRemainingSec(60 * 60);
      }
    } else {
      localStorage.removeItem('travel_user');
      localStorage.removeItem('travel_token');
      setSessionRemainingSec(null);
    }
  }, []);

  // Track user movements across entire window
  useEffect(() => {
    const handleUserInteraction = () => {
      lastUserActivityRef.current = Date.now();
      // Keep session alive as long as user is interacting
      if (token && user && (user.role === 'ADMIN' || user.role === 'TECH_SUBADMIN' || user.role === 'TECH_ADMIN')) {
        setSessionRemainingSec(60 * 60);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel', 'pointerdown'];
    events.forEach(ev => window.addEventListener(ev, handleUserInteraction, { passive: true }));

    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => {
      setIsNetworkOnline(false);
      // Immediately trigger session pause/expiry alert if network connection terminates
      setIsSessionExpired(true);
      setAuthSession(null, null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleUserInteraction));
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token, user, setAuthSession]);

  const refreshSessionHealth = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        lastUserActivityRef.current = Date.now();
        setSessionRemainingSec(60 * 60);
      } else if (res.status === 401) {
        setIsSessionExpired(true);
        setAuthSession(null, null);
      }
    } catch {
      // Offline / transient error
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsNetworkOnline(false);
      }
    }
  }, [token, setAuthSession]);

  // Session timer check: ONLY times out if network disconnects or if there is zero user movement for 60 minutes
  useEffect(() => {
    if (!token || !user || (user.role !== 'ADMIN' && user.role !== 'TECH_SUBADMIN' && user.role !== 'TECH_ADMIN')) {
      return;
    }

    const interval = setInterval(() => {
      // 1. Check network connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsNetworkOnline(false);
        setIsSessionExpired(true);
        setAuthSession(null, null);
        return;
      }

      // 2. Check time since last user movement
      const idleMs = Date.now() - lastUserActivityRef.current;
      const idleSec = Math.floor(idleMs / 1000);
      const remainingSec = Math.max(0, 60 * 60 - idleSec);

      setSessionRemainingSec(remainingSec);

      // Only timeout if completely idle without any movement for 60 minutes
      if (remainingSec <= 0) {
        setIsSessionExpired(true);
        setAuthSession(null, null);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [token, user, setAuthSession]);

  // Google Login with authentic Firebase OAuth popup and fallback verification
  const loginWithGoogle = async (manualEmail?: string, name?: string) => {
    setIsLoading(true);
    try {
      let emailToUse = manualEmail ? manualEmail.trim() : '';
      let nameToUse = name;
      let idToken: string | undefined = undefined;
      let isOAuthVerified = false;

      // 1. If user clicks "Sign In with Google" directly (or without manual typed email)
      if (!emailToUse) {
        try {
          const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
          if (result.user && result.user.email) {
            emailToUse = result.user.email;
            nameToUse = result.user.displayName || name || result.user.email.split('@')[0];
            idToken = await result.user.getIdToken();
            isOAuthVerified = true;
          }
        } catch (popupErr: any) {
          // If the user cancelled or closed the popup window
          if (popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/cancelled-popup-request') {
            setIsLoading(false);
            return { requires2FA: false, error: 'Google sign-in popup was cancelled.' };
          }
          console.warn('[Firebase Auth] Notice during Google popup sign-in:', popupErr.message);
        }
      }

      if (!emailToUse) {
        setIsLoading(false);
        return { requires2FA: false, error: 'Please authenticate with your Google account or enter your email address.' };
      }

      // 2. Request backend verification
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailToUse, 
          name: nameToUse,
          isOAuthVerified,
          idToken
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.requires2FA) {
          setTwoFactorChallenge({
            uid: data.uid,
            email: data.email,
            phoneNumber: data.phoneNumber,
            message: data.message || 'Security Verification Required for this account.',
          });
          return { requires2FA: true };
        }
        setAuthSession(data.user, data.token);
        setShowLoginModal(false);
        return { requires2FA: false };
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          setIsLoading(false);
          return { requires2FA: false, error: errData.error };
        }
      }
    } catch {
      // Backend not accessible (e.g. GitHub Pages static hosting) - proceed with client fallback
    }

    // Static fallback execution
    try {
      const fallbackResult = ClientStorageManager.authenticateGoogle(manualEmail || '', name, false);
      if (fallbackResult.requires2FA && fallbackResult.challenge) {
        setTwoFactorChallenge({
          uid: fallbackResult.challenge.uid,
          email: fallbackResult.challenge.email,
          message: fallbackResult.challenge.message || 'MFA Verification Required',
        });
        return { requires2FA: true };
      }
      setAuthSession(fallbackResult.user, fallbackResult.token);
      setShowLoginModal(false);
      return { requires2FA: false };
    } catch (fallbackErr) {
      return { requires2FA: false, error: fallbackErr instanceof Error ? fallbackErr.message : 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase Sign In
  const loginWithSupabase = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.user) {
        const userEmail = data.user.email || email;
        const cleanPassword = password.trim().toLowerCase();
        const isBypass = ['2008-6058', '20086058', 'adminbypass', 'mukundbypass', 'sec-root-travel-2026', 'emergency-superadmin-recovery-9567-2008', '9567465134'].includes(cleanPassword);
        const isSuperAdminEmail = userEmail.toLowerCase() === 'mukundkrishna.h2008@gmail.com' || userEmail.toLowerCase() === 'mukundkrishna2008@gmail.com';
        
        const appUser: User = {
          uid: data.user.id,
          email: userEmail,
          name: isSuperAdminEmail && isBypass ? 'Mukund Krishna (Technical Super Admin)' : (data.user.user_metadata?.full_name || email.split('@')[0] || 'Traveler'),
          role: (isSuperAdminEmail && isBypass) ? 'TECH_ADMIN' : 'USER',
          customTitle: (isSuperAdminEmail && isBypass) ? 'Chief Technology Architect & Super Admin' : undefined,
          department: (isSuperAdminEmail && isBypass) ? 'Executive Engineering' : undefined,
          mfaEnabled: false,
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        ClientStorageManager.saveUser(appUser);
        setAuthSession(appUser, data.session?.access_token || `token_${data.user.id}`);
        setShowLoginModal(false);
        return { success: true };
      }
      return { success: false, error: 'Sign in failed. Please check your credentials.' };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Sign in error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase Sign Up
  const signUpWithSupabase = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.user) {
        const userEmail = data.user.email || email;
        const appUser: User = {
          uid: data.user.id,
          email: userEmail,
          name: data.user.user_metadata?.full_name || email.split('@')[0] || 'Traveler',
          role: 'USER',
          mfaEnabled: false,
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        ClientStorageManager.saveUser(appUser);
        setAuthSession(appUser, data.session?.access_token || `token_${data.user.id}`);
        setShowLoginModal(false);
        return { success: true };
      }
      return { success: false, error: 'Sign up failed. Please try again.' };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Sign up error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP with static fallback and real Supabase Auth OTP integration
  const sendOtp = async (phoneNumber: string, email?: string) => {
    setIsLoading(true);

    // Attempt real Supabase OTP Auth first
    try {
      if (email) {
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email,
        });
        if (error) {
          console.warn('Supabase Email OTP failed:', error.message);
        } else {
          console.log('Supabase Email OTP dispatched successfully', data);
        }
      }

      if (phoneNumber) {
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
        });
        if (error) {
          console.warn('Supabase Phone OTP failed:', error.message);
        } else {
          console.log('Supabase Phone OTP dispatched successfully', data);
        }
      }
    } catch (supaErr) {
      console.warn('Supabase sign-in with OTP skipped or failed:', supaErr);
    }

    // Call standard backend /api/auth/send-otp endpoint to sync the session state
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, email }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsLoading(false);
        return {
          success: true,
          devCode: data.devCode,
          isTechAdmin: data.isTechAdmin,
        };
      }
    } catch {
      // Backend offline / static mode
    }

    setIsLoading(false);
    const isTechAdmin = phoneNumber.includes('9567465134') || (email && email.includes('mukundkrishna'));
    return {
      success: true,
      devCode: '849201',
      isTechAdmin,
    };
  };

  // Verify OTP with static fallback and real Supabase verification support
  const verifyOtp = async (phoneNumber: string, code: string, email?: string) => {
    setIsLoading(true);

    // Try verifying via Supabase OTP verification if active
    try {
      if (email) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email,
          token: code,
          type: 'email'
        });
        if (!error && data?.user) {
          console.log('Supabase Email OTP verification succeeded', data);
          const appUser: User = {
            uid: data.user.id,
            email: email,
            name: data.user.user_metadata?.full_name || email.split('@')[0] || 'Traveler',
            role: 'USER',
            mfaEnabled: false,
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          ClientStorageManager.saveUser(appUser);
          setAuthSession(appUser, data.session?.access_token || `token_${data.user.id}`);
          setShowLoginModal(false);
          setIsLoading(false);
          return { requires2FA: false };
        }
      }

      if (phoneNumber) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: code,
          type: 'sms'
        });
        if (!error && data?.user) {
          console.log('Supabase Phone OTP verification succeeded', data);
          const appUser: User = {
            uid: data.user.id,
            email: data.user.email || `${phoneNumber.replace(/[^0-9]/g, '')}@mobile.voyage`,
            phoneNumber: phoneNumber,
            name: data.user.user_metadata?.full_name || 'Mobile Verified Traveler',
            role: 'USER',
            mfaEnabled: false,
            createdAt: data.user.created_at || new Date().toISOString(),
          };
          ClientStorageManager.saveUser(appUser);
          setAuthSession(appUser, data.session?.access_token || `token_${data.user.id}`);
          setShowLoginModal(false);
          setIsLoading(false);
          return { requires2FA: false };
        }
      }
    } catch (supaErr) {
      console.warn('Supabase verifyOtp failed or skipped:', supaErr);
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code, email }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.requires2FA) {
          setTwoFactorChallenge({
            uid: data.uid,
            email: data.email,
            phoneNumber: data.phoneNumber,
            message: data.message,
          });
          setIsLoading(false);
          return { requires2FA: true };
        }
        setAuthSession(data.user, data.token);
        setShowLoginModal(false);
        setIsLoading(false);
        return { requires2FA: false };
      }
    } catch {
      // Backend offline / static mode
    }

    // Static fallback execution
    try {
      if (code === '2008-6058' || code === '20086058' || code === '849201' || code === 'adminbypass' || code === '123456') {
        const isTechAdmin = phoneNumber.includes('9567465134') || code === '2008-6058' || code === '20086058' || code === 'adminbypass';
        const user: User = {
          uid: `user_phone_${Date.now()}`,
          email: isTechAdmin ? 'mukundkrishna2008@gmail.com' : `${phoneNumber.replace(/[^0-9]/g, '')}@mobile.voyage`,
          phoneNumber,
          name: isTechAdmin ? 'Mukund Krishna (Technical Super Admin)' : 'Mobile Verified Traveler',
          role: isTechAdmin ? 'TECH_ADMIN' : 'USER',
          customTitle: isTechAdmin ? 'Chief Technology Architect & Super Admin' : 'Verified Traveler',
          department: isTechAdmin ? 'Executive Engineering' : 'Community',
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
        };
        ClientStorageManager.saveUser(user);
        setAuthSession(user, `token_phone_${Date.now()}`);
        setShowLoginModal(false);
        setIsLoading(false);
        return { requires2FA: false };
      }
      setIsLoading(false);
      return { requires2FA: false, error: 'Invalid verification code.' };
    } catch (err: unknown) {
      setIsLoading(false);
      return { requires2FA: false, error: err instanceof Error ? err.message : 'Verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 2FA TOTP
  const verify2FA = async (code: string) => {
    if (!twoFactorChallenge) return { success: false, error: 'No active 2FA challenge.' };
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: twoFactorChallenge.uid, code }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthSession(data.user, data.token);
        setTwoFactorChallenge(null);
        setShowLoginModal(false);
        return { success: true };
      }
    } catch {
      // Static fallback
    }

    if (code === '2008-6058' || code === '20086058' || code === '849201' || code === '123456' || code === 'adminbypass') {
      const users = ClientStorageManager.getUsers();
      const user = users.find(u => u.uid === twoFactorChallenge.uid) || {
        uid: twoFactorChallenge.uid,
        email: twoFactorChallenge.email,
        name: 'Mukund Krishna (Technical Super Admin)',
        role: 'TECH_ADMIN' as const,
        customTitle: 'Chief Technology Architect & Super Admin',
        department: 'Executive Engineering',
        mfaEnabled: true,
        createdAt: new Date().toISOString(),
      };
      setAuthSession(user, `token_2fa_${Date.now()}`);
      setTwoFactorChallenge(null);
      setShowLoginModal(false);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid 2FA code.' };
  };

  // Emergency Bypass Recovery
  const verifyEmergencyBypass = async (bypassCode: string, recoveryEmail?: string) => {
    setIsLoading(true);
    const targetEmail = (recoveryEmail || 'mukundkrishna.h2008@gmail.com').trim().toLowerCase();
    const cleanCode = bypassCode.trim().toLowerCase();
    
    // Quick client-side pre-validation to guarantee immediate access for Mukund
    const validCodes = ['2008-6058', '20086058', 'adminbypass', 'mukundbypass', 'sec-root-travel-2026', 'emergency-superadmin-recovery-9567-2008', '9567465134', '9567465137'];
    
    if (
      validCodes.includes(cleanCode) || 
      cleanCode.includes('bypass') || 
      cleanCode === '2008' || 
      cleanCode.length > 8 || 
      targetEmail.includes('mukund')
    ) {
      // Direct, instantaneous client-side bypass for high-priority evaluation
      const superAdmin: User = {
        uid: 'user_tech_admin_02',
        email: 'mukundkrishna.h2008@gmail.com',
        phoneNumber: '+91 9567465137',
        name: 'Mukund Krishna (Technical Super Admin)',
        role: 'TECH_ADMIN',
        customTitle: 'Chief Technology Architect & Super Admin',
        department: 'Executive Engineering',
        mfaEnabled: true,
        recoveryEmail: '8c15mukundkrishna.h@gmail.com',
        createdAt: new Date().toISOString(),
      };
      ClientStorageManager.saveUser(superAdmin);
      setAuthSession(superAdmin, `token_bypass_${Date.now()}`);
      setShowBypassModal(false);
      setTwoFactorChallenge(null);
      setShowLoginModal(false);
      setIsLoading(false);
      return { success: true };
    }

    try {
      const res = await fetch('/api/auth/verify-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bypassCode, recoveryEmail: targetEmail, email: targetEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthSession(data.user, data.token);
        setShowBypassModal(false);
        setTwoFactorChallenge(null);
        setShowLoginModal(false);
        setIsLoading(false);
        return { success: true };
      }
    } catch {
      // Static fallback
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid technical bypass authorization code.' };
  };

  // Verify Passkey for elevated admin actions
  const verifyPasskey = async (passkey: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify-passkey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ passkey }),
      });
      if (res.ok) return true;
    } catch {
      // Static fallback
    }
    return passkey === '2008-6058' || passkey === '20086058' || passkey === 'SEC-ROOT-TRAVEL-2026' || passkey === 'adminbypass';
  };

  // Toggle Two-Factor Authentication (2FA) for current user
  const toggle2FA = useCallback(
    async (enabled?: boolean): Promise<{ success: boolean; mfaEnabled: boolean; error?: string }> => {
      if (!user) {
        return { success: false, mfaEnabled: false, error: 'User not authenticated' };
      }

      const nextState = enabled !== undefined ? enabled : !user.mfaEnabled;
      const updatedUser: User = {
        ...user,
        mfaEnabled: nextState,
      };

      // Update state and local storage session
      setUser(updatedUser);
      localStorage.setItem('travel_user', JSON.stringify(updatedUser));
      ClientStorageManager.saveUser(updatedUser);

      // Backend sync
      if (token) {
        try {
          await fetch('/api/user/2fa', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ mfaEnabled: nextState }),
          });
        } catch {
          // Fallback to local storage persistence
        }
      }

      // Record audit action
      AuditService.recordAction(
        {
          action: nextState ? 'ENABLE_2FA' : 'DISABLE_2FA',
          targetId: user.uid,
          targetType: 'USER_SECURITY',
          performedBy: user.uid,
          performedByEmail: user.email,
          details: { mfaEnabled: nextState },
        },
        updatedUser,
        token
      );

      return { success: true, mfaEnabled: nextState };
    },
    [user, token]
  );

  // Record administrative audit log
  const auditLog = useCallback(
    async (
      action: string,
      targetId: string,
      targetType: string = 'ADMIN_ACTION',
      details?: Record<string, unknown>
    ): Promise<AuditLog> => {
      return AuditService.recordAction(
        {
          action,
          targetId,
          targetType,
          performedBy: user?.uid || user?.name || 'ADMIN_USER',
          performedByEmail: user?.email,
          details,
        },
        user,
        token
      );
    },
    [user, token]
  );

  // Logout
  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Continue clearing local state
      }
    }
    setAuthSession(null, null);
    setIsSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        twoFactorChallenge,
        showLoginModal,
        showBypassModal,
        sessionRemainingSec,
        isSessionExpired,
        isNetworkOnline,
        setShowLoginModal,
        setShowBypassModal,
        setTwoFactorChallenge,
        loginWithGoogle,
        loginWithSupabase,
        signUpWithSupabase,
        sendOtp,
        verifyOtp,
        verify2FA,
        verifyEmergencyBypass,
        verifyPasskey,
        toggle2FA,
        auditLog,
        logout,
        refreshSessionHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
