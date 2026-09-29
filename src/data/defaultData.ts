import { Listing, User, AuditLog, Review } from '../types.ts';

export const TECH_ADMIN_EMAILS = [
  'voyage@gmail.com',
  'mukundkrishna2008@gmail.com',
  'mukundkrishna.h2008@gmail.com',
  'mukundkrishna.h@gmail.com',
  '8c15mukundkrishna.h@gmail.com',
  'code@gmail.com',
  'adminbypass',
];

export const DEFAULT_USERS: User[] = [
  {
    uid: 'user_voyage_official',
    email: 'voyage@gmail.com',
    phoneNumber: '+91 9567465134',
    name: 'Voyage Official (Super Admin)',
    role: 'TECH_ADMIN',
    customTitle: 'Voyage Platform Director & Super Admin',
    department: 'Platform Administration',
    mfaEnabled: true,
    recoveryEmail: 'voyage@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_admin_01',
    email: 'mukundkrishna2008@gmail.com',
    phoneNumber: '+91 9567465134',
    name: 'Mukund Krishna (Technical Super Admin)',
    role: 'TECH_ADMIN',
    customTitle: 'Head of Infrastructure & Security',
    department: 'Engineering & Operations',
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
    customTitle: 'Senior Platform Reliability Engineer',
    department: 'DevOps & Reliability',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_subadmin_03',
    email: 'mukundkrishna.h2008@gmail.com',
    phoneNumber: '+91 9567465137',
    name: 'Mukund Krishna Dev (Technical Super Admin)',
    role: 'TECH_ADMIN',
    customTitle: 'Principal Systems Architect',
    department: 'Core Architecture',
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
    customTitle: 'Senior Travel Editorial Director',
    department: 'Global Content & Curation',
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
    customTitle: 'Verified Voyage Explorer',
    department: 'Community Member',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  }
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-seed-01',
    action: 'TECH_ADMIN_LOGIN_SUCCESS',
    performedBy: 'mukundkrishna2008@gmail.com',
    performedByEmail: 'mukundkrishna2008@gmail.com',
    targetId: 'SECURITY_AUTH',
    targetType: 'SYSTEM_AUTH',
    ipAddress: '127.0.0.1 (Authorized)',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    details: { method: 'GOOGLE_OAUTH_VERIFIED', role: 'TECH_ADMIN' }
  },
  {
    id: 'log-seed-02',
    action: 'SECRET_BYPASS_ACTIVATED',
    performedBy: 'mukundkrishna2008@gmail.com',
    performedByEmail: 'mukundkrishna2008@gmail.com',
    targetId: 'EMERGENCY_RECOVERY',
    targetType: 'SECURITY_GATEWAY',
    ipAddress: '127.0.0.1 (Direct Terminal)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    details: { bypassTrigger: 'adminbypass', roleGranted: 'TECH_ADMIN' }
  },
  {
    id: 'log-seed-03',
    action: 'APPROVE_LISTING',
    performedBy: 'sarah.content@travelplatform.io',
    performedByEmail: 'sarah.content@travelplatform.io',
    targetId: 'list-santorini-01',
    targetType: 'DESTINATION_POST',
    ipAddress: '192.168.1.42',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    details: { title: 'Santorini Caldera Cliffside & Oia Sunset Panorama', status: 'PUBLISHED' }
  }
];

export const DEFAULT_LISTINGS: Listing[] = [
  {
    "country": "Japan",
    "status": "PUBLISHED",
    "createdByName": "Mukund Krishna",
    "coordinates": {
      "lat": 35.0037,
      "lng": 135.7772
    },
    "description": "Authentic 10-course Kaiseki dinner in a beautifully restored tea house in the heart of historic Gion.",
    "location": "Gion District, Kyoto",
    "amenities": [
      "Tea Ceremony",
      "Private Room"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "category": "FOOD",
    "rating": 4.92,
    "tags": [
      "Gourmet",
      "Traditional",
      "Michelin Star"
    ],
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "images": [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    ],
    "id": "list-dining-kyoto-03",
    "reviewCount": 35,
    "price": 250,
    "title": "Gion Karyo Kaiseki Experience"
  },
  {
    "reviewCount": 28,
    "tags": [
      "Luxury",
      "Historic",
      "Infinity Pool"
    ],
    "title": "Belmond Hotel Caruso Cliffside Stay",
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "price": 850,
    "id": "list-hotel-amalfi-02",
    "createdBy": "mukundkrishna2008@gmail.com",
    "amenities": [
      "Spa",
      "Infinity Pool",
      "Fine Dining"
    ],
    "status": "PUBLISHED",
    "location": "Ravello, Amalfi Coast",
    "country": "Italy",
    "description": "A former 11th-century palace set on cliffs beside the Amalfi Coast, Belmond Hotel Caruso seems to drift between the sea and sky.",
    "createdByName": "Mukund Krishna",
    "images": [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
    ],
    "category": "HOTEL",
    "coordinates": {
      "lng": 14.6111,
      "lat": 40.6481
    },
    "rating": 4.98
  },
  {
    "createdByName": "Mukund Krishna",
    "status": "PUBLISHED",
    "description": "Accessible only by a private boat, this luxury riverside retreat offers the ultimate Zen experience in a secluded Arashiyama forest.",
    "category": "HOTEL",
    "coordinates": {
      "lat": 35.0116,
      "lng": 135.6775
    },
    "createdBy": "mukundkrishna2008@gmail.com",
    "amenities": [
      "Boat Transfer",
      "Zen Garden",
      "Japanese Spa"
    ],
    "country": "Japan",
    "location": "Arashiyama, Kyoto",
    "reviewCount": 19,
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "price": 650,
    "rating": 4.97,
    "title": "Hoshinoya Kyoto Riverside Retreat",
    "tags": [
      "Zen",
      "Riverside",
      "Exclusive"
    ],
    "images": [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
    ],
    "id": "list-hotel-kyoto-04"
  },
  {
    "createdByName": "Mukund Krishna",
    "status": "PUBLISHED",
    "description": "Celebrated destination in Mannanthala for authentic Travancore culinary heritage. Experience the 24-dish Kerala Sadhya served on fresh plantain leaves, paired with freshly tapped tender coconut and warm cardamom payasam.",
    "category": "FOOD",
    "coordinates": {
      "lat": 8.5575,
      "lng": 76.946
    },
    "amenities": [
      "Plantain Leaf Banquet",
      "Master Chef Spice Tour",
      "Ayurvedic Herbal Brews"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "reviewCount": 47,
    "location": "Mannanthala, Trivandrum",
    "country": "India",
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "price": 95,
    "rating": 4.94,
    "tags": [
      "Kerala Sadhya",
      "Authentic Spices",
      "Banana Leaf Dining",
      "Travancore Cuisine"
    ],
    "title": "Travancore Spice Kitchen & Banana Leaf Sadhya",
    "images": [
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80"
    ],
    "id": "list-mannanthala-food-03"
  },
  {
    "reviewCount": 29,
    "tags": [
      "Ayurveda Sanctuary",
      "Kerala Luxury",
      "Eco Retreat",
      "Trivandrum"
    ],
    "createdByName": "Mukund Krishna",
    "status": "PUBLISHED",
    "amenities": [
      "Ayurvedic Spa",
      "Yoga Shala",
      "Infinity Palm Pool",
      "Farm-to-Table Kerala Dining"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "title": "The Greenfields Ayurvedic Estate & Villa Resort",
    "price": 340,
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "category": "HOTEL",
    "id": "list-mannanthala-hotel-02",
    "images": [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
    ],
    "description": "An authentic luxury sanctuary surrounded by swaying coconut palms in Mannanthala, Trivandrum. Features traditional Kerala architecture, certified Ayurvedic rejuvenation therapies, private plunge pools, and open-air yoga shalas.",
    "location": "Mannanthala, Trivandrum",
    "rating": 4.98,
    "coordinates": {
      "lng": 76.9482,
      "lat": 8.5601
    },
    "country": "India"
  },
  {
    "country": "India",
    "status": "PUBLISHED",
    "reviewCount": 38,
    "tags": [
      "Kerala Heritage",
      "Scenic Greens",
      "Travancore Culture",
      "Trivandrum"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "amenities": [
      "Guided Cultural Walk",
      "Hilltop Viewpoint",
      "Photography Vantage"
    ],
    "location": "Mannanthala, Trivandrum",
    "price": 180,
    "title": "Mannanthala Heritage Corridor & Hilltop Viewpoint",
    "rating": 4.96,
    "category": "PLACE",
    "description": "Nestled in the lush greenery of Thiruvananthapuram, Mannanthala offers peaceful heritage paths, traditional Travancore temples, panoramic valley viewpoints, and serene tropical gardens.",
    "id": "list-mannanthala-place-01",
    "images": [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
    ],
    "coordinates": {
      "lng": 76.9458,
      "lat": 8.5583
    },
    "createdByName": "Mukund Krishna",
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    }
  },
  {
    "createdByName": "Mukund Krishna",
    "images": [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
    ],
    "id": "list-santorini-01",
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "reviewCount": 42,
    "location": "Oia, Santorini Island",
    "rating": 4.95,
    "country": "Greece",
    "coordinates": {
      "lat": 36.4618,
      "lng": 25.3753
    },
    "tags": [
      "Scenic",
      "Romantic",
      "Sunset"
    ],
    "price": 450,
    "category": "PLACE",
    "title": "Santorini Caldera Cliffside & Oia Sunset Panorama",
    "amenities": [
      "Panoramic View",
      "Photo Spots"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "status": "PUBLISHED",
    "description": "Breathtaking views of the Aegean Sea and the famous blue-domed churches. Experience the world-renowned Oia sunset from the best vantage point."
  },
  {
    "price": 320,
    "title": "Bürgenstock Resort Alpine Spa Experience",
    "coordinates": {
      "lat": 47.0012,
      "lng": 8.3812
    },
    "description": "Enjoy the legendary infinity pool 500 meters above Lake Lucerne. A sanctuary of peace with panoramic views of the Swiss Alps.",
    "location": "Lucerne",
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "status": "PUBLISHED",
    "tags": [
      "Spa",
      "Alps",
      "Infinity Pool"
    ],
    "createdByName": "Mukund Krishna",
    "category": "PLACE",
    "createdBy": "mukundkrishna2008@gmail.com",
    "amenities": [
      "Thermal Baths",
      "Panorama Terrace"
    ],
    "images": [
      "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=1200&q=80"
    ],
    "country": "Switzerland",
    "id": "list-swiss-alps-05",
    "reviewCount": 54,
    "rating": 4.99
  },
  {
    "category": "PACKAGE",
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "amenities": [
      "Spa Access",
      "Cable Car Pass",
      "Mountain Guide"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "status": "PUBLISHED",
    "description": "Rejuvenate your soul with an exclusive Alpine Spa bundle. Includes full day access to Bürgenstock Resort Spa and a guided panoramic mountain tour.",
    "createdByName": "Mukund Krishna",
    "tags": [
      "Wellness Bundle",
      "Alps Escape",
      "Premium"
    ],
    "price": 550,
    "duration": "2 Days / 1 Night",
    "title": "Alpine Wellness & Spa Escape",
    "country": "Switzerland",
    "rating": 5,
    "listingIds": [
      "list-swiss-alps-05"
    ],
    "id": "pkg-alpine-wellness-01",
    "location": "Lucerne",
    "images": [
      "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=1200&q=80"
    ],
    "reviewCount": 5
  },
  {
    "description": "Immerse yourself in Kyoto heritage with a riverside stay at Hoshinoya and a Michelin-grade Kaiseki dinner at Gion Karyo.",
    "id": "pkg-kyoto-zen-01",
    "location": "Arashiyama & Gion",
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "createdByName": "Mukund Krishna",
    "status": "PUBLISHED",
    "duration": "3 Days / 2 Nights",
    "country": "Japan",
    "listingIds": [
      "list-hotel-kyoto-04",
      "list-dining-kyoto-03"
    ],
    "images": [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    ],
    "amenities": [
      "Cultural Concierge",
      "Private Boat Transfer",
      "Priority Dining Reservation"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "reviewCount": 8,
    "title": "Kyoto Zen & Gastronomy Package",
    "tags": [
      "Zen Bundle",
      "Kyoto Heritage",
      "Best Value"
    ],
    "rating": 4.99,
    "price": 780,
    "category": "PACKAGE"
  },
  {
    "price": 1200,
    "title": "Mediterranean Luxury Gastronomy Bundle",
    "location": "Ravello & Oia",
    "createdByName": "Mukund Krishna",
    "images": [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
    ],
    "reviewCount": 12,
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "tags": [
      "Luxury Bundle",
      "Multi-Country",
      "Best Value"
    ],
    "country": "Italy & Greece",
    "rating": 5,
    "description": "The ultimate Mediterranean luxury experience combining a cliffside stay in Ravello with a sunset tour in Santorini. Save 10% by bundling.",
    "listingIds": [
      "list-hotel-amalfi-02",
      "list-santorini-01"
    ],
    "id": "pkg-luxury-europe-01",
    "category": "PACKAGE",
    "createdBy": "mukundkrishna2008@gmail.com",
    "amenities": [
      "Concierge Service",
      "Private Transfers",
      "Welcome Gift"
    ],
    "status": "PUBLISHED"
  },
  {
    "price": 580,
    "title": "God's Own Country: Mannanthala & Trivandrum Heritage Package",
    "location": "Mannanthala, Trivandrum",
    "createdByName": "Mukund Krishna",
    "reviewCount": 16,
    "images": [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80"
    ],
    "timestamps": {
      "updatedAt": "2026-09-28T06:59:52.862Z",
      "createdAt": "2026-09-28T06:59:52.862Z"
    },
    "duration": "4 Days / 3 Nights",
    "rating": 5,
    "country": "India",
    "tags": [
      "Kerala Heritage",
      "Tour Package",
      "Ayurveda & Wellness",
      "Trivandrum",
      "Best Value"
    ],
    "listingIds": [
      "list-mannanthala-place-01",
      "list-mannanthala-hotel-02",
      "list-mannanthala-food-03"
    ],
    "description": "An all-inclusive Kerala journey featuring a 3-night stay at The Greenfields Ayurvedic Estate in Mannanthala, guided Travancore heritage tours, private Ayurvedic massage sessions, and an authentic 24-course Kerala Sadhya feast.",
    "id": "pkg-mannanthala-trivandrum-01",
    "amenities": [
      "Ayurvedic Treatment Voucher",
      "Airport Chauffeur Transfer",
      "Banana Leaf Feast Included",
      "Private Guide"
    ],
    "createdBy": "mukundkrishna2008@gmail.com",
    "category": "PACKAGE",
    "status": "PUBLISHED",
    "coordinates": {
      "lat": 8.5583,
      "lng": 76.9458
    }
  },
  {
    "id": "list-albania-tirana-01",
    "title": "Tirana Historic Center, Skanderbeg Square & Dajti Mountain",
    "category": "PLACE",
    "price": 65,
    "rating": 4.93,
    "reviewCount": 42,
    "location": "Tirana",
    "country": "Albania",
    "coordinates": {
      "lat": 41.3275,
      "lng": 19.8187
    },
    "description": "Vibrant Albanian capital featuring Skanderbeg Square, Et'hem Bey Mosque, Clock Tower, Bunk'Art 2 museum, Murat Toptani Street, Tirana Castle, New Bazaar, and panoramic views from Mount Dajti cable car.",
    "images": [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "tags": [
      "Albania Capital",
      "Skanderbeg Square",
      "BunkArt 2",
      "Mount Dajti",
      "Historic Tirana"
    ],
    "amenities": [
      "Dajti Cable Car Ticket",
      "BunkArt 2 Audio Guide",
      "Skanderbeg Walking Tour",
      "Castle Courtyard Access"
    ],
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "list-albania-berat-02",
    "title": "Berat UNESCO 'City of a Thousand Windows' & Kala Fortress",
    "category": "PLACE",
    "price": 85,
    "rating": 4.97,
    "reviewCount": 56,
    "location": "Berat",
    "country": "Albania",
    "coordinates": {
      "lat": 40.7058,
      "lng": 19.9522
    },
    "description": "UNESCO World Heritage gem on the Osum River. Explore the ancient Mangalem Quarter, the hilltop Berat Castle (Kala), Onufri Iconographic Museum, historic Gorica Bridge, and scenic riverside promenade.",
    "images": [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "tags": [
      "UNESCO Heritage",
      "Berat Castle",
      "City of Thousand Windows",
      "Osum River",
      "Gorica Bridge"
    ],
    "amenities": [
      "Onufri Museum Entry",
      "Berat Kala Guided Walk",
      "Gorica Historic Photography Pass"
    ],
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "list-albania-gjirokaster-03",
    "title": "Gjirokastër Stone Fortress, Old Bazaar & Ottoman Mansions",
    "category": "PLACE",
    "price": 75,
    "rating": 4.95,
    "reviewCount": 39,
    "location": "Gjirokastër",
    "country": "Albania",
    "coordinates": {
      "lat": 40.0758,
      "lng": 20.1389
    },
    "description": "Dramatic hillside UNESCO stone town featuring the massive Gjirokastër Castle, the cobblestone Old Bazaar (Qafa e Pazarit), and preserved 18th-century Ottoman fortified mansions including Skënduli House and Zekate House.",
    "images": [
      "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "tags": [
      "Stone City",
      "UNESCO Gjirokaster",
      "Ottoman Mansions",
      "Old Bazaar",
      "Skenduli House"
    ],
    "amenities": [
      "Gjirokastër Castle Pass",
      "Skënduli Heritage Tour",
      "Old Bazaar Artisan Guide"
    ],
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "list-albania-blueeye-04",
    "title": "Syri i Kaltër (The Blue Eye) Natural Spring Sanctuary",
    "category": "PLACE",
    "price": 95,
    "rating": 4.98,
    "reviewCount": 68,
    "location": "Sarandë & Blue Eye",
    "country": "Albania",
    "coordinates": {
      "lat": 39.9242,
      "lng": 20.1919
    },
    "description": "A mesmerizing hypnotic natural phenomenon with crystal-clear turquoise spring water bubbling up from unknown depths beneath emerald oak trees, followed by sunset strolls along the lively Sarandë Promenade.",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "tags": [
      "Blue Eye",
      "Syri i Kalter",
      "Sarande Waterfront",
      "Natural Wonder",
      "Ionian Coast"
    ],
    "amenities": [
      "Nature Park Reserve Ticket",
      "Sarandë Promenade Sunset Pass",
      "Scenic Lookout Access"
    ],
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "list-albania-ksamil-hotel-05",
    "title": "Ksamil Riviera Azure Clifftop Suites & 4 Islands Lagoon",
    "category": "HOTEL",
    "price": 260,
    "rating": 4.99,
    "reviewCount": 51,
    "location": "Ksamil",
    "country": "Albania",
    "coordinates": {
      "lat": 39.7719,
      "lng": 20.0036
    },
    "description": "Premier boutique waterfront retreat directly overlooking Bora Bora Beach and Beach 7 in Ksamil. Features private island boat transfers, panoramic sea-view balconies, private infinity pool, and fresh Mediterranean breakfast.",
    "images": [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "tags": [
      "Ksamil Stays",
      "Bora Bora Beach",
      "Ionian Luxury",
      "Island Boat Transfer",
      "Seaside Villa"
    ],
    "amenities": [
      "Private Beach Loungers",
      "Ksamil Island Boat Transfer",
      "Seaview Infinity Pool",
      "Daily Champagne Breakfast"
    ],
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "list-albania-butrint-06",
    "title": "Butrint UNESCO National Archaeological Park & Sanctuary",
    "category": "PLACE",
    "price": 80,
    "rating": 4.96,
    "reviewCount": 34,
    "location": "Butrint",
    "country": "Albania",
    "coordinates": {
      "lat": 39.7439,
      "lng": 20.0211
    },
    "description": "Ancient Greek, Roman, Byzantine, and Venetian ruins nestled on a tranquil peninsula surrounded by Lake Butrint and the Vivari Channel. Features a preserved amphitheater, Roman baptistery, basilica, and Venetian castle.",
    "images": [
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "tags": [
      "UNESCO Butrint",
      "Archaeological Park",
      "Greek Theater",
      "Venetian Castle",
      "Ionian Heritage"
    ],
    "amenities": [
      "UNESCO Archaeological Pass",
      "Guided Historic Trail",
      "Vivari Channel Viewpoint"
    ],
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "list-albania-dhermi-dining-07",
    "title": "Drymades Coast Clifftop Dining & Porto Palermo Grills",
    "category": "FOOD",
    "price": 110,
    "rating": 4.94,
    "reviewCount": 29,
    "location": "Dhërmi & Porto Palermo",
    "country": "Albania",
    "coordinates": {
      "lat": 40.1539,
      "lng": 19.6428
    },
    "description": "Exquisite seaside dining on the Albanian Riviera coast. Enjoy freshly grilled sea bass, wild octopus, Byrek, sheep cheeses from Llogara Pass, and local Shesh i Zi wines with cliffside views over the Ionian Sea.",
    "images": [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "tags": [
      "Albanian Riviera Dining",
      "Drymades Coast",
      "Fresh Seafood",
      "Porto Palermo",
      "Llogara Wine"
    ],
    "amenities": [
      "Panoramic Cliff Table",
      "Sommelier Wine Pairing",
      "Catch of the Day Selection"
    ],
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "pkg-albania-9day-basic",
    "title": "Albania 9-Day Grand Explorer: Tirana to Riviera (Basic Package)",
    "category": "PACKAGE",
    "price": 1350,
    "rating": 4.95,
    "reviewCount": 28,
    "location": "Tirana • Berat • Gjirokastër • Sarandë • Ksamil • Riviera",
    "country": "Albania",
    "description": "The complete 9-day condensed Albania circuit (9 Oct – 19 Oct 2026) starting from India (TRV) via Muscat & Milan to Tirana, Berat UNESCO castle, Gjirokastër stone fortress, Blue Eye spring, Ksamil islands, and the dramatic Albanian Riviera coast. Price: ₹1,11,018–₹1,26,518/person (₹4,44,072–₹5,06,072 for 4 people).",
    "images": [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "listingIds": [
      "list-albania-tirana-01",
      "list-albania-berat-02",
      "list-albania-gjirokaster-03",
      "list-albania-blueeye-04",
      "list-albania-butrint-06"
    ],
    "tags": [
      "Albania 9-Day",
      "Basic Package",
      "Best Value",
      "₹1.11L - ₹1.26L",
      "Economy Airfare",
      "UNESCO Trail"
    ],
    "amenities": [
      "Economy Flight Allocation (₹67,518)",
      "Private-Room Hotels (₹43,500)",
      "Practical Driver Allowance",
      "All Core Sightseeing Admissions"
    ],
    "duration": "9 Days / 8 Nights (9-19 Oct 2026)",
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "pkg-albania-9day-midrange",
    "title": "Albania 9-Day Boutique Stays & Private Driver (Mid-Range Package)",
    "category": "PACKAGE",
    "price": 1750,
    "rating": 4.98,
    "reviewCount": 35,
    "location": "Tirana • Berat • Gjirokastër • Sarandë • Ksamil • Dhërmi",
    "country": "Albania",
    "description": "Upgraded comfort on the complete 9-day Albania route with hand-picked boutique hotels, dedicated private air-conditioned vehicle with English-speaking driver, comfortable restaurant allowance, Dajti cable car pass, and guided historic admissions. Price: ₹1,43,390–₹1,67,390/person (₹5,73,560–₹6,69,560 for 4 people).",
    "images": [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "listingIds": [
      "list-albania-tirana-01",
      "list-albania-berat-02",
      "list-albania-gjirokaster-03",
      "list-albania-blueeye-04",
      "list-albania-ksamil-hotel-05",
      "list-albania-butrint-06",
      "list-albania-dhermi-dining-07"
    ],
    "tags": [
      "Albania 9-Day",
      "Mid-Range Package",
      "Boutique Hotels",
      "₹1.43L - ₹1.67L",
      "Private Vehicle + Driver",
      "Popular"
    ],
    "amenities": [
      "Economy Flight (₹74,890)",
      "Boutique Hotels (₹68,500)",
      "Dedicated Private Vehicle & Driver",
      "Comfortable Restaurant Allowance",
      "Dajti Cable Car Included"
    ],
    "duration": "9 Days / 8 Nights (9-19 Oct 2026)",
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  },
  {
    "id": "pkg-albania-9day-luxury",
    "title": "Albania 9-Day Luxury Riviera & UNESCO VIP Odyssey (Luxury Package)",
    "category": "PACKAGE",
    "price": 5200,
    "rating": 5,
    "reviewCount": 22,
    "location": "Tirana • Berat • Gjirokastër • Blue Eye • Sarandë • Ksamil • Porto Palermo • Dhërmi",
    "country": "Albania",
    "description": "The ultra-premium Albania Grand Tour featuring 5-star luxury and seaside boutique suites, premium cabin flight allowance, high-comfort private luxury vehicle, private chartered boat to Ksamil 4 islands, VIP private historians at Butrint & Berat Castle, and upscale gastronomy allowances. Price: ₹4,24,343–₹4,73,343/person (₹16,97,372–₹18,93,372 for 4 people).",
    "images": [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "mukundkrishna2008@gmail.com",
    "createdByName": "Mukund Krishna",
    "listingIds": [
      "list-albania-tirana-01",
      "list-albania-berat-02",
      "list-albania-gjirokaster-03",
      "list-albania-blueeye-04",
      "list-albania-ksamil-hotel-05",
      "list-albania-butrint-06",
      "list-albania-dhermi-dining-07"
    ],
    "tags": [
      "Albania 9-Day",
      "Luxury VIP Package",
      "5-Star Seaside Suites",
      "₹4.24L - ₹4.73L",
      "Premium Economy / Business Flight",
      "Private Ksamil Boat Cruise"
    ],
    "amenities": [
      "Premium Economy Airfare (₹2,95,343)",
      "Luxury Upscale Hotels (₹1,29,000)",
      "Private Luxury Chauffeur",
      "Private Chartered Ksamil Islands Cruise",
      "VIP Historian Guides",
      "Upscale Dining & Wine Allowance",
      "24/7 Concierge Support"
    ],
    "duration": "9 Days / 8 Nights (9-19 Oct 2026)",
    "timestamps": {
      "createdAt": "2026-09-29T17:47:43.626Z",
      "updatedAt": "2026-09-29T17:47:43.626Z"
    }
  }
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-santorini-1',
    listingId: 'list-santorini-01',
    userId: 'user-elena-01',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@voyagereview.org',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'The caldera sunset view from the private terrace was unforgettable! Seamless concierge check-in and the breakfast delivered fresh each morning was exquisite. Truly a bucket-list stay.',
    createdAt: '2025-02-10T14:32:00.000Z'
  },
  {
    id: 'rev-santorini-2',
    listingId: 'list-santorini-01',
    userId: 'user-marcus-02',
    userName: 'Marcus Vance',
    userEmail: 'marcus.v@adventurescape.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'Unbeatable vantage point over Oia. We avoided all the crowds simply by relaxing at our hot tub cliffside. Worth every single dollar for the tranquil luxury.',
    createdAt: '2025-02-18T18:15:00.000Z'
  },
  {
    id: 'rev-santorini-3',
    listingId: 'list-santorini-01',
    userId: 'user-chloe-03',
    userName: 'Chloe Dupont',
    userEmail: 'chloe.dupont@wanderlust.fr',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
    rating: 4,
    comment: 'Spectacular location! Note that there are steep stairs down to the suites, but the staff handles all luggage effortlessly. The sunset cocktails were a highlight.',
    createdAt: '2025-03-01T09:45:00.000Z'
  },
  {
    id: 'rev-kyoto-1',
    listingId: 'list-kyoto-02',
    userId: 'user-kenji-01',
    userName: 'Kenji Takahashi',
    userEmail: 'kenji.t@kyotoguide.jp',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'Early morning in the bamboo grove before tourists arrive is pure spiritual tranquility. Tenryu-ji Zen garden reflecting Mount Arashiyama took my breath away.',
    createdAt: '2025-02-14T08:20:00.000Z'
  },
  {
    id: 'rev-kyoto-2',
    listingId: 'list-kyoto-02',
    userId: 'user-sophia-02',
    userName: 'Sophia Lin',
    userEmail: 'sophia.lin@travelasia.io',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'The traditional tea ceremony included in the tour package was deeply peaceful and authentic. Exceptional master guide who explained centuries of temple history.',
    createdAt: '2025-02-25T11:00:00.000Z'
  },
  {
    id: 'rev-amalfi-1',
    listingId: 'list-amalfi-03',
    userId: 'user-alessandro-01',
    userName: 'Alessandro Moretti',
    userEmail: 'alessandro@italyexplorer.it',
    userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'Waking up to the Tyrrhenian Sea horizon and the private sea-cliff elevator down to the water is absolute paradise. The lemon grove breakfast was sublime.',
    createdAt: '2025-02-20T16:40:00.000Z'
  },
  {
    id: 'rev-zermatt-1',
    listingId: 'list-zermatt-04',
    userId: 'user-hannah-01',
    userName: 'Hannah Keller',
    userEmail: 'hannah.keller@alpinestays.ch',
    userAvatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'The Matterhorn reflection in the infinity spa pool at dusk is something you will never forget. True 5-star ski-in/ski-out experience with unmatched warmth and service.',
    createdAt: '2025-02-28T20:10:00.000Z'
  },
  {
    id: 'rev-albania-luxury-1',
    listingId: 'pkg-albania-9day-luxury',
    userId: 'user-traveler-03',
    userName: 'Alex Rivera',
    userEmail: 'alex.globetrotter@example.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'The 9-day Albania trip exceeded every expectation! The private boat cruise around Ksamil 4 islands and the private historian tour of Butrint UNESCO park were highlights of a lifetime. Seamless transfers and breathtaking views on the Llogara Pass.',
    createdAt: '2026-03-15T10:30:00.000Z'
  },
  {
    id: 'rev-albania-ksamil-1',
    listingId: 'list-albania-ksamil-hotel-05',
    userId: 'user-elena-01',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@voyagereview.org',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'The azure sea right in front of the balcony is magical. Bora Bora beach is pristine, and the freshly caught grilled sea bass dinner was unforgettable!',
    createdAt: '2026-04-02T16:15:00.000Z'
  },
  {
    id: 'rev-albania-berat-1',
    listingId: 'list-albania-berat-02',
    userId: 'user-marcus-02',
    userName: 'Marcus Vance',
    userEmail: 'marcus.v@adventurescape.com',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'Walking along the Gorica bridge and looking up at the Mangalem quarter at dusk is a dream. Berat Castle is living history with real families still living within the fortress.',
    createdAt: '2026-04-10T11:45:00.000Z'
  }
];

