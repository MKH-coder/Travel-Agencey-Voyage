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
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#0284c7', '#7dd3fc'], // Radiant Ionian azure
    mountainColor: '#0f766e',
    groundColor: '#0d9488', // Emerald-turquoise sea
    distanceTarget: 2200,
    landmarkName: 'Ksamil 4 Isles & Ancient Butrint',
    landmarkSilhouette: 'castle',
    badgeText: '★ Featured Riviera Stage',
    description: 'Soar above pristine turquoise Ionian lagoons, white pebble beaches, and ancient citadel towers.',
    ambientEffect: 'sea_spray',
    redeemCode: 'ALBANIA-RIVIERA-PASS',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Ksamil & Riviera VIP Pass',
  },
  {
    id: 'lvl_albania_alps',
    name: 'Albanian Alps & Rozafa Citadel',
    destination: 'Theth & Shkodër',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#1e293b', '#64748b'], // Dramatic Balkan mountain twilight
    mountainColor: '#334155',
    groundColor: '#15803d', // Deep alpine valley
    distanceTarget: 2600,
    landmarkName: 'Rozafa Fortress & Valbona Peaks',
    landmarkSilhouette: 'alps',
    badgeText: 'Accursed Mountains',
    description: 'Navigate alpine passes of the Accursed Mountains and the legendary 2,400-year-old Rozafa Castle.',
    ambientEffect: 'sparkles',
    redeemCode: 'BALKAN-PEAK-20',
    redeemDiscount: '20% OFF',
    redeemOfferName: 'Accursed Mountains Expedition',
  },
  {
    id: 'lvl_albania_berat',
    name: 'Berat City of 1000 Windows',
    destination: 'Berat & Osum Canyon',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#3b82f6', '#93c5fd'],
    mountainColor: '#1e3a8a',
    groundColor: '#1e40af',
    distanceTarget: 2800,
    landmarkName: 'Kala Citadel & Ottoman Mansions',
    landmarkSilhouette: 'castle',
    badgeText: 'UNESCO Heritage Stage',
    description: 'Fly along the Osum River gorge past thousand-windowed white Ottoman mansions and living fortresses.',
    ambientEffect: 'sparkles',
    redeemCode: 'BERAT-CITADEL-15',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Berat UNESCO Cultural Stay',
  },
  {
    id: 'lvl_albania_gjirokaster',
    name: 'Gjirokastër Stone City & Blue Eye',
    destination: 'Gjirokastër & Syri i Kaltër',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#0f766e', '#5eead4'],
    mountainColor: '#134e4a',
    groundColor: '#047857',
    distanceTarget: 3000,
    landmarkName: 'Gjirokastër Fortress & Blue Eye Spring',
    landmarkSilhouette: 'cliffs',
    badgeText: 'Blue Eye Spring',
    description: 'Soar above steep cobblestone alleys, slate-roofed Ottoman stone houses, and the mystical turquoise Blue Eye spring.',
    ambientEffect: 'sea_spray',
    redeemCode: 'GJIROKASTER-STONE-18',
    redeemDiscount: '18% OFF',
    redeemOfferName: 'Gjirokastër & Blue Eye Luxury Pass',
  },
  {
    id: 'lvl_albania_tirana',
    name: 'Tirana Skanderbeg Square & Dajti',
    destination: 'Tirana & Mt Dajti',
    country: 'Albania',
    flag: '🇦🇱',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#854d0e', '#fef08a'],
    mountainColor: '#713f12',
    groundColor: '#ca8a04',
    distanceTarget: 3200,
    landmarkName: 'Skanderbeg Statue & Dajti Express',
    landmarkSilhouette: 'alps',
    badgeText: 'Capital City Stage',
    description: 'Glide above vibrant Skanderbeg Square, historic Et’hem Bey Mosque, and the scenic Mt Dajti Cableway.',
    ambientEffect: 'sparkles',
    redeemCode: 'TIRANA-CAPITAL-25',
    redeemDiscount: '25% OFF',
    redeemOfferName: 'Tirana Capital & Mount Dajti VIP Pass',
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
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'Located along the Ionian Sea, famous for crystal-clear turquoise waters and four uninhabited islands.',
      'Just a 30-minute ferry ride from Corfu, Greece, but offers unmatched affordable luxury.',
      'Nearby UNESCO World Heritage site Butrint preserves ancient Greek and Roman ruins.',
    ],
    correctAnswer: 'Ksamil, Albania',
    options: ['Ksamil, Albania', 'Zakynthos, Greece', 'Budva, Montenegro', 'Bodrum, Turkey'],
    funFact: 'Known as the "Maldives of Europe" for its blindingly white sands and shallow turquoise coves!',
    country: 'Albania',
    stampId: 'stamp_ksamil',
  },
  {
    id: 'q_berat',
    title: 'The City of a Thousand Windows',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'UNESCO-listed historic Ottoman town with tiered white houses lining the rocky gorge of the Osum river.',
      'Features a 13th-century living fortress citadel inhabited by locals to this day.',
      'Famous for its peaceful coexistence of historic Byzantine churches and Ottoman mosques.',
    ],
    correctAnswer: 'Berat, Albania',
    options: ['Berat, Albania', 'Mostar, Bosnia', 'Ohrid, North Macedonia', 'Plovdiv, Bulgaria'],
    funFact: 'In 2008, UNESCO designated Berat as an exceptional example of peaceful coexistence of diverse religions and Ottoman architectural harmony!',
    country: 'Albania',
    stampId: 'stamp_berat',
  },
  {
    id: 'q_gjirokaster',
    title: 'The City of Stone & Ottoman Towers',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'UNESCO World Heritage site known as the "City of Stone" for its slate-roofed Ottoman fortified mansions (Kulle).',
      'Crowned by a massive 12th-century hilltop castle overlooking the Drino River Valley.',
      'The birthplace of Albania’s world-famous Nobel nominee author Ismail Kadare.',
    ],
    correctAnswer: 'Gjirokastër, Albania',
    options: ['Gjirokastër, Albania', 'Dubrovnik, Croatia', 'Kotor, Montenegro', 'Meteora, Greece'],
    funFact: 'Gjirokastër’s ancient stone fortress contains an intact US Air Force jet captured during the Cold War era!',
    country: 'Albania',
    stampId: 'stamp_gjirokaster',
  },
  {
    id: 'q_blue_eye',
    title: 'Syri i Kaltër (The Mysterious Blue Eye)',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'A hypnotic underwater natural karst spring bubbling up from over 50 meters depth.',
      'Features vibrant sapphire blue and turquoise water resembling a human eye pupil.',
      'Surrounded by lush oak and sycamore forests near the Saranda-Delvina highway in Southern Albania.',
    ],
    correctAnswer: 'Blue Eye (Syri i Kaltër), Albania',
    options: ['Blue Eye (Syri i Kaltër), Albania', 'Plitvice Lakes, Croatia', 'Bled Lake, Slovenia', 'Pamukkale, Turkey'],
    funFact: 'Divers have descended to 50 meters into the dark underwater cave, but no one knows the true depth of the spring because water pressure pushes divers back up!',
    country: 'Albania',
    stampId: 'stamp_blue_eye',
  },
  {
    id: 'q_theth',
    title: 'The Accursed Mountains & Isolation Tower',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'Secluded alpine village in the heart of the Albanian Alps (Accursed Mountains National Park).',
      'Home to the historic "Kulla e Ngujimit" (Lock-in Tower) used in ancient Kanun blood feud reconciliation.',
      'Famous for the crystal-clear Blue Eye of Theth and Grunas Waterfall.',
    ],
    correctAnswer: 'Theth & Valbona Valley, Albania',
    options: ['Theth & Valbona Valley, Albania', 'Cortina d’Ampezzo, Italy', 'Chamonix, France', 'Interlaken, Switzerland'],
    funFact: 'The mountain pass trail between Theth and Valbona is one of Europe’s premier bucket-list wilderness hikes!',
    country: 'Albania',
    stampId: 'stamp_theth',
  },
  {
    id: 'q_tirana',
    title: 'Skanderbeg Square & Vibrant Bunkers',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'The bustling capital city known for pastel-painted communist architecture and lively cafe culture.',
      'Central square spans 40,000 square meters featuring an equestrian statue of national hero Gjergj Kastrioti.',
      'Includes Bunk’Art 1 & 2, underground Cold War atomic shelters transformed into contemporary art museums.',
    ],
    correctAnswer: 'Tirana, Albania',
    options: ['Tirana, Albania', 'Pristina, Kosovo', 'Skopje, North Macedonia', 'Sofia, Bulgaria'],
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
];
