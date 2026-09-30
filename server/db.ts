import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { User, Listing, AuditLog, Booking, SavedTrip, CustomPost, FeedPost, CustomTripRequest, Review } from './types.ts';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

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

const firestoreDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || undefined);

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

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
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

const INITIAL_LISTINGS: Listing[] = [
  {
    "id": "pkg-albania-9day-basic-03",
    "title": "Albania 9-Day Value Discovery: Complete Heritage & Coastal Circuit (Basic Tier)",
    "category": "PACKAGE",
    "price": 1330,
    "rating": 4.95,
    "reviewCount": 48,
    "location": "Tirana, Berat, Gjirokastër, Ksamil & Riviera",
    "country": "Albania",
    "coordinates": {
      "lat": 41.3275,
      "lng": 19.8187
    },
    "description": "High-value self-guided/shared 9-day complete Albania tour (9–19 Oct 2026). Flight included (TRV → MCT → MXP → TIA and TIA → FCO → DOH → TRV, ₹67,518/person). Comfortable private-room local hotels, practical driver planning allowance, Dajti Ekspres cable car over Tirana, Berat UNESCO castle & Onufri museum, Gjirokastër stone city (Skënduli & Zekate houses), the turquoise Blue Eye spring, Ksamil 4-islands boat cruise, Butrint UNESCO archaeological site, Porto Palermo & Ali Pasha Castle, Jalë Beach, Dhërmi Old Village, and Llogara Pass descent to Vlorë. Land package: ₹43,500–₹59,000/person (4 Pax: ₹4,44,072–₹5,06,072).",
    "images": [
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Operations",
    "tags": [
      "Basic Tier",
      "Value Package",
      "9-Day Circuit",
      "Included Flights",
      "Heritage & Coast"
    ],
    "amenities": [
      "Selected Flights (TRV ⇄ TIA)",
      "Private Room Local Hotels",
      "Driver & Transport Allowance",
      "Entry Passes to Castles & Blue Eye",
      "Ksamil Boat Excursion"
    ],
    "duration": "9 Days / 8 Nights (9-19 Oct 2026)",
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.419Z",
      "updatedAt": "2026-09-30T02:49:04.419Z"
    }
  },
  {
    "id": "pkg-albania-9day-midrange-01",
    "title": "Albania 9-Day Grand Tour: Tirana to the Ionian Riviera (Medium / Mid-Range Tier)",
    "category": "PACKAGE",
    "price": 1720,
    "rating": 4.99,
    "reviewCount": 74,
    "location": "Tirana, Berat, Gjirokastër, Ksamil & Riviera",
    "country": "Albania",
    "coordinates": {
      "lat": 41.3275,
      "lng": 19.8187
    },
    "description": "The definitive 9-day grand loop through Albania (9–19 Oct 2026). Flight included (TRV → MCT → MXP → TIA and TIA → FCO → DOH → TRV, ₹74,890/person). Comfortable boutique hotels, dedicated private vehicle + driver planning allowance, Dajti Ekspres cable car over Tirana, Berat UNESCO castle & Onufri museum, Gjirokastër stone city (Skënduli & Zekate houses), turquoise Blue Eye spring, Ksamil 4-islands boat cruise, Butrint UNESCO site, Porto Palermo & Ali Pasha Castle, Jalë Beach, Dhërmi Old Village, and Llogara Pass descent to Vlorë. Land package: ₹68,500–₹92,500/person (4 Pax: ₹5,73,560–₹6,69,560).",
    "images": [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Editorial",
    "tags": [
      "Medium Tier",
      "Mid-Range Classic",
      "Dedicated Private Driver",
      "Boutique Hotels",
      "Full 9-Day Circuit"
    ],
    "amenities": [
      "Selected Flights (TRV ⇄ TIA)",
      "4-Star Boutique Stays in Tirana & Sarandë",
      "Dedicated Private AC Driver & Vehicle",
      "Dajti Cable Car Pass & BunkArt 2 Ticket",
      "Ksamil 4 Islands Boat Tour",
      "Butrint UNESCO Historian Pass",
      "Daily Restaurant Breakfast & Allowance"
    ],
    "duration": "9 Days / 8 Nights (9-19 Oct 2026)",
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.419Z",
      "updatedAt": "2026-09-30T02:49:04.419Z"
    }
  },
  {
    "id": "pkg-albania-9day-luxury-02",
    "title": "Albania 9-Day Luxury VIP Odyssey: 5-Star Stays & Private Yacht (Luxury Tier)",
    "category": "PACKAGE",
    "price": 4630,
    "rating": 5,
    "reviewCount": 36,
    "location": "Tirana, Berat, Sarandë, Ksamil & Riviera",
    "country": "Albania",
    "coordinates": {
      "lat": 39.7719,
      "lng": 20.0036
    },
    "description": "The ultimate VIP itinerary from India (TRV ⇄ TIA via Gulf Air & Turkish Airlines, ₹2,56,951/person). Features 5-star seaside suites in Sarandë, luxury boutique palace in Berat, private chartered speedboats around Ksamil islands, dedicated high-comfort vehicle + driver, VIP historian guides at Butrint UNESCO site, and daily upscale restaurant allowances. Land package: ₹1,29,000–₹1,78,000/person (4 Pax: ₹15,43,804–₹17,39,804).",
    "images": [
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Luxury Concierge",
    "tags": [
      "Luxury Tier",
      "Private Speedboat",
      "VIP Concierge",
      "5-Star Seaside Suites",
      "Full 9-Day Circuit"
    ],
    "amenities": [
      "Premium Flights (TRV ⇄ TIA)",
      "5-Star Luxury Suites & Boutique Stays",
      "Private High-Comfort Chauffeur Vehicle",
      "Private Chartered Ksamil Islands Cruise",
      "VIP Historian Guides",
      "Upscale Dining & Wine Allowance",
      "24/7 Concierge Support"
    ],
    "duration": "9 Days / 8 Nights (9-19 Oct 2026)",
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.419Z",
      "updatedAt": "2026-09-30T02:49:04.419Z"
    }
  },
  {
    "id": "list-albania-ksamil-butrint-04",
    "title": "Ksamil Archipelago, Bora Bora Beach & Butrint Ancient Ruins",
    "category": "PLACE",
    "price": 120,
    "rating": 4.98,
    "reviewCount": 95,
    "location": "Ksamil & Butrint, Ionian Coast",
    "country": "Albania",
    "coordinates": {
      "lat": 39.7719,
      "lng": 20.0036
    },
    "description": "The pearl of the Albanian Riviera. Crystal-clear turquoise waters of Ksamil 4 islands, white sand at Bora Bora Beach, paired with the ancient Greco-Roman ruins of Butrint UNESCO park.",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Editorial",
    "tags": [
      "Ksamil Islands",
      "Bora Bora Beach",
      "Butrint UNESCO",
      "Archipelagos",
      "Seafood Dining"
    ],
    "amenities": [
      "Ksamil Boat Tour Access",
      "Butrint Archaeological Park Ticket",
      "Bora Bora Beach Sunbed Voucher",
      "Seafood Promenade Map"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
  },
  {
    "id": "list-albania-berat-castle-05",
    "title": "Berat UNESCO Fortress & The City of a Thousand Windows",
    "category": "PLACE",
    "price": 95,
    "rating": 4.97,
    "reviewCount": 88,
    "location": "Berat, Central Albania",
    "country": "Albania",
    "coordinates": {
      "lat": 40.7058,
      "lng": 19.9522
    },
    "description": "Explore Mangalem and Gorica quarters, walk up to the inhabited 13th-century Berat Castle, visit Onufri Iconographic Museum, and cross the historic Gorica Bridge over the Osum River.",
    "images": [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Editorial",
    "tags": [
      "Berat Castle",
      "UNESCO World Heritage",
      "Onufri Museum",
      "Mangalem Quarter",
      "Gorica Bridge"
    ],
    "amenities": [
      "Berat Castle Entry Ticket",
      "Onufri Museum Pass",
      "Gorica Bridge Walkway",
      "Old Town Heritage Map"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
  },
  {
    "id": "list-albania-blue-eye-gjirokaster-06",
    "title": "Syri i Kaltër Natural Spring & Gjirokastër Stone City",
    "category": "PLACE",
    "price": 110,
    "rating": 4.96,
    "reviewCount": 76,
    "location": "Gjirokastër & Blue Eye",
    "country": "Albania",
    "coordinates": {
      "lat": 40.0758,
      "lng": 20.1389
    },
    "description": "Discover the mesmerizing Syri i Kaltër (Blue Eye) karst spring bubbling up from deep underwater caves, then tour the Ottoman stone city of Gjirokastër, its formidable castle, Skënduli House, and Qafa e Pazarit bazaar.",
    "images": [
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Editorial",
    "tags": [
      "Blue Eye Spring",
      "Gjirokastër Castle",
      "Skënduli House",
      "Stone City",
      "Old Bazaar"
    ],
    "amenities": [
      "Syri i Kaltër Nature Reserve Ticket",
      "Gjirokastër Castle Pass",
      "Skënduli House Guided Visit"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
  },
  {
    "id": "list-albania-riviera-dhermi-07",
    "title": "Porto Palermo Ali Pasha Castle, Jalë Beach & Llogara Pass Panorama",
    "category": "PLACE",
    "price": 130,
    "rating": 4.98,
    "reviewCount": 90,
    "location": "Dhërmi, Jalë & Llogara Pass",
    "country": "Albania",
    "coordinates": {
      "lat": 40.1539,
      "lng": 19.6428
    },
    "description": "Take the scenic coastal drive along the Albanian Riviera. Visit the triangular fortress of Ali Pasha in Porto Palermo Bay, relax on white pebbles at Jalë Beach, explore Dhërmi Old Village, and take in mountain views from Llogara Pass.",
    "images": [
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Editorial",
    "tags": [
      "Ali Pasha Castle",
      "Jalë Beach",
      "Llogara Pass",
      "Dhërmi Old Village",
      "Riviera Scenic Drive"
    ],
    "amenities": [
      "Porto Palermo Castle Ticket",
      "Llogara Pass Viewpoint Stop",
      "Jalë Beach Lounge Access"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
  },
  {
    "id": "list-albania-tirana-dajti-08",
    "title": "Mount Dajti Cable Car & Tirana Historic Landmark Circuit",
    "category": "PLACE",
    "price": 140,
    "rating": 4.95,
    "reviewCount": 82,
    "location": "Tirana",
    "country": "Albania",
    "coordinates": {
      "lat": 41.3275,
      "lng": 19.8187
    },
    "description": "Explore the vibrant Albanian capital. Ride the Dajti Ekspres cable car up Mount Dajti for sweeping views over the city, explore Skanderbeg Square and the Clock Tower, tour Bunk'Art 2, walk Tirana Castle pedestrian zone, and relax in Blloku.",
    "images": [
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Editorial",
    "tags": [
      "Mount Dajti",
      "Cable Car Pass",
      "BunkArt 2",
      "Skanderbeg Square",
      "Capital Highlights"
    ],
    "amenities": [
      "Dajti Ekspres Return Ticket",
      "Bunk'Art 2 Entry",
      "Tirana Castle Walkway Access",
      "Guided City Center Map"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
  },
  {
    "id": "list-albania-theth-09",
    "title": "Theth National Park & Blue Eye of Kaprre (Albanian Alps)",
    "category": "PLACE",
    "price": 180,
    "rating": 4.99,
    "reviewCount": 92,
    "location": "Theth, Accursed Mountains",
    "country": "Albania",
    "coordinates": {
      "lat": 42.3931,
      "lng": 19.7744
    },
    "description": "Dramatic limestone peaks of the Accursed Mountains, featuring the historic Lock-in Tower (Kulla), Grunas Waterfall, traditional stone shepherd chalets, and the icy waters of Kaprre Blue Eye.",
    "images": [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Alpine Expeditions",
    "tags": [
      "Albanian Alps",
      "Accursed Mountains",
      "Grunas Waterfall",
      "Hiking",
      "Kaprre Blue Eye"
    ],
    "amenities": [
      "Mountain Guide",
      "National Park Entry",
      "Chalet Guesthouse Access",
      "Trek Map & Poles"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
  },
  {
    "id": "list-albania-shkodra-10",
    "title": "Rozafa Castle & Lake Shkodra Illyrian Citadel",
    "category": "PLACE",
    "price": 110,
    "rating": 4.96,
    "reviewCount": 65,
    "location": "Shkodër, Northern Albania",
    "country": "Albania",
    "coordinates": {
      "lat": 42.0467,
      "lng": 19.4939
    },
    "description": "Perched above the confluence of Drin and Buna rivers, ancient Illyrian Rozafa Castle offers 360-degree views across Lake Shkodra with over two millennia of history.",
    "images": [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Editorial",
    "tags": [
      "Rozafa Castle",
      "Lake Shkodra",
      "Illyrian Fortress",
      "Historic Panorama"
    ],
    "amenities": [
      "Castle Archaeological Museum",
      "River Viewpoints",
      "Bicycle Promenade Pass"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
  },
  {
    "id": "list-albania-karaburun-11",
    "title": "Karaburun Peninsula & Haxhi Ali Pirate Cave Boat Expedition",
    "category": "PLACE",
    "price": 175,
    "rating": 4.98,
    "reviewCount": 88,
    "location": "Vlorë & Karaburun Marine Park",
    "country": "Albania",
    "coordinates": {
      "lat": 40.41,
      "lng": 19.35
    },
    "description": "Accessible exclusively by speedboat from Vlorë, cruise into the colossal Haxhi Ali sea cave, swim in secluded white-pebble coves of Dafina and Grama Bay, and explore Sazan Island.",
    "images": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    "status": "PUBLISHED",
    "createdBy": "voyage@gmail.com",
    "createdByName": "Voyage Marine Safaris",
    "tags": [
      "Pirate Cave",
      "Marine Reserve",
      "Speedboat Safari",
      "Grama Bay",
      "Sazan Island"
    ],
    "amenities": [
      "Charter Speedboat Cruise",
      "Snorkeling Equipment",
      "Cave Entry Permits",
      "Captain Guide"
    ],
    "timestamps": {
      "createdAt": "2026-09-30T02:49:04.420Z",
      "updatedAt": "2026-09-30T02:49:04.420Z"
    }
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
    "id": "rev-albania-luxury-1",
    "listingId": "pkg-albania-9day-luxury-02",
    "userId": "user-traveler-03",
    "userName": "Alex Rivera",
    "userEmail": "alex.globetrotter@example.com",
    "userAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
    "rating": 5,
    "comment": "The 9-day Albania trip exceeded every expectation! The private boat cruise around Ksamil 4 islands and the private historian tour of Butrint UNESCO park were highlights of a lifetime. Seamless transfers and breathtaking views on the Llogara Pass.",
    "createdAt": "2026-03-15T10:30:00.000Z"
  },
  {
    "id": "rev-albania-ksamil-1",
    "listingId": "list-albania-ksamil-butrint-04",
    "userId": "user-elena-01",
    "userName": "Elena Rostova",
    "userEmail": "elena.rostova@voyagereview.org",
    "userAvatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80",
    "rating": 5,
    "comment": "The azure sea right in front of the balcony is magical. Bora Bora beach is pristine, and the freshly caught grilled sea bass dinner was unforgettable!",
    "createdAt": "2026-04-02T16:15:00.000Z"
  }
];

const DEFAULT_COORDS_MAP: Record<string, { lat: number; lng: number }> = {
  'pkg-albania-9day-basic-03': { lat: 41.3275, lng: 19.8187 },
  'pkg-albania-9day-midrange-01': { lat: 41.3275, lng: 19.8187 },
  'pkg-albania-9day-luxury-02': { lat: 39.7719, lng: 20.0036 },
  'list-albania-ksamil-butrint-04': { lat: 39.7719, lng: 20.0036 },
  'list-albania-berat-castle-05': { lat: 40.7058, lng: 19.9522 },
  'list-albania-blue-eye-gjirokaster-06': { lat: 40.0758, lng: 20.1389 },
  'list-albania-riviera-dhermi-07': { lat: 40.1539, lng: 19.6428 },
  'list-albania-tirana-dajti-08': { lat: 41.3275, lng: 19.8187 },
  'list-albania-theth-09': { lat: 42.3931, lng: 19.7744 },
  'list-albania-shkodra-10': { lat: 42.0467, lng: 19.4939 },
  'list-albania-karaburun-11': { lat: 40.4100, lng: 19.3500 }
};

interface DatabaseSchema {
  users: User[];
  listings: Listing[];
  audit_logs: AuditLog[];
  bookings: Booking[];
  saved_trips: SavedTrip[];
  custom_posts: CustomPost[];
  feed_posts: FeedPost[];
  custom_trips: CustomTripRequest[];
  reviews: Review[];
}

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
      console.error('Failed to write document ' + docId + ' to Firestore collection ' + collectionName + ':', err);
    }
  }

  private async safeFirestoreDelete(collectionName: string, docId: string) {
    try {
      await deleteDoc(doc(firestoreDb, collectionName, docId));
    } catch (err) {
      console.error('Failed to delete document ' + docId + ' from Firestore collection ' + collectionName + ':', err);
    }
  }

  private async initFirestoreSync() {
    try {
      console.log('Initializing background real-time Firestore synchronization with local cache...');

      try {
        const listingsSnap = await getDocs(collection(firestoreDb, 'listings'));
        for (const docSnap of listingsSnap.docs) {
          const item = docSnap.data() as Listing;
          if (item.country !== 'Albania' && !docSnap.id.includes('albania')) {
            await this.safeFirestoreDelete('listings', docSnap.id);
          }
        }
        for (const item of INITIAL_LISTINGS) {
          await this.safeFirestoreWrite('listings', item.id, item);
        }
      } catch (err) {
        console.warn('Failed to verify or seed initial platform listings in Firestore:', err);
      }

      try {
        onSnapshot(collection(firestoreDb, 'listings'), (snapshot) => {
          const firestoreListings: Listing[] = [];
          snapshot.forEach(d => {
            const item = d.data() as Listing;
            if (item.country !== 'Albania' && !d.id.includes('albania')) {
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
          console.log('[Firestore Realtime] Synced ' + this.data.listings.length + ' listings.');
        }, (err) => {
          console.warn('[Firestore Realtime] Error syncing listings:', err);
        });
      } catch (err) {
        console.warn('Failed to attach listings snapshot listener:', err);
      }
    } catch (err) {
      console.error('Failed to initialize Firestore sync:', err);
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
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users?.length ? parsed.users : INITIAL_USERS,
          listings: parsed.listings?.length ? parsed.listings.filter((l: Listing) => l.country === 'Albania' || l.id.includes('albania')) : INITIAL_LISTINGS,
          audit_logs: parsed.audit_logs?.length ? parsed.audit_logs : INITIAL_AUDIT_LOGS,
          bookings: parsed.bookings || [],
          saved_trips: parsed.saved_trips || [],
          custom_posts: parsed.custom_posts?.length ? parsed.custom_posts : INITIAL_CUSTOM_POSTS,
          feed_posts: parsed.feed_posts || [],
          custom_trips: parsed.custom_trips || [],
          reviews: parsed.reviews || INITIAL_REVIEWS,
        };
      }
    } catch (err) {
      console.warn('Failed to read database.json, initializing defaults:', err);
    }
    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      listings: INITIAL_LISTINGS,
      audit_logs: INITIAL_AUDIT_LOGS,
      bookings: [],
      saved_trips: [],
      custom_posts: INITIAL_CUSTOM_POSTS,
      feed_posts: [],
      custom_trips: [],
      reviews: INITIAL_REVIEWS,
    };
    this.writeToDisk(defaultData);
    return defaultData;
  }

  private writeToDisk(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  public getListings(): Listing[] {
    return this.data.listings || [];
  }

  public getListingById(id: string): Listing | undefined {
    return this.data.listings.find((l) => l.id === id);
  }

  public createListing(listing: Listing): Listing {
    this.data.listings.unshift(listing);
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('listings', listing.id, listing);
    return listing;
  }

  public updateListing(id: string, updates: Partial<Listing>): Listing | undefined {
    const idx = this.data.listings.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.data.listings[idx] = { ...this.data.listings[idx], ...updates, timestamps: { ...this.data.listings[idx].timestamps, updatedAt: new Date().toISOString() } };
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('listings', id, this.data.listings[idx]);
    return this.data.listings[idx];
  }

  public deleteListing(id: string): boolean {
    const idx = this.data.listings.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    this.data.listings.splice(idx, 1);
    this.writeToDisk(this.data);
    this.safeFirestoreDelete('listings', id);
    return true;
  }

  public deleteAllListings(): boolean {
    this.data.listings = [];
    this.writeToDisk(this.data);
    return true;
  }

  // User Methods
  public getUsers(): User[] {
    return this.data.users || [];
  }

  public getUserById(uid: string): User | undefined {
    return this.data.users.find(u => u.uid === uid);
  }

  public getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByPhone(phone: string): User | undefined {
    if (!phone) return undefined;
    return this.data.users.find(u => u.phoneNumber === phone);
  }

  public saveUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.uid === user.uid || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...user };
    } else {
      this.data.users.push(user);
    }
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('users', user.uid, user);
    return user;
  }

  public deleteUser(uid: string): boolean {
    const idx = this.data.users.findIndex(u => u.uid === uid);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.writeToDisk(this.data);
    this.safeFirestoreDelete('users', uid);
    return true;
  }

  public updateUserRole(uid: string, role: any, customTitle?: string, department?: string): User | undefined {
    const user = this.getUserById(uid);
    if (!user) return undefined;
    user.role = role;
    if (customTitle !== undefined) user.customTitle = customTitle;
    if (department !== undefined) user.department = department;
    return this.saveUser(user);
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs || [];
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.data.audit_logs.unshift(newLog);
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('audit_logs', newLog.id, newLog);
    return newLog;
  }

  // Custom Posts
  public getCustomPosts(): CustomPost[] {
    return this.data.custom_posts || [];
  }

  public saveCustomPost(post: CustomPost): CustomPost {
    const idx = this.data.custom_posts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      this.data.custom_posts[idx] = post;
    } else {
      this.data.custom_posts.push(post);
    }
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('custom_posts', post.id, post);
    return post;
  }

  public deleteCustomPost(id: string): boolean {
    const idx = this.data.custom_posts.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.custom_posts.splice(idx, 1);
    this.writeToDisk(this.data);
    this.safeFirestoreDelete('custom_posts', id);
    return true;
  }

  // Feed Posts
  public getFeedPosts(): FeedPost[] {
    return this.data.feed_posts || [];
  }

  public saveFeedPost(post: FeedPost): FeedPost {
    const idx = this.data.feed_posts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      this.data.feed_posts[idx] = post;
    } else {
      this.data.feed_posts.unshift(post);
    }
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('feed_posts', post.id, post);
    return post;
  }

  public deleteFeedPost(id: string): boolean {
    const idx = this.data.feed_posts.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.feed_posts.splice(idx, 1);
    this.writeToDisk(this.data);
    this.safeFirestoreDelete('feed_posts', id);
    return true;
  }

  // Custom Trip Requests
  public getCustomTrips(userId?: string): CustomTripRequest[] {
    if (userId) {
      return (this.data.custom_trips || []).filter(t => t.userId === userId);
    }
    return this.data.custom_trips || [];
  }

  public getCustomTripById(id: string): CustomTripRequest | undefined {
    return this.data.custom_trips.find(t => t.id === id);
  }

  public createCustomTrip(trip: CustomTripRequest): CustomTripRequest {
    this.data.custom_trips.unshift(trip);
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('custom_trips', trip.id, trip);
    return trip;
  }

  public updateCustomTrip(id: string, updates: Partial<CustomTripRequest>): CustomTripRequest | undefined {
    const idx = this.data.custom_trips.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.data.custom_trips[idx] = { ...this.data.custom_trips[idx], ...updates, updatedAt: new Date().toISOString() };
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('custom_trips', id, this.data.custom_trips[idx]);
    return this.data.custom_trips[idx];
  }

  public deleteCustomTrip(id: string): boolean {
    const idx = this.data.custom_trips.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.custom_trips.splice(idx, 1);
    this.writeToDisk(this.data);
    this.safeFirestoreDelete('custom_trips', id);
    return true;
  }

  // Bookings
  public getBookings(userId?: string): Booking[] {
    if (userId) {
      return (this.data.bookings || []).filter(b => b.userId === userId);
    }
    return this.data.bookings || [];
  }

  public createBooking(booking: any): Booking {
    const newBooking: Booking = {
      ...booking,
      id: booking.id || `book-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: booking.createdAt || new Date().toISOString()
    };
    this.data.bookings.unshift(newBooking);
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('bookings', newBooking.id, newBooking);
    return newBooking;
  }

  // Saved Trips
  public getSavedTrips(userId: string): SavedTrip[] {
    return (this.data.saved_trips || []).filter(s => s.userId === userId);
  }

  public getSavedTripIds(userId: string): string[] {
    return this.getSavedTrips(userId).map(s => s.listingId);
  }

  public saveTrip(userId: string, listingId: string): SavedTrip {
    const existing = this.data.saved_trips.find(s => s.userId === userId && s.listingId === listingId);
    if (existing) return existing;
    const newSave: SavedTrip = {
      id: `save-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      listingId,
      createdAt: new Date().toISOString()
    };
    this.data.saved_trips.push(newSave);
    this.writeToDisk(this.data);
    this.safeFirestoreWrite('saved_trips', newSave.id, newSave);
    return newSave;
  }

  public removeSavedTrip(userId: string, listingId: string): boolean {
    const idx = this.data.saved_trips.findIndex(s => s.userId === userId && s.listingId === listingId);
    if (idx === -1) return false;
    const item = this.data.saved_trips[idx];
    this.data.saved_trips.splice(idx, 1);
    this.writeToDisk(this.data);
    this.safeFirestoreDelete('saved_trips', item.id);
    return true;
  }
}

export const db = new Database();
