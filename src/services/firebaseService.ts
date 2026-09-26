import { 
  initializeApp, 
  getApp, 
  type FirebaseApp 
} from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  push,
  update,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
  type Database,
  type DatabaseReference,
  type Unsubscribe
} from 'firebase/database';

// Firebase Configuration (from firebase-applet-config.json)
const firebaseConfig = {
  apiKey: "AIzaSyDVwDv9uktgpXrM1DKyf9_VFam2O31XLrA",
  authDomain: "core-carport-2cbh2.firebaseapp.com",
  projectId: "core-carport-2cbh2",
  storageBucket: "core-carport-2cbh2.firebasestorage.app",
  messagingSenderId: "680721974229",
  appId: "1:680721974229:web:39e779835b18606cdab35c",
  databaseURL: "https://core-carport-2cbh2-default-rtdb.firebaseio.com" // Add this for Realtime DB
};

// Initialize Firebase
let app: FirebaseApp;
let db: Database;

try {
  app = getApp();
  db = getDatabase(app);
} catch {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
}

// ============================================
// POSTS (Admin Announcements/Feed Posts)
// ============================================

export interface FirebasePost {
  id: string;
  title: string;
  content: string;
  images?: string[];
  author: string;
  createdAt: number;
  updatedAt: number;
  status: 'PUBLISHED' | 'DRAFT';
  type?: 'ANNOUNCEMENT' | 'BLOG' | 'PROMOTION';
}

export const PostsService = {
  /**
   * Create a new post
   */
  async createPost(post: Omit<FirebasePost, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebasePost> {
    try {
      const postsRef = ref(db, 'posts');
      const newPostRef = push(postsRef);
      const timestamp = Date.now();
      
      const fullPost: FirebasePost = {
        ...post,
        id: newPostRef.key || '',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      await set(newPostRef, fullPost);
      return fullPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  /**
   * Update an existing post
   */
  async updatePost(postId: string, updates: Partial<Omit<FirebasePost, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const postRef = ref(db, `posts/${postId}`);
      await update(postRef, {
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  /**
   * Get all posts
   */
  async getAllPosts(): Promise<FirebasePost[]> {
    try {
      const postsRef = ref(db, 'posts');
      const snapshot = await get(postsRef);
      
      if (!snapshot.exists()) return [];
      
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  /**
   * Get post by ID
   */
  async getPostById(postId: string): Promise<FirebasePost | null> {
    try {
      const postRef = ref(db, `posts/${postId}`);
      const snapshot = await get(postRef);
      
      if (!snapshot.exists()) return null;
      
      return {
        ...snapshot.val(),
        id: postId
      };
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    try {
      const postRef = ref(db, `posts/${postId}`);
      await remove(postRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time post updates
   */
  subscribeToPostsRealtime(callback: (posts: FirebasePost[]) => void): Unsubscribe {
    const postsRef = ref(db, 'posts');
    return onValue(postsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const data = snapshot.val();
      const posts = Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
      callback(posts);
    });
  }
};

// ============================================
// LISTINGS (Travel Destinations/Hotels/Food)
// ============================================

export interface FirebaseListing {
  id: string;
  title: string;
  category: 'PLACE' | 'HOTEL' | 'FOOD';
  description: string;
  price: number;
  location: string;
  country: string;
  images: string[];
  rating: number;
  tags: string[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED';
  createdBy: string;
  approvedBy?: string;
  createdAt: number;
  updatedAt: number;
  rejectionReason?: string;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

export const ListingsService = {
  /**
   * Create a new listing
   */
  async createListing(listing: Omit<FirebaseListing, 'id' | 'createdAt' | 'updatedAt' | 'timestamps'>): Promise<FirebaseListing> {
    try {
      const listingsRef = ref(db, 'listings');
      const newListingRef = push(listingsRef);
      const timestamp = Date.now();
      const dateStr = new Date(timestamp).toISOString();
      
      const fullListing: FirebaseListing = {
        ...listing,
        id: newListingRef.key || '',
        createdAt: timestamp,
        updatedAt: timestamp,
        timestamps: {
          createdAt: dateStr,
          updatedAt: dateStr
        }
      };

      await set(newListingRef, fullListing);
      return fullListing;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  },

  /**
   * Update an existing listing
   */
  async updateListing(listingId: string, updates: Partial<Omit<FirebaseListing, 'id' | 'createdAt' | 'timestamps'>>): Promise<void> {
    try {
      const listingRef = ref(db, `listings/${listingId}`);
      const timestamp = Date.now();
      
      await update(listingRef, {
        ...updates,
        updatedAt: timestamp,
        timestamps: {
          createdAt: (updates as any).timestamps?.createdAt || new Date().toISOString(),
          updatedAt: new Date(timestamp).toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  },

  /**
   * Get all listings
   */
  async getAllListings(): Promise<FirebaseListing[]> {
    try {
      const listingsRef = ref(db, 'listings');
      const snapshot = await get(listingsRef);
      
      if (!snapshot.exists()) return [];
      
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
    } catch (error) {
      console.error('Error getting listings:', error);
      throw error;
    }
  },

  /**
   * Get listings by status
   */
  async getListingsByStatus(status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'): Promise<FirebaseListing[]> {
    try {
      const allListings = await ListingsService.getAllListings();
      return allListings.filter(l => l.status === status);
    } catch (error) {
      console.error('Error filtering listings by status:', error);
      throw error;
    }
  },

  /**
   * Get listing by ID
   */
  async getListingById(listingId: string): Promise<FirebaseListing | null> {
    try {
      const listingRef = ref(db, `listings/${listingId}`);
      const snapshot = await get(listingRef);
      
      if (!snapshot.exists()) return null;
      
      return {
        ...snapshot.val(),
        id: listingId
      };
    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  },

  /**
   * Delete a listing
   */
  async deleteListing(listingId: string): Promise<void> {
    try {
      const listingRef = ref(db, `listings/${listingId}`);
      await remove(listingRef);
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  },

  /**
   * Approve a listing (change status to PUBLISHED)
   */
  async approveListing(listingId: string, approvedBy: string): Promise<void> {
    try {
      await ListingsService.updateListing(listingId, {
        status: 'PUBLISHED',
        approvedBy
      });
    } catch (error) {
      console.error('Error approving listing:', error);
      throw error;
    }
  },

  /**
   * Reject a listing
   */
  async rejectListing(listingId: string, reason: string): Promise<void> {
    try {
      await ListingsService.updateListing(listingId, {
        status: 'REJECTED',
        rejectionReason: reason
      });
    } catch (error) {
      console.error('Error rejecting listing:', error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time listing updates
   */
  subscribeToListingsRealtime(callback: (listings: FirebaseListing[]) => void): Unsubscribe {
    const listingsRef = ref(db, 'listings');
    return onValue(listingsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const data = snapshot.val();
      const listings = Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
      callback(listings);
    });
  }
};

// ============================================
// ANALYTICS & METRICS
// ============================================

export interface FirebaseAnalytics {
  totalVisits: number;
  totalListings: number;
  publishedListings: number;
  pendingListings: number;
  totalPosts: number;
  lastUpdated: number;
}

export const AnalyticsService = {
  /**
   * Get analytics summary
   */
  async getAnalytics(): Promise<FirebaseAnalytics> {
    try {
      const listings = await ListingsService.getAllListings();
      const posts = await PostsService.getAllPosts();
      
      return {
        totalVisits: 0, // Would need tracking implementation
        totalListings: listings.length,
        publishedListings: listings.filter(l => l.status === 'PUBLISHED').length,
        pendingListings: listings.filter(l => l.status === 'PENDING_APPROVAL').length,
        totalPosts: posts.length,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }
};

export default {
  PostsService,
  ListingsService,
  AnalyticsService,
  db,
  app
};
