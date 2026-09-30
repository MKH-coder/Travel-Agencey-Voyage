export type UserRole = 'USER' | 'ADMIN' | 'TECH_SUBADMIN' | 'TECH_ADMIN';

export interface User {
  uid: string;
  email: string;
  phoneNumber?: string;
  name: string;
  avatar?: string;
  password?: string;
  role: UserRole;
  customTitle?: string;
  department?: string;
  customPostId?: string;
  customPrivileges?: PostPrivilege[];
  mfaEnabled: boolean;
  recoveryEmail?: string;
  createdAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  lastLoginBrowser?: string;
  lastLoginOs?: string;
  lastLoginTimezone?: string;
  lastLoginScreen?: string;
}

export type PostPrivilege =
  | 'PUBLISH_DIRECTLY'
  | 'APPROVE_QUEUE'
  | 'REJECT_QUEUE'
  | 'MANAGE_USERS'
  | 'ASSIGN_POSTS'
  | 'VIEW_AUDIT_LOGS'
  | 'DELETE_LISTINGS'
  | 'EDIT_ALL_CONTENT'
  | 'FIREBASE_CONSOLE_SYNC'
  | 'BYPASS_SECURITY_2FA';

export interface CustomPost {
  id: string;
  title: string;
  department: string;
  baseRole: UserRole;
  description: string;
  privileges: PostPrivilege[];
  badgeColor?: 'amber' | 'purple' | 'sky' | 'emerald' | 'rose' | 'indigo';
  createdBy?: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export type ListingCategory = 'PLACE' | 'HOTEL' | 'FOOD' | 'PACKAGE';
export type ListingStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED';

export interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  price: number;
  rating: number;
  reviewCount: number;
  location: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  images: string[];
  status: ListingStatus;
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  rejectionReason?: string;
  tags?: string[];
  amenities?: string[];
  diningSpecialties?: string[];
  hotelPerks?: string[];
  listingIds?: string[]; // IDs of listings included in a package
  duration?: string; // e.g., "5 Days / 4 Nights"
  pinned?: boolean;
  pinnedAt?: string;
  timestamps: {
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    approvedAt?: string;
  };
}

export type CustomTripStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'QUOTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface CustomTripDayItinerary {
  day: number;
  title: string;
  description: string;
  hotelId?: string;
  hotelTitle?: string;
  placeIds?: string[];
  diningIds?: string[];
  customNotes?: string;
}

export interface CustomTripRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  tripTitle: string;
  destination: string;
  country: string;
  travelStyle: 'LUXURY_WELLNESS' | 'CULTURAL_HERITAGE' | 'CULINARY_EXPLORER' | 'ROMANTIC_HONEYMOON' | 'ADVENTURE_NATURE' | 'CUSTOM';
  budgetTier: 'ELITE' | 'PREMIUM' | 'SMART';
  startDate: string;
  endDate: string;
  durationDays: number;
  adults: number;
  children: number;
  selectedListingIds: string[];
  selectedListings?: {
    id: string;
    title: string;
    category: ListingCategory;
    price: number;
    location: string;
    image: string;
  }[];
  itinerary: CustomTripDayItinerary[];
  inclusions: string[];
  specialRequests?: string;
  dietaryPreferences?: string[];
  estimatedTotal: number;
  bundleDiscount: number;
  finalPrice: number;
  status: CustomTripStatus;
  conciergeNotes?: string;
  quotedPrice?: number;
  convertedToPackageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedTrip {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  performedByEmail?: string;
  targetId: string;
  targetType?: string;
  ipAddress: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCategory: ListingCategory;
  listingImage: string;
  userId: string;
  userEmail: string;
  checkInDate: string;
  checkOutDate?: string;
  guests: number;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminSession {
  token: string;
  uid: string;
  role: UserRole;
  email: string;
  createdAt: number;
  lastActiveAt: number;
}
