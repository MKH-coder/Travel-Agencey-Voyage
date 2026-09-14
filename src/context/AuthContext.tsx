import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types.ts';

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
  setShowLoginModal: (show: boolean) => void;
  setShowBypassModal: (show: boolean) => void;
  setTwoFactorChallenge: (challenge: TwoFactorChallenge | null) => void;
  loginWithGoogle: (email: string, name?: string) => Promise<{ requires2FA: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; devCode?: string; isTechAdmin?: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ requires2FA: boolean; error?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmergencyBypass: (code: string, recoveryEmail?: string) => Promise<{ success: boolean; error?: string }>;
  verifyPasskey: (passkey: string) => Promise<boolean>;
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

  // Save/Clear local user cache
  const setAuthSession = useCallback((newUser: User | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser && newToken) {
      localStorage.setItem('travel_user', JSON.stringify(newUser));
      localStorage.setItem('travel_token', newToken);
      if (newUser.role === 'ADMIN' || newUser.role === 'TECH_SUBADMIN' || newUser.role === 'TECH_ADMIN') {
        setSessionRemainingSec(15 * 60);
      }
    } else {
      localStorage.removeItem('travel_user');
      localStorage.removeItem('travel_token');
      setSessionRemainingSec(null);
    }
  }, []);

  const refreshSessionHealth = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.remainingMs) {
          setSessionRemainingSec(Math.floor(data.remainingMs / 1000));
        }
      } else if (res.status === 401) {
        setIsSessionExpired(true);
        setAuthSession(null, null);
      }
    } catch {
      // Offline / transient error
    }
  }, [token, setAuthSession]);

  // Inactivity session timer countdown for Admins (15 minutes)
  useEffect(() => {
    if (!token || !user || (user.role !== 'ADMIN' && user.role !== 'TECH_SUBADMIN' && user.role !== 'TECH_ADMIN')) {
      return;
    }

    const interval = setInterval(() => {
      setSessionRemainingSec(prev => {
        if (prev === null) return 15 * 60;
        if (prev <= 1) {
          setIsSessionExpired(true);
          setAuthSession(null, null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [token, user, setAuthSession]);

  // Google Login
  const loginWithGoogle = async (email: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { requires2FA: false, error: data.error || 'Failed to sign in with Google' };
      }

      if (data.requires2FA) {
        setTwoFactorChallenge({
          uid: data.uid,
          email: data.email,
          phoneNumber: data.phoneNumber,
          message: data.message,
        });
        return { requires2FA: true };
      }

      setAuthSession(data.user, data.token);
      setShowLoginModal(false);
      return { requires2FA: false };
    } catch (err: unknown) {
      return { requires2FA: false, error: err instanceof Error ? err.message : 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const sendOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send OTP' };
      }
      return {
        success: true,
        devCode: data.devCode,
        isTechAdmin: data.isTechAdmin,
      };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (phoneNumber: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { requires2FA: false, error: data.error || 'Invalid OTP verification' };
      }

      if (data.requires2FA) {
        setTwoFactorChallenge({
          uid: data.uid,
          email: data.email,
          phoneNumber: data.phoneNumber,
          message: data.message,
        });
        return { requires2FA: true };
      }

      setAuthSession(data.user, data.token);
      setShowLoginModal(false);
      return { requires2FA: false };
    } catch (err: unknown) {
      return { requires2FA: false, error: err instanceof Error ? err.message : 'Network error' };
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
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || '2FA Verification failed' };
      }

      setAuthSession(data.user, data.token);
      setTwoFactorChallenge(null);
      setShowLoginModal(false);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Emergency Bypass Recovery
  const verifyEmergencyBypass = async (bypassCode: string, recoveryEmail?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bypassCode, recoveryEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Emergency bypass failed' };
      }

      setAuthSession(data.user, data.token);
      setShowBypassModal(false);
      setTwoFactorChallenge(null);
      setShowLoginModal(false);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    } finally {
      setIsLoading(false);
    }
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
      return res.ok;
    } catch {
      return false;
    }
  };

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
        setShowLoginModal,
        setShowBypassModal,
        setTwoFactorChallenge,
        loginWithGoogle,
        sendOtp,
        verifyOtp,
        verify2FA,
        verifyEmergencyBypass,
        verifyPasskey,
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
