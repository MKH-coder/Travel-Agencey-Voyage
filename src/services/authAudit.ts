import { AuthAuditLogEntry, AuthFailureCategory, ToastMessage } from '../types.ts';
import { AuditService } from './auditService.ts';

const STORAGE_KEY = 'voyage_auth_audit_logs';
const MAX_LOGS = 100;

type LogSubscriber = (entry: AuthAuditLogEntry) => void;
type ToastSubscriber = (toast: ToastMessage) => void;

class AuthAuditService {
  private logSubscribers: Set<LogSubscriber> = new Set();
  private toastSubscribers: Set<ToastSubscriber> = new Set();

  /**
   * Helper to capture detailed browser environment context
   */
  private getEnvironmentContext() {
    const isClient = typeof window !== 'undefined';
    const userAgent = isClient && navigator?.userAgent ? navigator.userAgent : 'Node/Server';
    const isMobile = isClient && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIframe = isClient ? window.self !== window.top : false;
    const origin = isClient ? window.location.origin : '';
    const hostname = isClient ? window.location.hostname : '';
    const pathname = isClient ? window.location.pathname : '';
    const cookieEnabled = isClient ? Boolean(navigator.cookieEnabled) : false;

    return {
      origin,
      hostname,
      pathname,
      isIframe,
      isMobile,
      userAgent,
      cookieEnabled,
    };
  }

  /**
   * Categorizes errors into standardized failure categories with user-friendly descriptions
   */
  private categorizeError(code: string, message: string): {
    category: AuthFailureCategory;
    title: string;
    description: string;
    suggestedAction?: string;
  } {
    const env = this.getEnvironmentContext();

    if (code === 'auth/popup-blocked') {
      return {
        category: 'POPUP_BLOCKED',
        title: 'Pop-up Window Blocked',
        description: env.isMobile
          ? 'Mobile browser restricted the Google sign-in window. Use Full-Screen Redirect instead.'
          : 'Your browser blocked the Google authentication pop-up. Allow pop-ups or use Full-Screen Redirect.',
        suggestedAction: 'Switch to Full-Screen Redirect or allow pop-ups in site settings.',
      };
    }

    if (code === 'auth/unauthorized-domain') {
      return {
        category: 'UNAUTHORIZED_DOMAIN',
        title: 'Domain Not Authorized in Firebase',
        description: `Deployment domain '${env.hostname}' is not authorized in Firebase Console (Authentication > Settings > Authorized domains).`,
        suggestedAction: `Add '${env.hostname}' to Firebase Console > Authentication > Settings > Authorized domains.`,
      };
    }

    if (code === 'auth/popup-closed-by-user') {
      return {
        category: 'POPUP_CLOSED_BY_USER',
        title: 'Sign-In Cancelled',
        description: 'The Google authentication pop-up was closed before completing verification.',
        suggestedAction: 'Click "Continue with Google" again to retry.',
      };
    }

    if (code === 'auth/cancelled-popup-request') {
      return {
        category: 'CANCELLED_REQUEST',
        title: 'Sign-In Request Superseded',
        description: 'A newer authentication request interrupted the existing sign-in flow.',
        suggestedAction: 'Retry by clicking the sign-in button once.',
      };
    }

    if (code === 'auth/network-request-failed') {
      return {
        category: 'NETWORK_ERROR',
        title: 'Network Connection Failed',
        description: 'Failed to communicate with Google authentication servers. Check your internet connection.',
        suggestedAction: 'Verify your network connection and retry.',
      };
    }

    if (code === 'auth/operation-not-allowed') {
      return {
        category: 'UNKNOWN',
        title: 'Google Sign-In Provider Disabled',
        description: 'Google authentication provider is not enabled in Firebase Console.',
        suggestedAction: 'Enable Google provider in Firebase Console > Authentication > Sign-in method.',
      };
    }

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return {
        category: 'INVALID_CREDENTIALS',
        title: 'Authentication Failed',
        description: message || 'The provided account credentials could not be verified.',
        suggestedAction: 'Check your credentials or use password reset.',
      };
    }

    return {
      category: 'UNKNOWN',
      title: 'Google Sign-In Notice',
      description: message || 'An unexpected error occurred during Google sign-in.',
      suggestedAction: 'Try again or sign in with your email and password.',
    };
  }

  /**
   * Persists an entry to localStorage with bounded history
   */
  private persistLog(entry: AuthAuditLogEntry): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getLogs();
      const updated = [entry, ...existing.slice(0, MAX_LOGS - 1)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('[AuthAudit] Failed to persist audit log:', err);
    }
  }

  /**
   * Dispatches a toast notification to all listeners
   */
  public showToast(toast: Omit<ToastMessage, 'id'> & { id?: string }): void {
    const toastEntry: ToastMessage = {
      id: toast.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: toast.title,
      message: toast.message,
      type: toast.type || 'info',
      duration: toast.duration ?? 7000,
      code: toast.code,
      action: toast.action,
    };

    this.toastSubscribers.forEach((subscriber) => {
      try {
        subscriber(toastEntry);
      } catch (err) {
        console.error('[AuthAudit] Error in toast subscriber:', err);
      }
    });
  }

  /**
   * Logs a detailed OAuth failure event, prints formatted developer diagnostics,
   * stores the log, and optionally presents a rich toast notification.
   */
  public logOAuthFailure(params: {
    provider: 'google';
    action: 'OAUTH_POPUP' | 'OAUTH_REDIRECT' | 'GET_REDIRECT_RESULT';
    error: unknown;
    email?: string;
    showToast?: boolean;
    onActionClick?: () => void;
  }): AuthAuditLogEntry {
    const errObj = params.error as { code?: string; message?: string; stack?: string } | undefined;
    const errorCode = errObj?.code || 'auth/unknown';
    const rawMessage = errObj?.message || (typeof params.error === 'string' ? params.error : 'Unknown error');

    const { category, title, description, suggestedAction } = this.categorizeError(errorCode, rawMessage);
    const environment = this.getEnvironmentContext();

    const entry: AuthAuditLogEntry = {
      id: `auth_err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      provider: params.provider,
      action: params.action,
      status: category === 'POPUP_CLOSED_BY_USER' || category === 'CANCELLED_REQUEST' ? 'CANCELLED' : 'FAILURE',
      errorCode,
      errorMessage: rawMessage,
      failureCategory: category,
      email: params.email,
      environment,
      details: {
        category,
        suggestedAction,
        rawError: rawMessage,
        stack: errObj?.stack,
      },
    };

    // 1. Formatted Developer Console Group
    if (typeof console !== 'undefined' && console.groupCollapsed) {
      const isWarn = category === 'POPUP_CLOSED_BY_USER' || category === 'CANCELLED_REQUEST';
      const badgeStyle = isWarn
        ? 'background: #f59e0b; color: #000; font-weight: bold; padding: 2px 6px; rounded: 4px;'
        : 'background: #ef4444; color: #fff; font-weight: bold; padding: 2px 6px; rounded: 4px;';

      console.groupCollapsed(`%cAuthAudit%c [${category}] ${errorCode}: ${title}`, badgeStyle, 'color: inherit;');
      console.log('Timestamp:', entry.timestamp);
      console.log('Action:', params.action);
      console.log('Error Code:', errorCode);
      console.log('Error Message:', rawMessage);
      console.log('User Email:', params.email || '(None provided)');
      console.log('Environment:', environment);
      if (suggestedAction) {
        console.info('%cResolution Tip:%c ' + suggestedAction, 'font-weight: bold; color: #3b82f6;', 'color: inherit;');
      }
      console.groupEnd();
    }

    // 2. Persist in client storage
    this.persistLog(entry);

    // 3. Notify real-time log subscribers
    this.logSubscribers.forEach((sub) => {
      try {
        sub(entry);
      } catch (subErr) {
        console.error('[AuthAudit] Log subscriber error:', subErr);
      }
    });

    // 4. Record compliance audit entry if user is an admin or high-risk
    if (params.email?.toLowerCase().includes('mukund') || category === 'UNAUTHORIZED_DOMAIN') {
      AuditService.recordAction({
        action: `AUTH_FAILURE_${category}`,
        targetId: params.email || 'OAUTH_CLIENT',
        targetType: 'AUTHENTICATION_EVENT',
        performedBy: params.email || 'GUEST',
        performedByEmail: params.email,
        details: {
          errorCode,
          category,
          action: params.action,
          origin: environment.origin,
          hostname: environment.hostname,
        },
      }).catch(() => {});
    }

    // 5. Trigger Toast Notification if requested
    if (params.showToast !== false) {
      let toastAction: ToastMessage['action'] = undefined;

      if (category === 'POPUP_BLOCKED' && params.onActionClick) {
        toastAction = {
          label: 'Use Redirect',
          onClick: params.onActionClick,
        };
      }

      this.showToast({
        title,
        message: description,
        type: category === 'POPUP_CLOSED_BY_USER' || category === 'CANCELLED_REQUEST' ? 'warning' : 'error',
        code: errorCode,
        duration: category === 'UNAUTHORIZED_DOMAIN' ? 10000 : 7000,
        action: toastAction,
      });
    }

    return entry;
  }

  /**
   * Logs a successful authentication event
   */
  public logAuthSuccess(params: {
    provider: 'google' | 'supabase' | 'email_password' | 'session' | 'bypass';
    action: 'OAUTH_POPUP' | 'OAUTH_REDIRECT' | 'GET_REDIRECT_RESULT' | 'PASSWORD_LOGIN' | 'PASSWORD_SIGNUP' | 'SESSION_RESTORE' | '2FA_VERIFY' | 'BYPASS_LOGIN';
    email?: string;
    uid?: string;
    details?: Record<string, unknown>;
    showToast?: boolean;
  }): AuthAuditLogEntry {
    const environment = this.getEnvironmentContext();
    const entry: AuthAuditLogEntry = {
      id: `auth_ok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      provider: params.provider,
      action: params.action,
      status: 'SUCCESS',
      errorMessage: '',
      email: params.email,
      environment,
      details: {
        uid: params.uid,
        ...params.details,
      },
    };

    if (typeof console !== 'undefined') {
      console.log(
        `%cAuthAudit%c [SUCCESS] ${params.provider.toUpperCase()} (${params.action}) - ${params.email || 'Authenticated'}`,
        'background: #10b981; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: inherit;'
      );
    }

    this.persistLog(entry);

    this.logSubscribers.forEach((sub) => {
      try {
        sub(entry);
      } catch (err) {
        console.error('[AuthAudit] Log subscriber error:', err);
      }
    });

    if (params.showToast) {
      this.showToast({
        title: 'Authentication Successful',
        message: `Welcome${params.email ? `, ${params.email}` : ''}!`,
        type: 'success',
        duration: 4000,
      });
    }

    return entry;
  }

  /**
   * Retrieve all stored audit logs, sorted newest first
   */
  public getLogs(): AuthAuditLogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Clears stored client-side auth audit history
   */
  public clearLogs(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[AuthAudit] Failed to clear logs:', err);
    }
  }

  /**
   * Exports logs formatted as a JSON string
   */
  public exportLogsAsJson(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  /**
   * Triggers a browser download of the audit logs as a JSON file
   */
  public downloadLogs(): void {
    if (typeof window === 'undefined') return;
    const json = this.exportLogsAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyage-auth-audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Subscribe to new audit log entries in real-time
   */
  public subscribe(listener: LogSubscriber): () => void {
    this.logSubscribers.add(listener);
    return () => {
      this.logSubscribers.delete(listener);
    };
  }

  /**
   * Register a listener for toast notification events
   */
  public onToast(listener: ToastSubscriber): () => void {
    this.toastSubscribers.add(listener);
    return () => {
      this.toastSubscribers.delete(listener);
    };
  }
}

export const AuthAudit = new AuthAuditService();
