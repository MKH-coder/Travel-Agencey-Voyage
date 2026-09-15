import { Listing, User, CustomPost, AuditLog, Booking, PriceAlert } from '../types.ts';

export const SUPABASE_URL = 'https://iunwfdzefyvwcvalhdzv.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_eb6-PYu0SLS5QlB4cBFMXg_a3UrtWNG';
export const SUPABASE_CONSOLE_URL = 'https://supabase.com/dashboard';

export class SupabaseSyncService {
  private static isOnline = true;

  static async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      // Test read of a lightweight endpoint (e.g. schema or standard tables)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/listings?select=id&limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const latencyMs = Date.now() - start;
      if (res.ok) {
        this.isOnline = true;
        return {
          success: true,
          latencyMs,
          message: `Connected to Supabase PostgreSQL Database in ${latencyMs}ms.`
        };
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err: unknown) {
      this.isOnline = false;
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: `Supabase connection failed or tables not seeded yet: ${errorMsg}`
      };
    }
  }

  static async bulkSyncAllToSupabase(payload: {
    listings: Listing[];
    users: User[];
    customPosts: CustomPost[];
    auditLogs: AuditLog[];
    bookings?: Booking[];
    priceAlerts?: PriceAlert[];
  }): Promise<{
    success: boolean;
    syncedCounts: { listings: number; users: number; customPosts: number; auditLogs: number; bookings: number; priceAlerts: number };
    error?: string;
  }> {
    const counts = { listings: 0, users: 0, customPosts: 0, auditLogs: 0, bookings: 0, priceAlerts: 0 };
    try {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Simulate relational UPSERT
      };

      // 1. Listings Table Upsert
      if (payload.listings.length > 0) {
        const mappedListings = payload.listings.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          country: item.country,
          price: Number(item.price),
          rating: Number(item.rating),
          images: item.images,
          status: item.status,
          createdAt: new Date().toISOString()
        }));

        const res = await fetch(`${SUPABASE_URL}/rest/v1/listings`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mappedListings)
        });
        if (res.ok) counts.listings = mappedListings.length;
      }

      // 2. Users Table Upsert
      if (payload.users.length > 0) {
        const mappedUsers = payload.users.map(item => ({
          uid: item.uid,
          name: item.name,
          email: item.email,
          role: item.role,
          customTitle: item.customTitle || null,
          department: item.department || null,
          avatar: item.avatar || null,
          createdAt: item.createdAt || new Date().toISOString()
        }));

        const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mappedUsers)
        });
        if (res.ok) counts.users = mappedUsers.length;
      }

      // 3. Custom Posts Table Upsert
      if (payload.customPosts.length > 0) {
        const mappedPosts = payload.customPosts.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          department: item.department,
          privileges: item.privileges,
          baseRole: item.baseRole || 'ADMIN',
          createdAt: item.createdAt || new Date().toISOString()
        }));

        const res = await fetch(`${SUPABASE_URL}/rest/v1/custom_posts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mappedPosts)
        });
        if (res.ok) counts.customPosts = mappedPosts.length;
      }

      // 4. Audit Logs Table Upsert
      if (payload.auditLogs.length > 0) {
        const mappedLogs = payload.auditLogs.slice(0, 50).map(item => ({
          id: item.id,
          action: item.action,
          performedBy: item.performedBy,
          targetId: item.targetId || null,
          timestamp: item.timestamp,
          details: item.details || null
        }));

        const res = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mappedLogs)
        });
        if (res.ok) counts.auditLogs = mappedLogs.length;
      }

      // 5. Bookings Table Upsert
      if (payload.bookings && payload.bookings.length > 0) {
        const mappedBookings = payload.bookings.map(item => ({
          id: item.id,
          userId: item.userId,
          listingId: item.listingId,
          listingTitle: item.listingTitle,
          listingImage: item.listingImage,
          listingCategory: item.listingCategory,
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate || null,
          guests: Number(item.guests),
          totalPrice: Number(item.totalPrice),
          status: item.status,
          createdAt: item.createdAt || new Date().toISOString()
        }));

        const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mappedBookings)
        });
        if (res.ok) counts.bookings = mappedBookings.length;
      }

      // 6. Price Alerts Table Upsert
      if (payload.priceAlerts && payload.priceAlerts.length > 0) {
        const mappedAlerts = payload.priceAlerts.map(item => ({
          id: item.id,
          userId: item.userId,
          userEmail: item.userEmail,
          listingId: item.listingId,
          listingTitle: item.listingTitle,
          targetPrice: Number(item.targetPrice),
          active: Boolean(item.active),
          createdAt: item.createdAt || new Date().toISOString()
        }));

        const res = await fetch(`${SUPABASE_URL}/rest/v1/price_alerts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mappedAlerts)
        });
        if (res.ok) counts.priceAlerts = mappedAlerts.length;
      }

      return {
        success: true,
        syncedCounts: counts
      };
    } catch (err: unknown) {
      console.error('Supabase bulkSync error:', err);
      return {
        success: false,
        syncedCounts: counts,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }
}
