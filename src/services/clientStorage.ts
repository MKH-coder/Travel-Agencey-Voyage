import { User, Listing, AuditLog, UserRole, CustomPost, PostPrivilege } from '../types.ts';
import { DEFAULT_LISTINGS } from '../data/defaultData.ts';

const USERS_STORAGE_KEY = 'voyage_db_users';
const LISTINGS_STORAGE_KEY = 'voyage_db_listings';
const LOGS_STORAGE_KEY = 'voyage_db_audit_logs';
const CUSTOM_POSTS_STORAGE_KEY = 'voyage_db_custom_posts';

export const INITIAL_CUSTOM_POSTS: CustomPost[] = [
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

export const INITIAL_USERS: User[] = [
  {
    uid: 'user_tech_admin_01',
    email: 'mukundkrishna2008@gmail.com',
    phoneNumber: '+91 9567465134',
    name: 'Mukund Krishna (Technical Super Admin)',
    role: 'TECH_ADMIN',
    customTitle: 'Chief Technology Architect & Super Admin',
    department: 'Executive Engineering',
    mfaEnabled: true,
    recoveryEmail: '8c15mukundkrishna.h@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    uid: 'user_tech_subadmin_03',
    email: 'mukundkrishna.h2008@gmail.com',
    phoneNumber: '+91 9567465137',
    name: 'Mukund Krishna Dev (Technical Super Admin)',
    role: 'TECH_ADMIN',
    customTitle: 'Lead Platform Director & Super Admin',
    department: 'Platform Operations',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    createdAt: '2025-01-02T00:00:00.000Z',
  },
  {
    uid: 'user_tech_subadmin_01',
    email: 'mukundkrishna.h@gmail.com',
    phoneNumber: '+91 9567465135',
    name: 'Mukund Krishna (Technical Sub-Admin)',
    role: 'TECH_SUBADMIN',
    customTitle: 'Senior Infrastructure Engineer',
    department: 'Core Infrastructure',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    createdAt: '2025-01-05T00:00:00.000Z',
  },
  {
    uid: 'user_tech_subadmin_02',
    email: '8c15mukundkrishna.h@gmail.com',
    phoneNumber: '+91 9567465136',
    name: 'Mukund Krishna Backup (Technical Sub-Admin)',
    role: 'TECH_SUBADMIN',
    customTitle: 'Security Systems Specialist',
    department: 'Information Security',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
    createdAt: '2025-01-08T00:00:00.000Z',
  },
  {
    uid: 'user_admin_02',
    email: 'sarah.content@travelplatform.io',
    phoneNumber: '+1 555-019-2834',
    name: 'Sarah Jenkins (Standard Admin)',
    role: 'ADMIN',
    customTitle: 'Head of Destination Curation',
    department: 'Content & Editorial',
    mfaEnabled: false,
    recoveryEmail: 'sarah.backup@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    createdAt: '2025-01-10T00:00:00.000Z',
  },
  {
    uid: 'user_traveler_03',
    email: 'alex.globetrotter@example.com',
    phoneNumber: '+1 555-482-1920',
    name: 'Alex Rivera (Verified Traveler)',
    role: 'USER',
    customTitle: 'Featured Community Explorer',
    department: 'Global Community',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: '2025-01-15T00:00:00.000Z',
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-init-01',
    action: 'SYSTEM_BOOTSTRAP',
    performedBy: 'System Engine',
    targetId: 'TRAVEL_PLATFORM_CORE',
    targetType: 'SYSTEM',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    details: { version: '2.4.0', environment: 'Production & Static Hybrid' }
  },
  {
    id: 'log-init-02',
    action: 'TECH_ADMIN_LOGIN_SUCCESS',
    performedBy: 'mukundkrishna2008@gmail.com',
    targetId: 'AUTH_SESSION',
    targetType: 'AUTH',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    details: { method: 'GOOGLE_OAUTH_VERIFIED', role: 'TECH_ADMIN' }
  }
];

export class ClientStorageManager {
  // Users
  static getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all initial super admins exist in list
        const existingEmails = new Set(parsed.map((u: User) => u.email.toLowerCase()));
        let changed = false;
        INITIAL_USERS.forEach(initUser => {
          if (!existingEmails.has(initUser.email.toLowerCase())) {
            parsed.unshift(initUser);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUser(user: User): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
    return user;
  }

  static updateUserRoleAndPost(
    uid: string,
    newRole: UserRole,
    customTitle?: string,
    department?: string
  ): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.uid === uid);
    if (!user) return null;

    user.role = newRole;
    if (customTitle !== undefined) user.customTitle = customTitle;
    if (department !== undefined) user.department = department;

    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }

    this.addAuditLog({
      action: 'UPDATE_USER_ROLE_AND_POST',
      performedBy: 'Technical Super Admin',
      targetId: user.uid,
      targetType: 'USER',
      ipAddress: '127.0.0.1',
      details: { email: user.email, newRole, customTitle, department }
    });

    return user;
  }

  static deleteUser(uid: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.uid !== uid);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    this.addAuditLog({
      action: 'DELETE_USER',
      performedBy: 'Technical Super Admin',
      targetId: uid,
      targetType: 'USER',
      ipAddress: '127.0.0.1',
      details: { deletedUid: uid }
    });
    return true;
  }

  // Listings
  static getListings(): Listing[] {
    try {
      const data = localStorage.getItem(LISTINGS_STORAGE_KEY);
      if (data === null) {
        localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_LISTINGS));
        return DEFAULT_LISTINGS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return DEFAULT_LISTINGS;
    } catch {
      return DEFAULT_LISTINGS;
    }
  }

  static saveListing(listing: Listing): Listing {
    const listings = this.getListings();
    const index = listings.findIndex(l => l.id === listing.id);
    if (index >= 0) {
      listings[index] = listing;
    } else {
      listings.unshift(listing);
    }
    try {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    } catch {
      // ignore
    }
    this.addAuditLog({
      action: listing.status === 'PUBLISHED' ? 'PUBLISH_LISTING' : 'SUBMIT_PENDING_LISTING',
      performedBy: listing.createdByName || listing.createdBy || 'Admin',
      targetId: listing.id,
      targetType: 'LISTING',
      ipAddress: '127.0.0.1',
      details: { title: listing.title, category: listing.category, price: listing.price, status: listing.status }
    });
    return listing;
  }

  static deleteListing(id: string): boolean {
    const listings = this.getListings();
    const filtered = listings.filter(l => l.id !== id);
    try {
      localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    this.addAuditLog({
      action: 'DELETE_LISTING',
      performedBy: 'Technical Super Admin',
      targetId: id,
      targetType: 'LISTING',
      ipAddress: '127.0.0.1',
      details: { deletedListingId: id }
    });
    return true;
  }

  // Custom Posts / Privilege Templates
  static getCustomPosts(): CustomPost[] {
    try {
      const data = localStorage.getItem(CUSTOM_POSTS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOM_POSTS));
        return INITIAL_CUSTOM_POSTS;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CUSTOM_POSTS;
    } catch {
      return INITIAL_CUSTOM_POSTS;
    }
  }

  static saveCustomPost(post: CustomPost): CustomPost {
    const posts = this.getCustomPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
    }
    try {
      localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // ignore
    }
    this.addAuditLog({
      action: 'SAVE_CUSTOM_POST_TEMPLATE',
      performedBy: post.createdBy || 'Technical Super Admin',
      targetId: post.id,
      targetType: 'CUSTOM_POST',
      ipAddress: '127.0.0.1',
      details: { title: post.title, department: post.department, baseRole: post.baseRole, privileges: post.privileges }
    });
    return post;
  }

  static deleteCustomPost(id: string): boolean {
    const posts = this.getCustomPosts();
    const filtered = posts.filter(p => p.id !== id);
    try {
      localStorage.setItem(CUSTOM_POSTS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    this.addAuditLog({
      action: 'DELETE_CUSTOM_POST_TEMPLATE',
      performedBy: 'Technical Super Admin',
      targetId: id,
      targetType: 'CUSTOM_POST',
      ipAddress: '127.0.0.1',
      details: { deletedPostId: id }
    });
    return true;
  }

  // Audit Logs
  static getAuditLogs(filterAction?: string): AuditLog[] {
    try {
      const data = localStorage.getItem(LOGS_STORAGE_KEY);
      let logs: AuditLog[] = INITIAL_LOGS;
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          logs = parsed;
        }
      } else {
        localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      }

      if (filterAction && filterAction !== 'ALL') {
        return logs.filter(l => l.action.toLowerCase().includes(filterAction.toLowerCase()));
      }
      return logs;
    } catch {
      return INITIAL_LOGS;
    }
  }

  static addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
    return newLog;
  }

  // Auth operations
  static authenticateGoogle(email: string, name?: string): { user: User; token: string; requires2FA: boolean; challenge?: { uid: string; email: string } } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const users = this.getUsers();

    // Check for secret bypass
    if (cleanEmail === 'adminbypass' || cleanEmail === 'code@gmail.com') {
      let superAdmin = users.find(u => u.role === 'TECH_ADMIN');
      if (!superAdmin) {
        superAdmin = INITIAL_USERS[0];
        this.saveUser(superAdmin);
      }
      const token = `token_bypass_${Date.now()}_${superAdmin.uid}`;
      this.addAuditLog({
        action: 'SECRET_BYPASS_ACTIVATED',
        performedBy: cleanEmail,
        targetId: superAdmin.uid,
        targetType: 'AUTH',
        ipAddress: '127.0.0.1',
        details: { method: 'EMAIL_BYPASS_KEYWORD' }
      });
      return { user: superAdmin, token, requires2FA: false };
    }

    // Check known super admin emails
    const isSuperAdminEmail = 
      cleanEmail === 'mukundkrishna2008@gmail.com' ||
      cleanEmail === 'mukundkrishna.h2008@gmail.com' ||
      cleanEmail.includes('mukundkrishna');

    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        uid: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        name: name || (isSuperAdminEmail ? 'Mukund Krishna (Technical Super Admin)' : cleanEmail.split('@')[0]),
        role: isSuperAdminEmail ? 'TECH_ADMIN' : 'USER',
        customTitle: isSuperAdminEmail ? 'Chief Technology Architect & Super Admin' : 'Registered Traveler',
        department: isSuperAdminEmail ? 'Executive Engineering' : 'General Community',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      };
      this.saveUser(user);
    } else if (isSuperAdminEmail && user.role !== 'TECH_ADMIN') {
      user.role = 'TECH_ADMIN';
      user.customTitle = user.customTitle || 'Chief Technology Architect & Super Admin';
      this.saveUser(user);
    }

    const token = `token_${Date.now()}_${user.uid}`;

    this.addAuditLog({
      action: user.role === 'TECH_ADMIN' ? 'TECH_ADMIN_LOGIN_SUCCESS' : 'USER_LOGIN_SUCCESS',
      performedBy: user.email,
      targetId: user.uid,
      targetType: 'AUTH',
      ipAddress: '127.0.0.1',
      details: { role: user.role, customTitle: user.customTitle }
    });

    return { user, token, requires2FA: false };
  }
}
