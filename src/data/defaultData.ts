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
  }
];

export const DEFAULT_LISTINGS: Listing[] = [
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

export const DEFAULT_REVIEWS: Review[] = [
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
