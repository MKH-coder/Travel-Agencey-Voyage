import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { User, Listing, AuditLog, Booking, SavedTrip, CustomPost, FeedPost } from './types.ts';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase App for Server DB Sync
const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApp();

// Use initializeFirestore with experimentalForceLongPolling to eliminate benign idle gRPC stream warnings
const firestoreDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || undefined);

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: User[];
  listings: Listing[];
  audit_logs: AuditLog[];
  bookings: Booking[];
  saved_trips: SavedTrip[];
  custom_posts: CustomPost[];
  feed_posts: FeedPost[];
}

const INITIAL_CUSTOM_POSTS: CustomPost[] = [
  {
    id: 'post_tech_architect',
    title: 'Chief Technology Architect & Super Admin',
    department: 'Executive Engineering',
    baseRole: 'TECH_ADMIN',
    description: 'Full root authority, system security architecture, user administration, and Firebase cloud management.',
    privileges: [
      'PUBLISH_DIRECTLY',
      'APPROVE_QUEUE',
      'REJECT_QUEUE',
      'MANAGE_USERS',
      'ASSIGN_POSTS',
      'VIEW_AUDIT_LOGS',
      'DELETE_LISTINGS',
      'EDIT_ALL_CONTENT',
      'FIREBASE_CONSOLE_SYNC',
      'BYPASS_SECURITY_2FA'
    ],
    badgeColor: 'amber',
    createdBy: 'mukundkrishna2008@gmail.com',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'post_platform_director',
    title: 'Lead Platform Director & Super Admin',
    department: 'Platform Operations',
    baseRole: 'TECH_ADMIN',
    description: 'Strategic oversight across platform operations, content verification, and cloud synchronization.',
    privileges: [
      'PUBLISH_DIRECTLY',
      'APPROVE_QUEUE',
      'REJECT_QUEUE',
      'MANAGE_USERS',
      'ASSIGN_POSTS',
      'VIEW_AUDIT_LOGS',
      'DELETE_LISTINGS',
      'EDIT_ALL_CONTENT',
      'FIREBASE_CONSOLE_SYNC'
    ],
    badgeColor: 'amber',
    createdBy: 'mukundkrishna2008@gmail.com',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'post_infra_specialist',
    title: 'Senior Infrastructure & Security Specialist',
    department: 'Information Security',
    baseRole: 'TECH_SUBADMIN',
    description: 'Infrastructure health monitoring, security audit log analysis, and listing queue review.',
    privileges: [
      'APPROVE_QUEUE',
      'REJECT_QUEUE',
      'VIEW_AUDIT_LOGS',
      'EDIT_ALL_CONTENT',
      'FIREBASE_CONSOLE_SYNC'
    ],
    badgeColor: 'purple',
    createdBy: 'mukundkrishna2008@gmail.com',
    createdAt: '2025-01-05T00:00:00.000Z'
  },
  {
    id: 'post_curation_lead',
    title: 'Head of Destination & Hotel Curation',
    department: 'Content & Editorial',
    baseRole: 'ADMIN',
    description: 'Direct publishing of luxury travel guides, dining recommendations, and destination reviews.',
    privileges: [
      'PUBLISH_DIRECTLY',
      'EDIT_ALL_CONTENT'
    ],
    badgeColor: 'sky',
    createdBy: 'mukundkrishna2008@gmail.com',
    createdAt: '2025-01-10T00:00:00.000Z'
  },
  {
    id: 'post_travel_critic',
    title: 'Lead Travel & Culinary Critic',
    department: 'Hospitality Review',
    baseRole: 'ADMIN',
    description: 'Authoring in-depth hotel and dining appraisals with verified badge attachments.',
    privileges: [
      'PUBLISH_DIRECTLY'
    ],
    badgeColor: 'emerald',
    createdBy: 'mukundkrishna2008@gmail.com',
    createdAt: '2025-01-12T00:00:00.000Z'
  }
];

const INITIAL_USERS: User[] = [
  {
    uid: 'user_tech_admin_01',
    email: 'mukundkrishna2008@gmail.com',
    phoneNumber: '+91 9567465134',
    name: 'Mukund Krishna (Technical Super Admin)',
    role: 'TECH_ADMIN',
    mfaEnabled: true,
    recoveryEmail: '8c15mukundkrishna.h@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_subadmin_01',
    email: 'mukundkrishna.h@gmail.com',
    phoneNumber: '+91 9567465135',
    name: 'Mukund Krishna (Technical Sub-Admin)',
    role: 'TECH_SUBADMIN',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_subadmin_02',
    email: '8c15mukundkrishna.h@gmail.com',
    phoneNumber: '+91 9567465136',
    name: 'Mukund Krishna Backup (Technical Sub-Admin)',
    role: 'TECH_SUBADMIN',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_admin_02',
    email: 'mukundkrishna.h2008@gmail.com',
    phoneNumber: '+91 9567465137',
    name: 'Mukund Krishna Dev (Technical Super Admin)',
    role: 'TECH_ADMIN',
    customTitle: 'Lead Platform Director & Super Admin',
    department: 'Platform Operations',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_admin_02',
    email: 'sarah.content@travelplatform.io',
    phoneNumber: '+1 555-019-2834',
    name: 'Sarah Jenkins (Standard Admin)',
    role: 'ADMIN',
    mfaEnabled: false,
    recoveryEmail: 'sarah.backup@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_traveler_03',
    email: 'alex.globetrotter@example.com',
    phoneNumber: '+1 555-482-1920',
    name: 'Alex Rivera',
    role: 'USER',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_LISTINGS: Listing[] = [];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-init-01',
    action: 'SYSTEM_INITIALIZED',
    performedBy: 'mukundkrishna2008@gmail.com',
    targetId: 'TRAVEL_PLATFORM_CORE',
    targetType: 'SYSTEM',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    details: { event: 'Provisioned Technical Admin and Multi-Theme Engine' }
  },
  {
    id: 'audit-init-02',
    action: 'SUBMIT_PENDING_LISTING',
    performedBy: 'sarah.content@travelplatform.io',
    targetId: 'list-pending-banff-06',
    targetType: 'LISTING',
    ipAddress: '192.168.1.45',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    details: { status: 'PENDING_APPROVAL', title: 'Banff Moraine Lake Glacial Canoe' }
  }
];

const DEFAULT_COORDS_MAP: Record<string, { lat: number; lng: number }> = {
  'list-santorini-01': { lat: 36.4618, lng: 25.3753 },
  'list-hotel-amalfi-02': { lat: 40.6281, lng: 14.4850 },
  'list-dining-kyoto-03': { lat: 35.0037, lng: 135.7772 },
  'list-swiss-alps-04': { lat: 45.9765, lng: 7.7491 },
  'list-hotel-bali-05': { lat: -8.5069, lng: 115.2625 },
  'list-pending-banff-06': { lat: 51.4968, lng: -115.9281 },
  'list-pending-paris-07': { lat: 48.8534, lng: 2.3338 },
  'list-tokyo-sushi-08': { lat: 35.6719, lng: 139.7640 },
  'list-hotel-como-09': { lat: 45.9658, lng: 9.2025 },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.readFromDisk();
    this.initFirestoreSync();
  }

  private async safeFirestoreWrite(collectionName: string, docId: string, data: any) {
    try {
      await setDoc(doc(firestoreDb, collectionName, docId), data, { merge: true });
    } catch (err) {
      console.error(`Failed to write document ${docId} to Firestore collection ${collectionName}:`, err);
    }
  }

  private async safeFirestoreDelete(collectionName: string, docId: string) {
    try {
      await deleteDoc(doc(firestoreDb, collectionName, docId));
    } catch (err) {
      console.error(`Failed to delete document ${docId} from Firestore collection ${collectionName}:`, err);
    }
  }

  private async initFirestoreSync() {
    try {
      console.log('Initializing background real-time Firestore synchronization with local cache...');

      // Clear out legacy default listings from Firestore if they exist to keep the catalogue empty to begin with
      try {
        const listingsSnap = await getDocs(collection(firestoreDb, 'listings'));
        const defaultListingIds = [
          'list-santorini-01',
          'list-kyoto-02',
          'list-amalfi-03',
          'list-swiss-04',
          'list-tokyo-05',
          'list-paris-06',
          'list-hotel-amalfi-02',
          'list-dining-kyoto-03',
          'list-swiss-alps-04',
          'list-hotel-bali-05',
          'list-pending-banff-06',
          'list-pending-paris-07',
          'list-tokyo-sushi-08',
          'list-hotel-como-09'
        ];
        for (const docObj of listingsSnap.docs) {
          const id = docObj.id;
          if (defaultListingIds.includes(id) || id.startsWith('list-')) {
            console.log(`[Firestore Cleanup] Deleting legacy default listing: ${id}`);
            await this.safeFirestoreDelete('listings', id);
          }
        }
      } catch (err) {
        console.warn('Failed to clean up legacy default listings from Firestore on startup:', err);
      }

      // 1. Real-time Listings sync
      try {
        onSnapshot(collection(firestoreDb, 'listings'), (snapshot) => {
          const firestoreListings: Listing[] = [];
          snapshot.forEach(d => {
            firestoreListings.push(d.data() as Listing);
          });

          const mappedListings = firestoreListings.map((item: Listing) => {
            if (!item.coordinates && DEFAULT_COORDS_MAP[item.id]) {
              return { ...item, coordinates: DEFAULT_COORDS_MAP[item.id] };
            }
            return item;
          });

          this.data.listings = mappedListings;
          this.writeToDisk(this.data);
          console.log(`[Firestore Realtime] Synced ${this.data.listings.length} listings.`);
        }, (err) => {
          console.warn('[Firestore Realtime] Error syncing listings:', err);
        });
      } catch (err) {
        console.warn('Failed to attach listings snapshot listener:', err);
      }

      // 2. Real-time Users sync
      try {
        onSnapshot(collection(firestoreDb, 'users'), (snapshot) => {
          const firestoreUsers: User[] = [];
          snapshot.forEach(d => {
            firestoreUsers.push(d.data() as User);
          });

          // Ensure all initial users are in the synced user base
          for (const initUser of INITIAL_USERS) {
            const existingIdx = firestoreUsers.findIndex(u => u.email.toLowerCase() === initUser.email.toLowerCase());
            if (existingIdx === -1) {
              firestoreUsers.push(initUser);
            } else if (initUser.role === 'TECH_SUBADMIN' && firestoreUsers[existingIdx].role !== 'TECH_SUBADMIN') {
              firestoreUsers[existingIdx].role = 'TECH_SUBADMIN';
            }
          }

          this.data.users = firestoreUsers;
          this.writeToDisk(this.data);
          console.log(`[Firestore Realtime] Synced ${this.data.users.length} users.`);
        }, (err) => {
          console.warn('[Firestore Realtime] Error syncing users:', err);
        });
      } catch (err) {
        console.warn('Failed to attach users snapshot listener:', err);
      }

      // 3. Real-time Custom Posts sync
      try {
        onSnapshot(collection(firestoreDb, 'custom_posts'), (snapshot) => {
          const firestoreCustomPosts: CustomPost[] = [];
          snapshot.forEach(d => {
            firestoreCustomPosts.push(d.data() as CustomPost);
          });

          this.data.custom_posts = firestoreCustomPosts.length > 0 ? firestoreCustomPosts : INITIAL_CUSTOM_POSTS;
          this.writeToDisk(this.data);
          console.log(`[Firestore Realtime] Synced ${this.data.custom_posts.length} custom posts.`);
        }, (err) => {
          console.warn('[Firestore Realtime] Error syncing custom posts:', err);
        });
      } catch (err) {
        console.warn('Failed to attach custom posts snapshot listener:', err);
      }

      // 3.5. Real-time Feed Posts sync
      try {
        onSnapshot(collection(firestoreDb, 'feed_posts'), (snapshot) => {
          const firestoreFeedPosts: FeedPost[] = [];
          snapshot.forEach(d => {
            firestoreFeedPosts.push(d.data() as FeedPost);
          });
          
          this.data.feed_posts = firestoreFeedPosts;
          this.writeToDisk(this.data);
          console.log(`[Firestore Realtime] Synced ${this.data.feed_posts.length} feed posts.`);
        }, (err) => {
          console.warn('[Firestore Realtime] Error syncing feed posts:', err);
        });
      } catch (err) {
        console.warn('Failed to attach feed posts snapshot listener:', err);
      }

      // 4. Real-time Audit Logs sync
      try {
        onSnapshot(collection(firestoreDb, 'audit_logs'), (snapshot) => {
          const firestoreAuditLogs: AuditLog[] = [];
          snapshot.forEach(d => {
            firestoreAuditLogs.push(d.data() as AuditLog);
          });

          firestoreAuditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          this.data.audit_logs = firestoreAuditLogs.slice(0, 500);
          this.writeToDisk(this.data);
          console.log(`[Firestore Realtime] Synced ${this.data.audit_logs.length} audit logs.`);
        }, (err) => {
          console.warn('[Firestore Realtime] Error syncing audit logs:', err);
        });
      } catch (err) {
        console.warn('Failed to attach audit logs snapshot listener:', err);
      }

    } catch (err) {
      console.warn('Failed to initialize Firestore synchronization:', err);
    }
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Ensure users include all initial users (especially Technical Sub-Admins)
        const users: User[] = parsed.users?.length ? [...parsed.users] : [...INITIAL_USERS];
        for (const initUser of INITIAL_USERS) {
          const existingIdx = users.findIndex(u => u.email.toLowerCase() === initUser.email.toLowerCase());
          if (existingIdx === -1) {
            users.push(initUser);
          } else if (initUser.role === 'TECH_SUBADMIN' && users[existingIdx].role !== 'TECH_SUBADMIN') {
            users[existingIdx].role = 'TECH_SUBADMIN';
          }
        }

        // Ensure listings have coordinates applied if needed
        const listings: Listing[] = (Array.isArray(parsed.listings) ? parsed.listings : INITIAL_LISTINGS).map((item: Listing) => {
          if (!item.coordinates && DEFAULT_COORDS_MAP[item.id]) {
            return { ...item, coordinates: DEFAULT_COORDS_MAP[item.id] };
          }
          return item;
        });

        const custom_posts = Array.isArray(parsed.custom_posts) && parsed.custom_posts.length > 0
          ? parsed.custom_posts
          : INITIAL_CUSTOM_POSTS;

        const data: DatabaseSchema = {
          users,
          listings,
          audit_logs: parsed.audit_logs?.length ? parsed.audit_logs : INITIAL_AUDIT_LOGS,
          bookings: parsed.bookings || [],
          saved_trips: parsed.saved_trips || [],
          custom_posts,
          feed_posts: parsed.feed_posts || [],
        };
        this.writeToDisk(data);
        return data;
      }
    } catch (e) {
      console.warn('Error reading database from disk, using initial seed:', e);
    }
    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      listings: INITIAL_LISTINGS,
      audit_logs: INITIAL_AUDIT_LOGS,
      bookings: [],
      saved_trips: [],
      custom_posts: INITIAL_CUSTOM_POSTS,
      feed_posts: [],
    };
    this.writeToDisk(initial);
    return initial;
  }

  private writeToDisk(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database to disk:', e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(uid: string): User | undefined {
    return this.data.users.find(u => u.uid === uid);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByPhone(phone: string): User | undefined {
    const clean = phone.replace(/\s+/g, '');
    return this.data.users.find(u => u.phoneNumber?.replace(/\s+/g, '') === clean);
  }

  saveUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.uid === user.uid);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      this.data.users.push(user);
    }
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('users', user.uid, user);
    return user;
  }

  updateUserRole(uid: string, role: User['role'], customTitle?: string, department?: string): User | null {
    const user = this.getUserById(uid);
    if (!user) return null;
    user.role = role;
    if (customTitle !== undefined) user.customTitle = customTitle;
    if (department !== undefined) user.department = department;
    this.writeToDisk(this.data);
    return user;
  }

  deleteUser(uid: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.uid !== uid);
    if (this.data.users.length !== initialLen) {
      this.writeToDisk(this.data);
      this.safeFirestoreDelete('users', uid);
      return true;
    }
    return false;
  }

  // Listings
  getListings(): Listing[] {
    return this.data.listings;
  }

  getListingById(id: string): Listing | undefined {
    return this.data.listings.find(l => l.id === id);
  }

  createListing(listing: Listing): Listing {
    this.data.listings.unshift(listing);
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('listings', listing.id, listing);
    return listing;
  }

  updateListing(id: string, updates: Partial<Listing>): Listing | null {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return null;
    const current = this.data.listings[idx];
    const updated: Listing = {
      ...current,
      ...updates,
      timestamps: {
        ...current.timestamps,
        updatedAt: new Date().toISOString(),
        ...(updates.status === 'PUBLISHED' && !current.timestamps.approvedAt ? { approvedAt: new Date().toISOString() } : {}),
        ...(updates.status === 'PENDING_APPROVAL' ? { submittedAt: new Date().toISOString() } : {})
      }
    };
    this.data.listings[idx] = updated;
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('listings', id, updated);
    return updated;
  }

  deleteListing(id: string): boolean {
    const initialLen = this.data.listings.length;
    this.data.listings = this.data.listings.filter(l => l.id !== id);
    if (this.data.listings.length !== initialLen) {
      this.writeToDisk(this.data);
      this.safeFirestoreDelete('listings', id);
      return true;
    }
    return false;
  }

  deleteAllListings(): boolean {
    const ids = this.data.listings.map(l => l.id);
    this.data.listings = [];
    this.writeToDisk(this.data);
    for (const id of ids) {
      this.safeFirestoreDelete('listings', id);
    }
    return true;
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.data.audit_logs.unshift(newLog);
    // Keep max 500 logs
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('audit_logs', newLog.id, newLog);
    return newLog;
  }

  // Bookings
  getBookings(userId?: string): Booking[] {
    if (!userId) return this.data.bookings;
    return this.data.bookings.filter(b => b.userId === userId);
  }

  createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const newBooking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...booking,
    };
    this.data.bookings.unshift(newBooking);
    this.writeToDisk(this.data);
    return newBooking;
  }

  // Saved Trips
  getSavedTrips(userId: string): Listing[] {
    if (!this.data.saved_trips) this.data.saved_trips = [];
    const userSaved = this.data.saved_trips.filter(s => s.userId === userId);
    const listingMap = new Map(this.data.listings.map(l => [l.id, l]));
    return userSaved
      .map(s => listingMap.get(s.listingId))
      .filter((l): l is Listing => Boolean(l));
  }

  getSavedTripIds(userId: string): string[] {
    if (!this.data.saved_trips) this.data.saved_trips = [];
    return this.data.saved_trips
      .filter(s => s.userId === userId)
      .map(s => s.listingId);
  }

  saveTrip(userId: string, listingId: string): SavedTrip {
    if (!this.data.saved_trips) this.data.saved_trips = [];
    const existing = this.data.saved_trips.find(s => s.userId === userId && s.listingId === listingId);
    if (existing) return existing;

    const newSaved: SavedTrip = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      listingId,
      createdAt: new Date().toISOString(),
    };
    this.data.saved_trips.unshift(newSaved);
    this.writeToDisk(this.data);
    return newSaved;
  }

  removeSavedTrip(userId: string, listingId: string): boolean {
    if (!this.data.saved_trips) return false;
    const initialLen = this.data.saved_trips.length;
    this.data.saved_trips = this.data.saved_trips.filter(s => !(s.userId === userId && s.listingId === listingId));
    if (this.data.saved_trips.length !== initialLen) {
      this.writeToDisk(this.data);
      return true;
    }
    return false;
  }

  // Custom Posts / Privilege Templates
  getCustomPosts(): CustomPost[] {
    if (!this.data.custom_posts) {
      this.data.custom_posts = INITIAL_CUSTOM_POSTS;
    }
    return this.data.custom_posts;
  }

  saveCustomPost(post: CustomPost): CustomPost {
    if (!this.data.custom_posts) {
      this.data.custom_posts = INITIAL_CUSTOM_POSTS;
    }
    const idx = this.data.custom_posts.findIndex(p => p.id === post.id);
    if (idx >= 0) {
      this.data.custom_posts[idx] = post;
    } else {
      this.data.custom_posts.unshift(post);
    }
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('custom_posts', post.id, post);
    return post;
  }

  deleteCustomPost(id: string): boolean {
    if (!this.data.custom_posts) return false;
    const initialLen = this.data.custom_posts.length;
    this.data.custom_posts = this.data.custom_posts.filter(p => p.id !== id);
    if (this.data.custom_posts.length !== initialLen) {
      this.writeToDisk(this.data);
      this.safeFirestoreDelete('custom_posts', id);
      return true;
    }
    return false;
  }

  // --- Feed Posts ---
  
  getFeedPosts(): FeedPost[] {
    if (!this.data.feed_posts) this.data.feed_posts = [];
    return this.data.feed_posts;
  }

  saveFeedPost(post: FeedPost): FeedPost {
    if (!this.data.feed_posts) this.data.feed_posts = [];
    const idx = this.data.feed_posts.findIndex(p => p.id === post.id);
    if (idx >= 0) {
      this.data.feed_posts[idx] = post;
    } else {
      this.data.feed_posts.unshift(post);
    }
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('feed_posts', post.id, post);
    return post;
  }

  deleteFeedPost(id: string): boolean {
    if (!this.data.feed_posts) return false;
    const initialLen = this.data.feed_posts.length;
    this.data.feed_posts = this.data.feed_posts.filter(p => p.id !== id);
    if (this.data.feed_posts.length !== initialLen) {
      this.writeToDisk(this.data);
      this.safeFirestoreDelete('feed_posts', id);
      return true;
    }
    return false;
  }
}

export const db = new Database();
