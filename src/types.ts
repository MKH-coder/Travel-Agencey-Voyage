export type ThemeMode = 'cyan-light' | 'dark-slate' | 'crimson-black';

export type UserRole = 'USER' | 'ADMIN' | 'TECH_SUBADMIN' | 'TECH_ADMIN';

export interface User {
  uid: string;
  email: string;
  phoneNumber?: string;
  name: string;
  avatar?: string;
  role: UserRole;
  mfaEnabled: boolean;
  recoveryEmail?: string;
  createdAt: string;
}

export type ListingCategory = 'PLACE' | 'HOTEL' | 'FOOD';
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
  timestamps: {
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    approvedAt?: string;
  };
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
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface FilterState {
  category: 'ALL' | ListingCategory;
  search: string;
  priceRange: 'ALL' | 'UNDER_200' | '200_400' | 'ABOVE_400';
  minRating: number;
  country: string;
}
