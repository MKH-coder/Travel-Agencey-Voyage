import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { User, Listing, AuditLog, Booking, SavedTrip, CustomPost, FeedPost, CustomTripRequest, Review } from './types.ts';

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
  custom_trips?: CustomTripRequest[];
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
    uid: 'user_voyage_official',
    email: 'voyage@gmail.com',
    phoneNumber: '+91 9567465134',
    name: 'Voyage Official (Super Admin)',
    role: 'TECH_ADMIN',
    customTitle: 'Voyage Executive Operations',
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
    mfaEnabled: true,
    recoveryEmail: '8c15mukundkrishna.h@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_subadmin_01',
    email: 'mukundkrishna.h@gmail.com',
    phoneNumber: '+91 9567465134',
    name: 'Mukund Krishna (Technical Sub-Admin)',
    role: 'TECH_SUBADMIN',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_subadmin_02',
    email: '8c15mukundkrishna.h@gmail.com',
    phoneNumber: '+91 9567465134',
    name: 'Mukund Krishna Backup (Technical Sub-Admin)',
    role: 'TECH_SUBADMIN',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
  },
  {
    uid: 'user_tech_admin_02',
    email: 'mukundkrishna.h2008@gmail.com',
    phoneNumber: '+91 9567465134',
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
    phoneNumber: '+91 9567465134',
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
    phoneNumber: '+91 9567465134',
    name: 'Alex Rivera',
    role: 'USER',
    mfaEnabled: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'pkg-albania-9day-midrange-01',
    title: 'Albania 9-Day Grand Tour: Tirana to the Ionian Riviera (Mid-Range)',
    category: 'PACKAGE',
    price: 1970,
    rating: 4.99,
    reviewCount: 74,
    location: 'Tirana, Berat, Gjirokastër, Ksamil & Riviera',
    country: 'Albania',
    coordinates: { lat: 41.3275, lng: 19.8187 },
    description: 'The definitive 9-day grand loop through Albania (9–19 Oct 2026). Selected flight included (TRV → MCT → MXP → TIA and TIA → FCO → DOH → TRV, ₹74,890/person). Comfortable boutique hotels, dedicated private vehicle + driver planning allowance, Dajti Ekspres cable car over Tirana, Berat UNESCO castle & Onufri museum, Gjirokastër stone city (Skënduli & Zekate houses), the turquoise Blue Eye spring (Syri i Kaltër), Ksamil 4-islands boat cruise, Butrint UNESCO archaeological site, Porto Palermo & Ali Pasha Castle, Jalë Beach, Dhërmi Old Village, and the breathtaking Llogara Pass descent to Vlorë. Land package: ₹68,500–₹92,500/person (4 Pax: ₹5,73,560–₹6,69,560).',
    images: [
      'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Editorial Director',
    tags: ['9-Day Grand Tour', 'Boutique Hotels', 'Private Driver', 'Flights Included', 'UNESCO World Heritage', 'Riviera Boat Cruise'],
    amenities: [
      'International Airfare Included (TRV ⇄ TIA)',
      'Dedicated Private Vehicle & Chauffeur',
      'Comfortable Mid-Range & Boutique Hotels',
      'Dajti Ekspres Cable Car Pass',
      'Ksamil 4-Islands Boat Excursion',
      'Butrint & Berat UNESCO Admissions',
      'Syri i Kaltër (Blue Eye) Pass',
      '24/7 Dedicated Concierge Support'
    ],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    id: 'pkg-albania-9day-luxury-02',
    title: 'Albania 9-Day Luxury VIP Odyssey: 5-Star Stays & Private Yacht',
    category: 'PACKAGE',
    price: 4950,
    rating: 5.0,
    reviewCount: 38,
    location: 'Tirana, Berat, Sarandë, Ksamil & Riviera',
    country: 'Albania',
    coordinates: { lat: 39.8756, lng: 20.0053 },
    description: 'Ultra-luxury 9-day Albanian expedition. Selected premium airfare quote (₹2,56,951/person via Gulf Air & Aegean/Turkish Airlines). 5-star seaside suites in Sarandë, boutique Ottoman palaces in Berat, chartered private speedboat cruise around Ksamil 4 islands, luxury high-comfort vehicle with private master driver, VIP historians at Butrint & Berat castles, and generous upscale fine-dining allowance (₹15,000–₹30,000/day). Final estimate: ₹3,85,951–₹4,34,951/person (4 Pax: ₹15,43,804–₹17,39,804).',
    images: [
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Luxury Concierge',
    tags: ['5-Star Luxury', 'Private Yacht', 'VIP Concierge', 'Selected Premium Flights', 'Fine Dining Allowance', 'Presidential Level'],
    amenities: [
      'Selected Premium International Flights (₹2,56,951 Included)',
      '5-Star Upscale Luxury Stays & Suites',
      'Private Chartered Ksamil Speedboat',
      'Luxury High-Comfort Chauffeur Vehicle',
      'Private Heritage Historian Guides',
      'Upscale Fine Dining Daily Allowance',
      'Priority Fast-Track Airport Service',
      '24/7 VIP Concierge'
    ],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    id: 'pkg-albania-9day-basic-03',
    title: 'Albania 9-Day Value Discovery: Complete Heritage & Coastal Circuit',
    category: 'PACKAGE',
    price: 1450,
    rating: 4.93,
    reviewCount: 56,
    location: 'Tirana, Berat, Gjirokastër, Sarandë & Vlorë',
    country: 'Albania',
    coordinates: { lat: 41.3275, lng: 19.8187 },
    description: 'Exceptional value full 9-day circuit covering all highlights of Albania. International airfare included (₹67,518/person, TRV ⇄ TIA via Oman Air & Wizz Air). Value-oriented private-room accommodations, practical shared & private transfer allowance, all entry admissions (Skanderbeg, Bunk\'Art 2, Berat Castle, Gjirokastër Fortress, Blue Eye, Butrint UNESCO, and Porto Palermo). Final estimate: ₹1,11,018–₹1,26,518/person (4 Pax: ₹4,44,072–₹5,06,072).',
    images: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Value Operations',
    tags: ['Best Value', 'Full Circuit', 'Economy Flights Included', 'Private Room Stays', 'Complete Sightseeing'],
    amenities: [
      'Economy International Airfare (TRV ⇄ TIA)',
      'Curated Private-Room Value Stays',
      'Practical Transport Allowance',
      'All Monument & Castle Admissions',
      'Full 9-Day Route Itinerary',
      'Trip Support & Guides'
    ],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    id: 'list-albania-ksamil-butrint-04',
    title: 'Ksamil Archipelago, Bora Bora Beach & Butrint Ancient Ruins',
    category: 'PLACE',
    price: 120,
    rating: 4.98,
    reviewCount: 89,
    location: 'Ksamil & Butrint, Sarandë',
    country: 'Albania',
    coordinates: { lat: 39.7667, lng: 20.0050 },
    description: 'Known as the Ionian Pearl, Ksamil boasts crystal turquoise lagoons, four uninhabited islands reachable by boat, the iconic overwater hand sculpture, and the adjoining UNESCO World Heritage ruins of Butrint featuring Greek amphitheaters and Venetian towers.',
    images: ['https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80'],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Editorial',
    tags: ['Ksamil Islands', 'Ionian Sea', 'Butrint UNESCO', 'Boat Tour', 'Beach Paradise'],
    amenities: ['Island Boat Excursions', 'Archaeological Museum Pass', 'Beach Loungers & Sunbeds', 'Snorkeling Waters'],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    id: 'list-albania-berat-castle-05',
    title: 'Berat UNESCO Fortress & The City of a Thousand Windows',
    category: 'PLACE',
    price: 150,
    rating: 4.97,
    reviewCount: 76,
    location: 'Berat',
    country: 'Albania',
    coordinates: { lat: 40.7058, lng: 19.9522 },
    description: 'A magical living medieval fortress overlooking the Osum River. Walk the cobblestone alleys of Mangalem and Gorica quarters, visit the Onufri Iconographic Museum, cross the historic 18th-century Gorica Bridge, and sample traditional Albanian cuisine.',
    images: ['https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80'],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Editorial',
    tags: ['UNESCO World Heritage', 'Living Fortress', 'Ottoman Architecture', 'Gorica Bridge', 'Scenic Viewpoints'],
    amenities: ['Castle Grounds Guided Tour', 'Onufri Museum Admission', 'Gorica Riverside Walk', 'Historic Photography Points'],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    id: 'list-albania-blue-eye-gjirokaster-06',
    title: 'Syri i Kaltër Natural Spring & Gjirokastër Stone City',
    category: 'PLACE',
    price: 160,
    rating: 4.99,
    reviewCount: 94,
    location: 'Gjirokastër & Blue Eye',
    country: 'Albania',
    coordinates: { lat: 39.9236, lng: 20.1925 },
    description: 'Syri i Kaltër is a breathtaking natural spring with mesmerizing sapphire depths surrounded by lush greenery. The journey continues to Gjirokastër, the stone fortress city featuring the grand castle, Qafa e Pazarit cobblestone bazaar, Skënduli House, and Zekate House.',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Editorial',
    tags: ['Blue Eye Spring', 'Gjirokastër Castle', 'Old Stone Bazaar', 'Zekate House', 'Hydrothermal Spring'],
    amenities: ['Blue Eye Nature Reserve Pass', 'Gjirokastër Castle Admission', 'Traditional House Entry', 'Bazaar Artisan Experience'],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    id: 'list-albania-riviera-dhermi-07',
    title: 'Porto Palermo Ali Pasha Castle, Jalë Beach & Llogara Pass Panorama',
    category: 'PLACE',
    price: 210,
    rating: 4.99,
    reviewCount: 110,
    location: 'Albanian Riviera, Himarë & Dhërmi',
    country: 'Albania',
    coordinates: { lat: 40.1444, lng: 19.6425 },
    description: 'Winding coastal highway along the pristine Albanian Riviera. Discover the triangular Venetian-Ottoman fortress of Ali Pasha at Porto Palermo, the pristine azure waters of Jalë Beach, the stone alleys of Dhërmi Old Village, and the jaw-dropping panoramic switchbacks of Llogara Pass.',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Editorial',
    tags: ['Albanian Riviera', 'Ali Pasha Castle', 'Jalë Beach', 'Llogara Pass', 'Coastal Panorama'],
    amenities: ['Porto Palermo Castle Access', 'Scenic Riviera Chauffeur Route', 'Beach Access & Loungers', 'Llogara Viewpoint Stop'],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  },
  {
    id: 'list-albania-tirana-dajti-08',
    title: 'Mount Dajti Cable Car & Tirana Historic Landmark Circuit',
    category: 'PLACE',
    price: 140,
    rating: 4.95,
    reviewCount: 82,
    location: 'Tirana',
    country: 'Albania',
    coordinates: { lat: 41.3275, lng: 19.8187 },
    description: 'Explore the vibrant Albanian capital. Ride the Dajti Ekspres cable car up Mount Dajti for sweeping views over the city, explore Skanderbeg Square and the Clock Tower, tour the underground communist bunker museum of Bunk\'Art 2, walk the historic Tirana Castle pedestrian zone, and relax in trendy Blloku.',
    images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'],
    status: 'PUBLISHED',
    createdBy: 'voyage@gmail.com',
    createdByName: 'Voyage Editorial',
    tags: ['Mount Dajti', 'Cable Car Pass', 'BunkArt 2', 'Skanderbeg Square', 'Capital Highlights'],
    amenities: ['Dajti Ekspres Return Ticket', 'Bunk\'Art 2 Entry', 'Tirana Castle Walkway Access', 'Guided City Center Map'],
    timestamps: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-seed-01',
    action: 'TECH_ADMIN_LOGIN_SUCCESS',
    performedBy: 'mukundkrishna2008@gmail.com',
    performedByEmail: 'mukundkrishna2008@gmail.com',
    targetId: 'SECURITY_AUTH',
    targetType: 'SYSTEM_AUTH',
    ipAddress: '127.0.0.1 (Authorized)',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    details: { authMethod: 'DIRECT_SECURE_AUTH', role: 'TECH_ADMIN' }
  }
];

const INITIAL_CUSTOM_TRIPS: any[] = [];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-albania-luxury-1',
    listingId: 'pkg-albania-9day-luxury-02',
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
    listingId: 'list-albania-ksamil-butrint-04',
    userId: 'user-elena-01',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@voyagereview.org',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
    rating: 5,
    comment: 'The azure sea right in front of the balcony is magical. Bora Bora beach is pristine, and the freshly caught grilled sea bass dinner was unforgettable!',
    createdAt: '2026-04-02T16:15:00.000Z'
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
  'list-mannanthala-place-01': { lat: 8.5583, lng: 76.9458 },
  'list-mannanthala-hotel-02': { lat: 8.5601, lng: 76.9482 },
  'list-mannanthala-food-03': { lat: 8.5575, lng: 76.9460 },
  'pkg-mannanthala-trivandrum-01': { lat: 8.5583, lng: 76.9458 },
  'list-albania-tirana-01': { lat: 41.3275, lng: 19.8187 },
  'list-albania-berat-02': { lat: 40.7058, lng: 19.9522 },
  'list-albania-gjirokaster-03': { lat: 40.0758, lng: 20.1389 },
  'list-albania-blueeye-04': { lat: 39.9242, lng: 20.1919 },
  'list-albania-ksamil-hotel-05': { lat: 39.7719, lng: 20.0036 },
  'list-albania-butrint-06': { lat: 39.7439, lng: 20.0211 },
  'list-albania-dhermi-dining-07': { lat: 40.1539, lng: 19.6428 },
  'pkg-albania-9day-basic': { lat: 41.3275, lng: 19.8187 },
  'pkg-albania-9day-midrange': { lat: 40.7058, lng: 19.9522 },
  'pkg-albania-9day-luxury': { lat: 39.7719, lng: 20.0036 },
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

      // Purge removed mock items & Seed Initial Platform Listings
      const removedMockIds = new Set([
        'list-santorini-01',
        'list-mannanthala-place-01',
        'list-swiss-alps-05',
        'pkg-alpine-wellness-01',
        'pkg-kyoto-zen-01',
        'pkg-luxury-europe-01',
        'pkg-mannanthala-trivandrum-01',
        'list-dining-kyoto-03',
        'list-hotel-amalfi-02',
        'list-hotel-kyoto-04',
        'list-mannanthala-food-03',
        'list-mannanthala-hotel-02',
        'list-swiss-alps-04',
        'list-hotel-bali-05',
        'list-tokyo-sushi-08',
        'list-hotel-como-09'
      ]);

      try {
        const listingsSnap = await getDocs(collection(firestoreDb, 'listings'));
        for (const docSnap of listingsSnap.docs) {
          if (removedMockIds.has(docSnap.id)) {
            await this.safeFirestoreDelete('listings', docSnap.id);
          }
        }
        for (const item of INITIAL_LISTINGS) {
          await this.safeFirestoreWrite('listings', item.id, item);
        }
      } catch (err) {
        console.warn('Failed to verify or seed initial platform listings in Firestore:', err);
      }

      // 1. Real-time Listings sync
      try {
        onSnapshot(collection(firestoreDb, 'listings'), (snapshot) => {
          const firestoreListings: Listing[] = [];
          snapshot.forEach(d => {
            const item = d.data() as Listing;
            if (removedMockIds.has(item.id) || removedMockIds.has(d.id)) {
              this.safeFirestoreDelete('listings', d.id);
            } else {
              firestoreListings.push(item);
            }
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

        // Ensure listings have initial listings merged and coordinates applied
        const diskListings: Listing[] = Array.isArray(parsed.listings) ? [...parsed.listings] : [];
        for (const initListing of INITIAL_LISTINGS) {
          if (!diskListings.some(l => l.id === initListing.id)) {
            diskListings.push(initListing);
          }
        }

        const listings: Listing[] = diskListings.map((item: Listing) => {
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
          custom_trips: Array.isArray(parsed.custom_trips) && parsed.custom_trips.length > 0 ? parsed.custom_trips : INITIAL_CUSTOM_TRIPS,
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
      custom_trips: INITIAL_CUSTOM_TRIPS,
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
    const existingIds = new Set(this.data.listings.map(l => l.id));
    const missing = INITIAL_LISTINGS.filter(d => !existingIds.has(d.id));
    if (missing.length > 0) {
      this.data.listings.unshift(...missing);
      this.writeToDisk(this.data);
    }
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

  // --- Custom Trips & Package Requests ---

  getCustomTrips(userId?: string): CustomTripRequest[] {
    if (!this.data.custom_trips) this.data.custom_trips = INITIAL_CUSTOM_TRIPS;
    if (userId) {
      return this.data.custom_trips.filter(t => t.userId === userId || t.userEmail?.toLowerCase() === userId.toLowerCase());
    }
    return this.data.custom_trips;
  }

  getCustomTripById(id: string): CustomTripRequest | undefined {
    if (!this.data.custom_trips) this.data.custom_trips = INITIAL_CUSTOM_TRIPS;
    return this.data.custom_trips.find(t => t.id === id);
  }

  createCustomTrip(trip: CustomTripRequest): CustomTripRequest {
    if (!this.data.custom_trips) this.data.custom_trips = INITIAL_CUSTOM_TRIPS;
    this.data.custom_trips.unshift(trip);
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('custom_trips', trip.id, trip);
    return trip;
  }

  updateCustomTrip(id: string, updates: Partial<CustomTripRequest>): CustomTripRequest | null {
    if (!this.data.custom_trips) this.data.custom_trips = INITIAL_CUSTOM_TRIPS;
    const idx = this.data.custom_trips.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const current = this.data.custom_trips[idx];
    const updated: CustomTripRequest = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.custom_trips[idx] = updated;
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('custom_trips', id, updated);
    return updated;
  }

  deleteCustomTrip(id: string): boolean {
    if (!this.data.custom_trips) return false;
    const initialLen = this.data.custom_trips.length;
    this.data.custom_trips = this.data.custom_trips.filter(t => t.id !== id);
    if (this.data.custom_trips.length !== initialLen) {
      this.writeToDisk(this.data);
      this.safeFirestoreDelete('custom_trips', id);
      return true;
    }
    return false;
  }
}

export const db = new Database();
