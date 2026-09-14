import { AuditLog, User } from '../types.ts';
import { ClientStorageManager } from './clientStorage.ts';

export interface AuditLogOptions {
  action: string;
  targetId: string;
  targetType?: string;
  performedBy?: string;
  performedByEmail?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Records a successful administrative action along with timestamp and admin user ID to ensure compliance.
   */
  static async recordAction(
    options: AuditLogOptions,
    adminUser?: User | null,
    authToken?: string | null
  ): Promise<AuditLog> {
    const adminId = options.performedBy || adminUser?.uid || adminUser?.email || 'SYSTEM_ADMIN';
    const adminEmail = options.performedByEmail || adminUser?.email || undefined;
    const timestamp = new Date().toISOString();

    const logEntry: Omit<AuditLog, 'id' | 'timestamp'> = {
      action: options.action,
      performedBy: adminId,
      performedByEmail: adminEmail,
      targetId: options.targetId,
      targetType: options.targetType || 'ADMIN_ACTION',
      ipAddress: options.ipAddress || '127.0.0.1',
      details: {
        timestamp,
        adminId,
        adminEmail,
        ...options.details,
      },
    };

    // Store in ClientStorageManager locally
    const createdLog = ClientStorageManager.addAuditLog(logEntry);

    // Sync to backend API if auth token is available
    if (authToken) {
      try {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            action: options.action,
            targetId: options.targetId,
            targetType: options.targetType || 'ADMIN_ACTION',
            details: logEntry.details,
          }),
        });
      } catch {
        // Fallback to local storage
      }
    }

    return createdLog;
  }
}
