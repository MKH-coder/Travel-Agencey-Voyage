import fs from 'fs';
import path from 'path';
import { User, Listing, AuditLog, Booking, SavedTrip, CustomPost } from './types.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: User[];
  listings: Listing[];
  audit_logs: AuditLog[];
  bookings: Booking[];
  saved_trips: SavedTrip[];
  custom_posts: CustomPost[];
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

const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list-santorini-01',
    title: 'Santorini Caldera Cliffside & Oia Sunset Panorama',
    category: 'PLACE',
    price: 340,
    rating: 4.95,
    reviewCount: 328,
    location: 'Oia, Santorini Island',
    country: 'Greece',
    coordinates: { lat: 36.4618, lng: 25.3753 },
    description: 'Iconic whitewashed cubic houses perched over Aegean volcanic cliffs, blue-domed chapels, and world-renowned sunset viewpoints over the sunken caldera lagoon.',
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_tech_admin_01',
    createdByName: 'Mukund Krishna',
    approvedBy: 'user_tech_admin_01',
    tags: ['Island', 'Sunset', 'Iconic', 'Romantic'],
    amenities: ['Catamaran Sailing Tour', 'Volcanic Hot Springs', 'Wine Tasting', 'Cliff Walks'],
    timestamps: {
      createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 24 * 24 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-hotel-amalfi-02',
    title: 'Grand Hotel Excelsior Amalfi Palace & Spa',
    category: 'HOTEL',
    price: 590,
    rating: 4.92,
    reviewCount: 184,
    location: 'Positano, Amalfi Coast',
    country: 'Italy',
    coordinates: { lat: 40.6281, lng: 14.4850 },
    description: 'Historic 5-star cliffside sanctuary with direct Mediterranean sea elevators, heated infinity salt pool, Michelin-starred terraces, and private boat charter moorings.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_tech_admin_01',
    createdByName: 'Mukund Krishna',
    approvedBy: 'user_tech_admin_01',
    tags: ['Luxury Stay', 'Sea View', 'Infinity Pool', 'Spa'],
    amenities: ['Free High-Speed WiFi', 'Private Helipad Access', 'Valet Parking', 'Butler Service', 'Thermal Thalasso Spa'],
    hotelPerks: ['Complimentary Italian Breakfast', 'Welcome Prosecco', 'Sunset Boat Shuttle to Positano Pier'],
    timestamps: {
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 19 * 24 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-dining-kyoto-03',
    title: 'Gion Karyo Heritage Kaiseki & Garden Dining',
    category: 'FOOD',
    price: 165,
    rating: 4.97,
    reviewCount: 412,
    location: 'Gion District, Kyoto',
    country: 'Japan',
    coordinates: { lat: 35.0037, lng: 135.7772 },
    description: 'Traditional 10-course seasonal kaiseki banquet prepared by master artisans in a preserved 160-year-old wooden machiya overlooking an authentic stone zen garden.',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_admin_02',
    createdByName: 'Sarah Jenkins',
    approvedBy: 'user_tech_admin_01',
    tags: ['Fine Dining', 'Kaiseki', 'Historic Machiya', 'Tea Ceremony'],
    diningSpecialties: ['Wagyu A5 Charcoal Sear', 'Seasonal Matsutake Dashi', 'Fresh Hokkaido Uni', 'Matcha Souffle'],
    amenities: ['Private Tatami Rooms', 'Sake Sommelier Pairing', 'English Menu Available'],
    timestamps: {
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-swiss-alps-04',
    title: 'Zermatt Glacier Alpine Traverse & Matterhorn Vista',
    category: 'PLACE',
    price: 280,
    rating: 4.88,
    reviewCount: 247,
    location: 'Zermatt, Valais',
    country: 'Switzerland',
    coordinates: { lat: 45.9765, lng: 7.7491 },
    description: 'High-altitude railway journey to Gornergrat, panoramic cable cars across the glacier paradise, and mirror alpine lake reflections of the majestic Matterhorn peak.',
    images: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_tech_admin_01',
    createdByName: 'Mukund Krishna',
    approvedBy: 'user_tech_admin_01',
    tags: ['Mountains', 'Skiing', 'Alpine Lakes', 'Scenic Train'],
    amenities: ['Gornergrat Train Pass', 'Glacier Ice Palace Entry', 'Fondue Tasting Experience'],
    timestamps: {
      createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-hotel-bali-05',
    title: 'Ubud Hanging Gardens River Sanctuary & Villa',
    category: 'HOTEL',
    price: 420,
    rating: 4.91,
    reviewCount: 295,
    location: 'Payangan, Ubud, Bali',
    country: 'Indonesia',
    coordinates: { lat: -8.5069, lng: 115.2625 },
    description: 'Award-winning twin-tiered cascading infinity pools nestled deep in the Ayung River valley rainforest, with handcrafted teakwood villas and volcanic stone plunge pools.',
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_admin_02',
    createdByName: 'Sarah Jenkins',
    approvedBy: 'user_tech_admin_01',
    tags: ['Rainforest Villa', 'Twin Infinity Pool', 'Wellness', 'Ayurveda'],
    amenities: ['Floating Breakfast in Pool', 'Daily Yoga Pavillion', 'River Valley Funicular', 'Spa by L’Occitane'],
    hotelPerks: ['Free Afternoon Tea', 'Organic Herb Garden Tour', 'Cultural Dance Performance'],
    timestamps: {
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-pending-banff-06',
    title: 'Banff Moraine Lake Glacial Canoe & Valley of Ten Peaks',
    category: 'PLACE',
    price: 195,
    rating: 4.96,
    reviewCount: 152,
    location: 'Banff National Park, Alberta',
    country: 'Canada',
    coordinates: { lat: 51.4968, lng: -115.9281 },
    description: 'Electric turquoise glacial waters nestled beneath towering snow-capped pyramidal peaks. Features guided sunrise heritage cedar canoe paddles and larch valley alpine trail treks.',
    images: [
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PENDING_APPROVAL',
    createdBy: 'user_admin_02',
    createdByName: 'Sarah Jenkins',
    tags: ['National Park', 'Glacial Lake', 'Canoeing', 'Wildlife'],
    amenities: ['Lakeside Canoe Rental', 'National Park Shuttle Express', 'Bear Safety Briefing'],
    timestamps: {
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-pending-paris-07',
    title: 'Le Relais Saint-Germain Bistro & Cellar Tasting',
    category: 'FOOD',
    price: 130,
    rating: 4.87,
    reviewCount: 98,
    location: 'Saint-Germain-des-Prés, Paris',
    country: 'France',
    coordinates: { lat: 48.8534, lng: 2.3338 },
    description: 'Celebrated neo-bistronomy dining by chef Yves Camdeborde offering seasonal game, artisanal charcuterie, butter-poached oysters, and rare natural biodynamic wines.',
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PENDING_APPROVAL',
    createdBy: 'user_admin_02',
    createdByName: 'Sarah Jenkins',
    tags: ['Bistronomy', 'Wine Cellar', 'Parisian', 'Culinary'],
    diningSpecialties: ['Duck Confit Parmentier', 'Escargots de Bourgogne', 'Grand Cru Wine Flight'],
    amenities: ['Outdoor Pavement Terrace', 'Historic Stone Cellar', 'Sommelier Guidance'],
    timestamps: {
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-tokyo-sushi-08',
    title: 'Ginza Hachiman Edomae Sushi & Chef Counter',
    category: 'FOOD',
    price: 210,
    rating: 4.98,
    reviewCount: 310,
    location: 'Ginza, Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6719, lng: 139.7640 },
    description: 'Legendary 18-piece omakase experience featuring wild bluefin tuna dry-aged over binchotan ice, sea urchin from Rishiri Island, and warm red vinegar seasoned sushi rice.',
    images: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_tech_admin_01',
    createdByName: 'Mukund Krishna',
    approvedBy: 'user_tech_admin_01',
    tags: ['Omakase', 'Sushi', 'Michelin Star', 'Ginza'],
    diningSpecialties: ['Otoro Nigiri Flamed', 'Uni Gunkan Triple Layer', 'Anago Sea Eel with Tare'],
    amenities: ['8-Seat Hinoki Counter', 'Sake Flight Pairings', 'Direct Chef Consultation'],
    timestamps: {
      createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    }
  },
  {
    id: 'list-hotel-como-09',
    title: 'Villa del Balbianello & Como Shoreline Sanctuary',
    category: 'HOTEL',
    price: 680,
    rating: 4.94,
    reviewCount: 165,
    location: 'Lenno, Lake Como',
    country: 'Italy',
    coordinates: { lat: 45.9658, lng: 9.2025 },
    description: 'Magnificent neo-classical villa overlooking Lake Como with terraced gardens, private wooden speedboat transfers, cypress-lined walks, and waterfront dining.',
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_tech_admin_01',
    createdByName: 'Mukund Krishna',
    approvedBy: 'user_tech_admin_01',
    tags: ['Luxury Villa', 'Lakefront', 'Private Boat', 'Historic Garden'],
    amenities: ['Private Boat Dock', 'Lakeview Infinity Spa', 'Helicopter Transfer', 'Personal Concierge'],
    hotelPerks: ['Daily Riva Boat Tour', 'Champagne Sunset Aperitivo', 'Complimentary Breakfast'],
    timestamps: {
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    }
  }
];

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

        // Ensure listings have coordinates
        const listings: Listing[] = (parsed.listings?.length ? parsed.listings : INITIAL_LISTINGS).map((item: Listing) => {
          if (!item.coordinates && DEFAULT_COORDS_MAP[item.id]) {
            return { ...item, coordinates: DEFAULT_COORDS_MAP[item.id] };
          }
          return item;
        });

        // Ensure newly added initial listings (like Tokyo and Como) exist if missing
        for (const initListing of INITIAL_LISTINGS) {
          if (!listings.some(l => l.id === initListing.id)) {
            listings.push(initListing);
          }
        }

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
    return updated;
  }

  deleteListing(id: string): boolean {
    const initialLen = this.data.listings.length;
    this.data.listings = this.data.listings.filter(l => l.id !== id);
    if (this.data.listings.length !== initialLen) {
      this.writeToDisk(this.data);
      return true;
    }
    return false;
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
    return post;
  }

  deleteCustomPost(id: string): boolean {
    if (!this.data.custom_posts) return false;
    const initialLen = this.data.custom_posts.length;
    this.data.custom_posts = this.data.custom_posts.filter(p => p.id !== id);
    if (this.data.custom_posts.length !== initialLen) {
      this.writeToDisk(this.data);
      return true;
    }
    return false;
  }
}

export const db = new Database();
