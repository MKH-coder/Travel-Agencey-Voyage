import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  where,
  Timestamp 
} from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Listing, User, AuditLog, CustomPost, PriceAlert } from '../types.ts';

// 1. Initialize Firebase App (Singleton)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} else {
  app = getApp();
}

// 2. Initialize Firestore Database Client & Auth
export const firestoreDb: Firestore = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || undefined
);

export const firebaseAuth: Auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId || '(default)';
export const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId || '(default)'}/data`;

/**
 * Firebase Synchronization Service
 * Provides bidirectional synchronization between local cache, custom posts, and live Cloud Firestore.
 */
export class FirebaseSyncService {
  private static isOnline = true;

  static async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = Date.now();
    try {
      // Test read on metadata or users collection
      const snap = await getDocs(query(collection(firestoreDb, 'users'), limit(1)));
      const latencyMs = Date.now() - start;
      this.isOnline = true;
      return {
        success: true,
        latencyMs,
        message: `Connected to Cloud Firestore (Database ID: ${FIRESTORE_DATABASE_ID}) in ${latencyMs}ms.`,
      };
    } catch (err: unknown) {
      this.isOnline = false;
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: `Firestore connection offline or permission restricted: ${errorMsg}`,
      };
    }
  }

  // --- Custom Posts Collection ---
  static async saveCustomPost(post: CustomPost): Promise<boolean> {
    try {
      const docRef = doc(firestoreDb, 'custom_posts', post.id);
      await setDoc(docRef, {
        ...post,
        syncedAt: Timestamp.now(),
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveCustomPost fallback:', err);
      return false;
    }
  }

  static async getCustomPosts(): Promise<CustomPost[]> {
    try {
      const snap = await getDocs(collection(firestoreDb, 'custom_posts'));
      const posts: CustomPost[] = [];
      snap.forEach(d => {
        posts.push(d.data() as CustomPost);
      });
      return posts;
    } catch (err) {
      console.warn('Firestore getCustomPosts fallback:', err);
      return [];
    }
  }

  static async deleteCustomPost(postId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(firestoreDb, 'custom_posts', postId));
      return true;
    } catch (err) {
      console.warn('Firestore deleteCustomPost fallback:', err);
      return false;
    }
  }

  // --- Users Collection ---
  static async saveUser(user: User): Promise<boolean> {
    try {
      const docRef = doc(firestoreDb, 'users', user.uid);
      await setDoc(docRef, {
        ...user,
        syncedAt: Timestamp.now(),
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveUser fallback:', err);
      return false;
    }
  }

  static async getUsers(): Promise<User[]> {
    try {
      const snap = await getDocs(collection(firestoreDb, 'users'));
      const users: User[] = [];
      snap.forEach(d => {
        users.push(d.data() as User);
      });
      return users;
    } catch (err) {
      console.warn('Firestore getUsers fallback:', err);
      return [];
    }
  }

  // --- Listings Collection ---
  static async saveListing(listing: Listing): Promise<boolean> {
    try {
      const docRef = doc(firestoreDb, 'listings', listing.id);
      await setDoc(docRef, {
        ...listing,
        syncedAt: Timestamp.now(),
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveListing fallback:', err);
      return false;
    }
  }

  static async getListings(): Promise<Listing[]> {
    try {
      const snap = await getDocs(collection(firestoreDb, 'listings'));
      const items: Listing[] = [];
      snap.forEach(d => {
        items.push(d.data() as Listing);
      });
      return items;
    } catch (err) {
      console.warn('Firestore getListings fallback:', err);
      return [];
    }
  }

  // --- Audit Logs Collection ---
  static async addAuditLog(log: AuditLog): Promise<boolean> {
    try {
      const docRef = doc(firestoreDb, 'audit_logs', log.id);
      await setDoc(docRef, {
        ...log,
        syncedAt: Timestamp.now(),
      });
      return true;
    } catch (err) {
      console.warn('Firestore addAuditLog fallback:', err);
      return false;
    }
  }

  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const q = query(collection(firestoreDb, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      const logs: AuditLog[] = [];
      snap.forEach(d => {
        logs.push(d.data() as AuditLog);
      });
      return logs;
    } catch (err) {
      console.warn('Firestore getAuditLogs fallback:', err);
      return [];
    }
  }

  /**
   * One-Click Seed and Bulk Sync to Firebase
   * Uploads all current local items, custom posts, users, and audit logs into live Firestore collections.
   */
  static async bulkSyncAllToFirestore(payload: {
    listings: Listing[];
    users: User[];
    customPosts: CustomPost[];
    auditLogs: AuditLog[];
  }): Promise<{
    success: boolean;
    syncedCounts: { listings: number; users: number; customPosts: number; auditLogs: number };
    error?: string;
  }> {
    const counts = { listings: 0, users: 0, customPosts: 0, auditLogs: 0 };
    try {
      // 1. Sync custom posts
      for (const p of payload.customPosts) {
        await setDoc(doc(firestoreDb, 'custom_posts', p.id), p, { merge: true });
        counts.customPosts++;
      }

      // 2. Sync users
      for (const u of payload.users) {
        await setDoc(doc(firestoreDb, 'users', u.uid), u, { merge: true });
        counts.users++;
      }

      // 3. Sync listings
      for (const l of payload.listings) {
        await setDoc(doc(firestoreDb, 'listings', l.id), l, { merge: true });
        counts.listings++;
      }

      // 4. Sync logs
      for (const a of payload.auditLogs.slice(0, 50)) {
        await setDoc(doc(firestoreDb, 'audit_logs', a.id), a, { merge: true });
        counts.auditLogs++;
      }

      return {
        success: true,
        syncedCounts: counts,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        syncedCounts: counts,
        error: msg,
      };
    }
  }

  // --- Price Alerts Collection ---
  static async savePriceAlert(alert: PriceAlert): Promise<boolean> {
    try {
      const docRef = doc(firestoreDb, 'priceAlerts', alert.id);
      await setDoc(docRef, {
        ...alert,
        syncedAt: Timestamp.now(),
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore savePriceAlert error:', err);
      return false;
    }
  }

  static async deletePriceAlert(alertId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(firestoreDb, 'priceAlerts', alertId));
      return true;
    } catch (err) {
      console.warn('Firestore deletePriceAlert error:', err);
      return false;
    }
  }

  static async getPriceAlertsForUser(userId: string): Promise<PriceAlert[]> {
    try {
      const q = query(collection(firestoreDb, 'priceAlerts'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const alerts: PriceAlert[] = [];
      snap.forEach(d => {
        alerts.push(d.data() as PriceAlert);
      });
      return alerts;
    } catch (err) {
      console.warn('Firestore getPriceAlertsForUser error:', err);
      return [];
    }
  }

  static async getPriceAlertForUserAndListing(userId: string, listingId: string): Promise<PriceAlert | null> {
    try {
      const q = query(
        collection(firestoreDb, 'priceAlerts'), 
        where('userId', '==', userId),
        where('listingId', '==', listingId)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      let alert: PriceAlert | null = null;
      snap.forEach(d => {
        alert = d.data() as PriceAlert;
      });
      return alert;
    } catch (err) {
      console.warn('Firestore getPriceAlertForUserAndListing error:', err);
      return null;
    }
  }
}
