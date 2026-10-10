export type GameDifficulty = 'easy' | 'hard' | 'extreme';

export interface DifficultyReward {
  code: string;
  discount: string;
  discountPercent: number;
  offerName: string;
  description: string;
}

export interface DifficultyConfig {
  id: GameDifficulty;
  name: string;
  badge: string;
  tagline: string;
  color: string;
  accentHex: string;
  scoreMultiplier: number;
  speedMultiplier: number;
  hazardFrequencyMultiplier: number;
  fuelDrainMultiplier: number;
  description: string;
}

export const GAME_DIFFICULTIES: Record<GameDifficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Scenic Explorer',
    badge: 'Relaxed Mode (1.0x Pts)',
    tagline: 'Scenic Flight & Calm Cruise',
    color: 'emerald',
    accentHex: '#10b981',
    scoreMultiplier: 1.0,
    speedMultiplier: 1.0,
    hazardFrequencyMultiplier: 1.0,
    fuelDrainMultiplier: 1.0,
    description: 'Gentle tailwinds, steady traffic, and generous fuel pickups. Ideal for soaking in panoramic Balkan vistas.',
  },
  hard: {
    id: 'hard',
    name: 'Balkan Storm',
    badge: 'Challenging (1.8x Pts)',
    tagline: 'High Turbulence & Agility',
    color: 'amber',
    accentHex: '#f59e0b',
    scoreMultiplier: 1.8,
    speedMultiplier: 1.45,
    hazardFrequencyMultiplier: 1.6,
    fuelDrainMultiplier: 1.5,
    description: 'Gusting crosswinds, aggressive mountain drivers, and tight reaction windows. Fuel drains quickly!',
  },
  extreme: {
    id: 'extreme',
    name: 'Nightmare Grand Prix',
    badge: 'Brutal (2.5x Pts)',
    tagline: 'Hypersonic Survival & Chaos',
    color: 'rose',
    accentHex: '#f43f5e',
    scoreMultiplier: 2.5,
    speedMultiplier: 1.95,
    hazardFrequencyMultiplier: 2.4,
    fuelDrainMultiplier: 2.1,
    description: 'Hypersonic speeds, zigzagging lightning bolts, oncoming racers, razor-thin gaps, and perilous fuel limits. Only master globetrotters survive!',
  },
};

export interface FlightLevel {
  id: string;
  name: string;
  destination: string;
  country: string;
  flag: string;
  image: string;
  skyGradient: [string, string];
  mountainColor: string;
  groundColor: string;
  distanceTarget: number; // in meters
  landmarkName: string;
  landmarkSilhouette: 'castle' | 'cliffs' | 'fuji' | 'eiffel' | 'pyramids' | 'alps';
  description: string;
  badgeText?: string;
  ambientEffect: 'sparkles' | 'sea_spray' | 'sakura' | 'stars' | 'sand';
  difficultyRewards: Record<GameDifficulty, DifficultyReward>;
  redeemCode: string;
  redeemDiscount: string;
  redeemOfferName: string;
}

export const FLIGHT_LEVELS: FlightLevel[] = [
  {
    id: 'lvl_albania_riviera',
    name: 'Albanian Riviera & Ksamil Isles',
    destination: 'Ksamil & Saranda',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Ksamill-1.jpg',
    skyGradient: ['#0284c7', '#7dd3fc'], // Radiant Ionian azure
    mountainColor: '#0f766e',
    groundColor: '#0d9488', // Emerald-turquoise sea
    distanceTarget: 2200,
    landmarkName: 'Ksamil 4 Isles & Ancient Butrint',
    landmarkSilhouette: 'castle',
    badgeText: '★ Featured Riviera Stage',
    description: 'Soar above pristine turquoise Ionian lagoons, white pebble beaches, and ancient citadel towers.',
    ambientEffect: 'sea_spray',
    difficultyRewards: {
      easy: {
        code: 'KSAMIL-CRUISE-12',
        discount: '12% OFF',
        discountPercent: 12,
        offerName: 'Ksamil Scenic Explorer Pass',
        description: '12% OFF Ksamil Isles & Saranda Boutique Stays',
      },
      hard: {
        code: 'KSAMIL-STORM-20',
        discount: '20% OFF',
        discountPercent: 20,
        offerName: 'Ksamil Balkan Storm Pass',
        description: '20% OFF Ksamil Turquoise Isles & Beachfront Suites',
      },
      extreme: {
        code: 'KSAMIL-APEX-30',
        discount: '30% OFF',
        discountPercent: 30,
        offerName: 'Ksamil Nightmare Apex VIP Pass',
        description: '30% OFF Exclusive Riviera Ultra Luxury Pass',
      },
    },
    redeemCode: 'KSAMIL-CRUISE-12',
    redeemDiscount: '12% OFF',
    redeemOfferName: 'Ksamil Scenic Explorer Pass',
  },
  {
    id: 'lvl_albania_alps',
    name: 'Albanian Alps & Rozafa Citadel',
    destination: 'Theth & Shkodër',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Theth_Church.jpg',
    skyGradient: ['#1e293b', '#64748b'], // Dramatic Balkan mountain twilight
    mountainColor: '#334155',
    groundColor: '#15803d', // Deep alpine valley
    distanceTarget: 2600,
    landmarkName: 'Rozafa Fortress & Valbona Peaks',
    landmarkSilhouette: 'alps',
    badgeText: 'Accursed Mountains',
    description: 'Navigate alpine passes of the Accursed Mountains and the legendary 2,400-year-old Rozafa Castle.',
    ambientEffect: 'sparkles',
    difficultyRewards: {
      easy: {
        code: 'ALPS-EXPLORER-12',
        discount: '12% OFF',
        discountPercent: 12,
        offerName: 'Albanian Alps Scenic Explorer Pass',
        description: '12% OFF Theth & Valbona Valley Lodges',
      },
      hard: {
        code: 'BALKAN-PEAK-20',
        discount: '20% OFF',
        discountPercent: 20,
        offerName: 'Theth & Valbona Alpine Expeditions',
        description: '20% OFF Accursed Mountains Guided Trekking',
      },
      extreme: {
        code: 'ACCURSED-TITAN-30',
        discount: '30% OFF',
        discountPercent: 30,
        offerName: 'Accursed Mountains Nightmare Titan Pass',
        description: '30% OFF Ultimate Albanian Alps Wilderness VIP Expedition',
      },
    },
    redeemCode: 'ALPS-EXPLORER-12',
    redeemDiscount: '12% OFF',
    redeemOfferName: 'Albanian Alps Scenic Explorer Pass',
  },
  {
    id: 'lvl_albania_berat',
    name: 'Berat City of 1000 Windows',
    destination: 'Berat & Osum Canyon',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Berat_UNESCO_2016_Albania.jpg/1280px-Berat_UNESCO_2016_Albania.jpg',
    skyGradient: ['#3b82f6', '#93c5fd'],
    mountainColor: '#1e3a8a',
    groundColor: '#1e40af',
    distanceTarget: 2800,
    landmarkName: 'Kala Citadel & Ottoman Mansions',
    landmarkSilhouette: 'castle',
    badgeText: 'UNESCO Heritage Stage',
    description: 'Fly along the Osum River gorge past thousand-windowed white Ottoman mansions and living fortresses.',
    ambientEffect: 'sparkles',
    difficultyRewards: {
      easy: {
        code: 'BERAT-TRAIL-12',
        discount: '12% OFF',
        discountPercent: 12,
        offerName: 'Berat Scenic Explorer Trail Pass',
        description: '12% OFF Berat Historic Ottoman Boutique Stays',
      },
      hard: {
        code: 'BERAT-CITADEL-20',
        discount: '20% OFF',
        discountPercent: 20,
        offerName: 'Berat Citadel Storm Master Pass',
        description: '20% OFF Berat City of 1,000 Windows Stays & Wine Tours',
      },
      extreme: {
        code: 'BERAT-LEGEND-30',
        discount: '30% OFF',
        discountPercent: 30,
        offerName: 'Berat 1,000 Windows Nightmare Legend Pass',
        description: '30% OFF UNESCO Heritage All-Inclusive Historic Experience',
      },
    },
    redeemCode: 'BERAT-TRAIL-12',
    redeemDiscount: '12% OFF',
    redeemOfferName: 'Berat Scenic Explorer Trail Pass',
  },
  {
    id: 'lvl_albania_gjirokaster',
    name: 'Gjirokastër Stone City & Blue Eye',
    destination: 'Gjirokastër & Syri i Kaltër',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Gjirokast%C3%ABr_Castle_view.jpg',
    skyGradient: ['#0f766e', '#5eead4'],
    mountainColor: '#134e4a',
    groundColor: '#047857',
    distanceTarget: 3000,
    landmarkName: 'Gjirokastër Fortress & Blue Eye Spring',
    landmarkSilhouette: 'cliffs',
    badgeText: 'Blue Eye Spring',
    description: 'Soar above steep cobblestone alleys, slate-roofed Ottoman stone houses, and the mystical turquoise Blue Eye spring.',
    ambientEffect: 'sea_spray',
    difficultyRewards: {
      easy: {
        code: 'GJIROKASTER-CRUISE-15',
        discount: '15% OFF',
        discountPercent: 15,
        offerName: 'Gjirokastër Scenic Explorer Pass',
        description: '15% OFF Stone City Heritage Fortified Mansions',
      },
      hard: {
        code: 'BLUE-EYE-SPEED-22',
        discount: '22% OFF',
        discountPercent: 22,
        offerName: 'Syri i Kaltër Balkan Storm Pass',
        description: '22% OFF Gjirokastër & Blue Eye Luxury Pass',
      },
      extreme: {
        code: 'STONE-FORTRESS-32',
        discount: '32% OFF',
        discountPercent: 32,
        offerName: 'Stone Fortress Nightmare VIP Pass',
        description: '32% OFF Southern Albania UNESCO Grand Expedition',
      },
    },
    redeemCode: 'GJIROKASTER-CRUISE-15',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Gjirokastër Scenic Explorer Pass',
  },
  {
    id: 'lvl_albania_tirana',
    name: 'Tirana Skanderbeg Square & Dajti',
    destination: 'Tirana & Mt Dajti',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Skanderbeg_square_tirana_2016.jpg/1280px-Skanderbeg_square_tirana_2016.jpg',
    skyGradient: ['#854d0e', '#fef08a'],
    mountainColor: '#713f12',
    groundColor: '#ca8a04',
    distanceTarget: 3200,
    landmarkName: 'Skanderbeg Statue & Dajti Express',
    landmarkSilhouette: 'alps',
    badgeText: 'Capital City Stage',
    description: 'Glide above vibrant Skanderbeg Square, historic Et’hem Bey Mosque, and the scenic Mt Dajti Cableway.',
    ambientEffect: 'sparkles',
    difficultyRewards: {
      easy: {
        code: 'TIRANA-DISCOVERY-15',
        discount: '15% OFF',
        discountPercent: 15,
        offerName: 'Tirana Discovery Explorer Pass',
        description: '15% OFF Capital City Design Hotels & Museums',
      },
      hard: {
        code: 'TIRANA-CAPITAL-25',
        discount: '25% OFF',
        discountPercent: 25,
        offerName: 'Tirana Balkan Storm Capital VIP',
        description: '25% OFF Tirana Capital & Mount Dajti VIP Pass',
      },
      extreme: {
        code: 'SKANDERBEG-GODMODE-35',
        discount: '35% OFF',
        discountPercent: 35,
        offerName: 'Skanderbeg Nightmare Godmode Supreme VIP',
        description: '35% OFF Ultra Elite Grand Tour Albania Master Voucher',
      },
    },
    redeemCode: 'TIRANA-DISCOVERY-15',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Tirana Discovery Explorer Pass',
  },
];

export interface GeoTriviaQuestion {
  id: string;
  title: string;
  image: string;
  clues: [string, string, string];
  correctAnswer: string;
  options: string[];
  funFact: string;
  country: string;
  stampId: string;
}

export const GEO_TRIVIA_QUESTIONS: GeoTriviaQuestion[] = [
  {
    id: 'q_ksamil',
    title: 'The Pearl of the Balkan Riviera',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Ksamill-1.jpg',
    clues: [
      'Located along the Ionian Sea, famous for crystal-clear turquoise waters and four uninhabited islands.',
      'Overlooking the tranquil Ionian strait, offering unmatched affordable luxury and island hopping.',
      'Nearby UNESCO World Heritage site Butrint preserves ancient Greek and Roman ruins.',
    ],
    correctAnswer: 'Ksamil, Albania',
    options: ['Ksamil, Albania', 'Dhërmi, Albania', 'Vlorë, Albania', 'Himarë, Albania'],
    funFact: 'Known as the "Maldives of Europe" for its blindingly white sands and shallow turquoise coves!',
    country: 'Albania',
    stampId: 'stamp_ksamil',
  },
  {
    id: 'q_berat',
    title: 'The City of a Thousand Windows',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Berat_UNESCO_2016_Albania.jpg/1280px-Berat_UNESCO_2016_Albania.jpg',
    clues: [
      'UNESCO-listed historic Ottoman town with tiered white houses lining the rocky gorge of the Osum river.',
      'Features a 13th-century living fortress citadel inhabited by locals to this day.',
      'Famous for its peaceful coexistence of historic Byzantine churches and Ottoman mosques.',
    ],
    correctAnswer: 'Berat, Albania',
    options: ['Berat, Albania', 'Gjirokastër, Albania', 'Krujë, Albania', 'Shkodër, Albania'],
    funFact: 'In 2008, UNESCO designated Berat as an exceptional example of peaceful coexistence of diverse religions and Ottoman architectural harmony!',
    country: 'Albania',
    stampId: 'stamp_berat',
  },
  {
    id: 'q_gjirokaster',
    title: 'The City of Stone & Ottoman Towers',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Gjirokast%C3%ABr_Castle_view.jpg',
    clues: [
      'UNESCO World Heritage site known as the "City of Stone" for its slate-roofed Ottoman fortified mansions (Kulle).',
      'Crowned by a massive 12th-century hilltop castle overlooking the Drino River Valley.',
      'The birthplace of Albania’s world-famous Nobel nominee author Ismail Kadare.',
    ],
    correctAnswer: 'Gjirokastër, Albania',
    options: ['Gjirokastër, Albania', 'Berat, Albania', 'Tirana, Albania', 'Korçë, Albania'],
    funFact: 'Gjirokastër’s ancient stone fortress contains an intact US Air Force jet captured during the Cold War era!',
    country: 'Albania',
    stampId: 'stamp_gjirokaster',
  },
  {
    id: 'q_blue_eye',
    title: 'Syri i Kaltër (The Mysterious Blue Eye)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Blue_Eye_Albania_2019.jpg',
    clues: [
      'A hypnotic underwater natural karst spring bubbling up from over 50 meters depth.',
      'Features vibrant sapphire blue and turquoise water resembling a human eye pupil.',
      'Surrounded by lush oak and sycamore forests near the Saranda-Delvina highway in Southern Albania.',
    ],
    correctAnswer: 'Blue Eye (Syri i Kaltër), Albania',
    options: ['Blue Eye (Syri i Kaltër), Albania', 'Lake Ohrid, Albania', 'Bovilla Lake, Albania', 'Shkodra Lake, Albania'],
    funFact: 'Divers have descended to 50 meters into the dark underwater cave, but no one knows the true depth of the spring because water pressure pushes divers back up!',
    country: 'Albania',
    stampId: 'stamp_blue_eye',
  },
  {
    id: 'q_theth',
    title: 'The Accursed Mountains & Isolation Tower',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Theth_Church.jpg',
    clues: [
      'Secluded alpine village in the heart of the Albanian Alps (Accursed Mountains National Park).',
      'Home to the historic "Kulla e Ngujimit" (Lock-in Tower) used in ancient Kanun blood feud reconciliation.',
      'Famous for the crystal-clear Blue Eye of Theth and Grunas Waterfall.',
    ],
    correctAnswer: 'Theth & Valbona Valley, Albania',
    options: ['Theth & Valbona Valley, Albania', 'Mount Dajti, Albania', 'Llogara Pass, Albania', 'Tomorr Mountain, Albania'],
    funFact: 'The mountain pass trail between Theth and Valbona is one of Europe’s premier bucket-list wilderness hikes!',
    country: 'Albania',
    stampId: 'stamp_theth',
  },
  {
    id: 'q_tirana',
    title: 'Skanderbeg Square & Vibrant Bunkers',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Skanderbeg_square_tirana_2016.jpg/1280px-Skanderbeg_square_tirana_2016.jpg',
    clues: [
      'The bustling capital city known for pastel-painted communist architecture and lively cafe culture.',
      'Central square spans 40,000 square meters featuring an equestrian statue of national hero Gjergj Kastrioti.',
      'Includes Bunk’Art 1 & 2, underground Cold War atomic shelters transformed into contemporary art museums.',
    ],
    correctAnswer: 'Tirana, Albania',
    options: ['Tirana, Albania', 'Durrës, Albania', 'Vlorë, Albania', 'Elbasan, Albania'],
    funFact: 'Tirana has over 170,000 historic Cold War dome bunkers built across Albania, now converted into cafes, art galleries, and beach bars!',
    country: 'Albania',
    stampId: 'stamp_tirana',
  },
];

export interface PassportStamp {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  iconName: string;
  color: string;
  unlockedAt?: string;
}

export const ALL_PASSPORT_STAMPS: PassportStamp[] = [
  { id: 'stamp_ksamil', name: 'Riviera Explorer', city: 'Ksamil', country: 'Albania', flag: '🇦🇱', iconName: 'Anchor', color: '#0d9488' },
  { id: 'stamp_berat', name: 'Citadel Scout', city: 'Berat', country: 'Albania', flag: '🇦🇱', iconName: 'Castle', color: '#b45309' },
  { id: 'stamp_gjirokaster', name: 'Stone City Navigator', city: 'Gjirokastër', country: 'Albania', flag: '🇦🇱', iconName: 'Landmark', color: '#6366f1' },
  { id: 'stamp_blue_eye', name: 'Syri i Kaltër Explorer', city: 'Saranda', country: 'Albania', flag: '🇦🇱', iconName: 'Compass', color: '#0284c7' },
  { id: 'stamp_tirana', name: 'Skanderbeg Jetsetter', city: 'Tirana', country: 'Albania', flag: '🇦🇱', iconName: 'Crown', color: '#dc2626' },
  { id: 'stamp_theth', name: 'Accursed Alps Ranger', city: 'Theth', country: 'Albania', flag: '🇦🇱', iconName: 'Mountain', color: '#16a34a' },
];

export interface PromoCouponReward {
  code: string;
  discount: string;
  requirement: string;
  minScore: number;
  description: string;
}

export const REWARD_PROMOS: PromoCouponReward[] = [
  {
    code: 'VOYAGE10',
    discount: '10% OFF',
    requirement: 'Score 500+ in Flight or Trivia',
    minScore: 500,
    description: 'Valid for 10% off any luxury hotel booking or guided tour package on Voyage.',
  },
  {
    code: 'ALBANIA15',
    discount: '15% OFF',
    requirement: 'Complete Albania Stage or solve Geo Detective',
    minScore: 1200,
    description: 'Exclusive 15% discount for any Riviera or Balkan cultural expedition.',
  },
  {
    code: 'SKYMASTER20',
    discount: '20% OFF',
    requirement: 'Score 2,500+ or collect 5 Passport Stamps',
    minScore: 2500,
    description: 'Premier VIP promo voucher for customized private luxury itineraries.',
  },
  {
    code: 'SKANDERBEG-GODMODE-35',
    discount: '35% OFF',
    requirement: 'Beat Nightmare Grand Prix Mode',
    minScore: 4000,
    description: 'Elite 35% discount voucher for completing Extreme Nightmare difficulty mode!',
  },
];

export interface RallyStage {
  id: string;
  name: string;
  destination: string;
  country: string;
  flag: string;
  image: string;
  roadColor: string;
  curbColor: string;
  skyGradient: [string, string];
  sceneryType: 'coastal' | 'mountain_pass' | 'canyon' | 'city_strip';
  distanceTarget: number; // in meters
  landmarkName: string;
  description: string;
  badgeText: string;
  stampId: string;
  difficultyRewards: Record<GameDifficulty, DifficultyReward>;
  redeemCode: string;
  redeemDiscount: string;
  redeemOfferName: string;
}

export const RALLY_STAGES: RallyStage[] = [
  {
    id: 'rally_ksamil_strip',
    name: 'Ksamil Coastal Palm Highway',
    destination: 'Ksamil & Butrint Coast',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Ksamill-1.jpg',
    roadColor: '#334155',
    curbColor: '#38bdf8',
    skyGradient: ['#0284c7', '#38bdf8'],
    sceneryType: 'coastal',
    distanceTarget: 2200,
    landmarkName: 'Ksamil 4 Isles & Ionian Promenade',
    description: 'Drift past seaside cafes, palm boulevards, and turquoise sea lagoons along the Mediterranean Riviera.',
    badgeText: '★ Featured Riviera Strip',
    stampId: 'stamp_ksamil',
    difficultyRewards: {
      easy: {
        code: 'RALLY-KSAMIL-12',
        discount: '12% OFF',
        discountPercent: 12,
        offerName: 'Ksamil Coastal Rally Explorer Pass',
        description: '12% OFF Ksamil Coastal Roadtrip & Beachfront Suites',
      },
      hard: {
        code: 'RIVIERA-DRIFT-20',
        discount: '20% OFF',
        discountPercent: 20,
        offerName: 'Riviera Drift Storm Champion Pass',
        description: '20% OFF Riviera Coastal Drift & Luxury Cabanas',
      },
      extreme: {
        code: 'IONIAN-TURBO-30',
        discount: '30% OFF',
        discountPercent: 30,
        offerName: 'Ionian Nightmare Turbo Master Pass',
        description: '30% OFF High-Speed Ionian Supercar & Yacht Charter Pass',
      },
    },
    redeemCode: 'RALLY-KSAMIL-12',
    redeemDiscount: '12% OFF',
    redeemOfferName: 'Ksamil Coastal Rally Explorer Pass',
  },
  {
    id: 'rally_llogara_pass',
    name: 'Llogara Alpine Hairpin Pass',
    destination: 'Llogara National Park',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Llogara_Pass_view.jpg',
    roadColor: '#1e293b',
    curbColor: '#f59e0b',
    skyGradient: ['#1e1b4b', '#4338ca'],
    sceneryType: 'mountain_pass',
    distanceTarget: 2600,
    landmarkName: 'Llogara 1,043m Sea-Cliffs & Pine Forests',
    description: 'Navigate thrilling high-altitude S-curves perched over 1,000 meters above the shimmering Ionian Sea.',
    badgeText: 'Alpine Hairpin Rally',
    stampId: 'stamp_theth',
    difficultyRewards: {
      easy: {
        code: 'LLOGARA-CRUISE-15',
        discount: '15% OFF',
        discountPercent: 15,
        offerName: 'Llogara Pass Scenic Explorer Pass',
        description: '15% OFF Llogara Clifftop Boutique Mountain Chalets',
      },
      hard: {
        code: 'LLOGARA-PASS-22',
        discount: '22% OFF',
        discountPercent: 22,
        offerName: 'Llogara Hairpin Storm Racer Pass',
        description: '22% OFF Llogara Mountain Safari Pass',
      },
      extreme: {
        code: 'LLOGARA-NIGHTMARE-32',
        discount: '32% OFF',
        discountPercent: 32,
        offerName: 'Llogara 1,043m Nightmare Grand Prix Pass',
        description: '32% OFF Riviera Clifftop Alpine Luxury Suite Pass',
      },
    },
    redeemCode: 'LLOGARA-CRUISE-15',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Llogara Pass Scenic Explorer Pass',
  },
  {
    id: 'rally_berat_gorge',
    name: 'Berat Citadel & Osum Valley Drive',
    destination: 'Berat & Osum Canyon',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Berat_UNESCO_2016_Albania.jpg/1280px-Berat_UNESCO_2016_Albania.jpg',
    roadColor: '#374151',
    curbColor: '#10b981',
    skyGradient: ['#047857', '#34d399'],
    sceneryType: 'canyon',
    distanceTarget: 2800,
    landmarkName: 'Gorica Stone Bridge & Ottoman Citadel',
    description: 'Cruise along the canyon roads flanking the city of a thousand windows and ancient living fortresses.',
    badgeText: 'UNESCO Heritage Roadtrip',
    stampId: 'stamp_berat',
    difficultyRewards: {
      easy: {
        code: 'BERAT-RALLY-15',
        discount: '15% OFF',
        discountPercent: 15,
        offerName: 'Berat Osum Valley Scenic Rally Pass',
        description: '15% OFF Berat Cultural Roadtrip & Ottoman Villas',
      },
      hard: {
        code: 'BERAT-DRIFT-22',
        discount: '22% OFF',
        discountPercent: 22,
        offerName: 'Berat Canyon Drift Storm Pass',
        description: '22% OFF Osum River Canyon Tour & Wine Tastings',
      },
      extreme: {
        code: 'CITADEL-CHAMPION-30',
        discount: '30% OFF',
        discountPercent: 30,
        offerName: 'Berat Citadel Nightmare Champion Pass',
        description: '30% OFF UNESCO Heritage Private Castle Escapes',
      },
    },
    redeemCode: 'BERAT-RALLY-15',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Berat Osum Valley Scenic Rally Pass',
  },
  {
    id: 'rally_blue_eye_highway',
    name: 'Saranda to Blue Eye Spring Highway',
    destination: 'Saranda & Syri i Kaltër',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Blue_Eye_Albania_2019.jpg',
    roadColor: '#1f2937',
    curbColor: '#06b6d4',
    skyGradient: ['#0e7490', '#67e8f9'],
    sceneryType: 'coastal',
    distanceTarget: 3000,
    landmarkName: 'Muzinë Pass & Mystical Blue Eye Spring',
    description: 'Speed through scenic mountain tunnels and olive groves toward the legendary sapphire spring.',
    badgeText: 'Blue Eye Spring Expressway',
    stampId: 'stamp_blue_eye',
    difficultyRewards: {
      easy: {
        code: 'SARANDA-SPEED-18',
        discount: '18% OFF',
        discountPercent: 18,
        offerName: 'Saranda Coastal Highway Explorer Pass',
        description: '18% OFF Saranda Bay Sea-View Apartments',
      },
      hard: {
        code: 'BLUE-EYE-HARD-25',
        discount: '25% OFF',
        discountPercent: 25,
        offerName: 'Blue Eye Expressway Storm Pass',
        description: '25% OFF Syri i Kaltër & Saranda Luxury Expeditions',
      },
      extreme: {
        code: 'BALKAN-GRANDPRIX-35',
        discount: '35% OFF',
        discountPercent: 35,
        offerName: 'Balkan Grand Prix Nightmare Apex Master Pass',
        description: '35% OFF Grand Balkan Coastal Circuit All-Inclusive VIP',
      },
    },
    redeemCode: 'SARANDA-SPEED-18',
    redeemDiscount: '18% OFF',
    redeemOfferName: 'Saranda Coastal Highway Explorer Pass',
  },
];
