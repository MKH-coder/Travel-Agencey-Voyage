export type ThemeMode = 'cyan-light' | 'dark-slate' | 'crimson-black' | 'emerald-warm' | 'royal-gold' | 'violet-glass' | 'emerald-black' | 'rose-gold' | 'nordic-frost';

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
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  lastLoginAt?: string;
  lastPasswordUpdateAt?: string;
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
  listingIds?: string[];
  duration?: string;
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
  listing?: Listing;
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
  promoCode?: string;
  discountAmount?: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  userEmail: string;
  listingId: string;
  listingTitle: string;
  targetPrice: number;
  active: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string; // ISO string
  isReported?: boolean;
  reportReason?: string;
  reportedBy?: string;
  reportedByEmail?: string;
  reportedAt?: string;
  moderationStatus?: 'PENDING' | 'DISMISSED' | 'REMOVED';
  listingTitle?: string;
}

export interface FilterState {
  category: 'ALL' | ListingCategory;
  search: string;
  priceRange: 'ALL' | 'UNDER_200' | '200_400' | 'ABOVE_400';
  minRating: number;
  country: string;
}

export interface RiskThresholdConfig {
  BYPASS_EVENTS: boolean;
  RATE_LIMIT_EVENTS: boolean;
  CONTENT_DELETIONS: boolean;
  ROLE_MODIFICATIONS: boolean;
  SECURITY_2FA_CHANGES: boolean;
  CONTENT_CREATIONS: boolean;
  ADMIN_LOGINS: boolean;
}

export type AuthFailureCategory = 
  | 'POPUP_BLOCKED'
  | 'UNAUTHORIZED_DOMAIN'
  | 'POPUP_CLOSED_BY_USER'
  | 'CANCELLED_REQUEST'
  | 'NETWORK_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'SESSION_EXPIRED'
  | 'MFA_REQUIRED'
  | 'REDIRECT_ERROR'
  | 'UNKNOWN';

export interface AuthAuditLogEntry {
  id: string;
  timestamp: string;
  provider: 'google' | 'supabase' | 'email_password' | 'session' | 'bypass';
  action: 'OAUTH_POPUP' | 'OAUTH_REDIRECT' | 'GET_REDIRECT_RESULT' | 'PASSWORD_LOGIN' | 'PASSWORD_SIGNUP' | 'SESSION_RESTORE' | '2FA_VERIFY' | 'BYPASS_LOGIN';
  status: 'SUCCESS' | 'FAILURE' | 'CANCELLED';
  errorCode?: string;
  errorMessage: string;
  failureCategory?: AuthFailureCategory;
  email?: string;
  environment: {
    origin: string;
    hostname: string;
    pathname: string;
    isIframe: boolean;
    isMobile: boolean;
    userAgent: string;
    cookieEnabled: boolean;
  };
  details?: Record<string, unknown>;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  code?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  isAdminAction?: boolean;
  adminActionType?: 'create' | 'update' | 'delete' | 'status' | 'clear' | 'user_role' | 'user_delete' | 'moderation' | 'error';
}

export interface SupportMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  senderRole: 'CLIENT' | 'ADMIN';
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  readByAdmin: boolean;
  readByClient: boolean;
  listingContext?: {
    id: string;
    title: string;
  };
}

export interface SupportConversationSummary {
  userId: string;
  userEmail: string;
  userName: string;
  lastMessage: SupportMessage;
  unreadCount: number;
  messages: SupportMessage[];
}

