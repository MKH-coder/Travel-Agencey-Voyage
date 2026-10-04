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
    badgeText: '★ Featured Stage',
    description: 'Soar above pristine turquoise Ionian lagoons, white pebble beaches, and ancient citadel towers.',
    ambientEffect: 'sea_spray',
    redeemCode: 'ALBANIA-RIVIERA-PASS',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Ksamil & Riviera VIP Pass',
  },
  {
    id: 'lvl_amalfi',
    name: 'Amalfi Coast Golden Coastline',
    destination: 'Amalfi & Positano',
    country: 'Italy',
    flag: '🇮🇹',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#38bdf8', '#bae6fd'],
    mountainColor: '#1e3a8a',
    groundColor: '#0284c7',
    distanceTarget: 2500,
    landmarkName: 'Positano Cliffside Terraces',
    landmarkSilhouette: 'cliffs',
    description: 'Fly along the dramatic cliffside roads of the Amalfi Coast over sparkling Tyrrhenian waters.',
    ambientEffect: 'sparkles',
    redeemCode: 'AMALFI-VIP-PILOT',
    redeemDiscount: '12% OFF',
    redeemOfferName: 'Amalfi Coastline Luxury Stay',
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
    distanceTarget: 2800,
    landmarkName: 'Rozafa Fortress & Valbona Peaks',
    landmarkSilhouette: 'alps',
    badgeText: 'Balkan Adventure',
    description: 'Navigate alpine passes of the Accursed Mountains and the legendary 2,400-year-old Rozafa Castle.',
    ambientEffect: 'sparkles',
    redeemCode: 'BALKAN-PEAK-20',
    redeemDiscount: '20% OFF',
    redeemOfferName: 'Accursed Mountains Expedition',
  },
  {
    id: 'lvl_tokyo',
    name: 'Mount Fuji Twilight & Blossom',
    destination: 'Tokyo & Hakone',
    country: 'Japan',
    flag: '🇯🇵',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#e11d48', '#fecdd3'], // Rose twilight
    mountainColor: '#4c0519',
    groundColor: '#881337',
    distanceTarget: 3000,
    landmarkName: 'Mount Fuji & Chureito Pagoda',
    landmarkSilhouette: 'fuji',
    description: 'Cruise past the majestic snow-capped peak of Mount Fuji with drifting Sakura blossoms.',
    ambientEffect: 'sakura',
    redeemCode: 'TOKYO-SKIES-15',
    redeemDiscount: '15% OFF',
    redeemOfferName: 'Mount Fuji & Hakone Getaway',
  },
  {
    id: 'lvl_paris',
    name: 'Parisian Starlight Flight',
    destination: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#312e81', '#a5b4fc'], // Twilight indigo
    mountainColor: '#1e1b4b',
    groundColor: '#0f172a',
    distanceTarget: 3400,
    landmarkName: 'Eiffel Tower & Seine River',
    landmarkSilhouette: 'eiffel',
    description: 'Navigate over the City of Light as twilight gives way to glowing evening monuments.',
    ambientEffect: 'stars',
    redeemCode: 'PARIS-STARLIGHT-10',
    redeemDiscount: '10% OFF',
    redeemOfferName: 'Parisian Starlight Stay',
  },
  {
    id: 'lvl_cairo',
    name: 'Sands of the Pharaohs',
    destination: 'Giza & Cairo',
    country: 'Egypt',
    flag: '🇪🇬',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
    skyGradient: ['#c2410c', '#fed7aa'], // Golden desert sunset
    mountainColor: '#78350f',
    groundColor: '#b45309',
    distanceTarget: 3800,
    landmarkName: 'Great Pyramids of Giza & Sphinx',
    landmarkSilhouette: 'pyramids',
    description: 'Glide over eternal desert dunes and ancient wonders under a scorching golden sunset.',
    ambientEffect: 'sand',
    redeemCode: 'PHARAOH-DUNE-18',
    redeemDiscount: '18% OFF',
    redeemOfferName: 'Giza Pyramids & Nile Luxury Tour',
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
    id: 'q_amalfi',
    title: 'Cliffside Coastal Gem',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'Famous for pastel houses stacked steeply along Mediterranean seaside cliffs.',
      'World-renowned for fragrant sfogliatella pastries and fragrant Sorrento lemons.',
      'Its scenic coastal drive has more than 1,000 hairpin curves overlooking the Tyrrhenian Sea.',
    ],
    correctAnswer: 'Amalfi Coast, Italy',
    options: ['Amalfi Coast, Italy', 'Dubrovnik, Croatia', 'Santorini, Greece', 'Monaco'],
    funFact: 'Lemons grown here are twice the size of regular lemons and are used to brew authentic Limoncello liqueur!',
    country: 'Italy',
    stampId: 'stamp_amalfi',
  },
  {
    id: 'q_ksamil',
    title: 'The Pearl of the Balkans',
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
    id: 'q_kyoto',
    title: 'Ancient Thousand Torii Gates',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'Home to over 1,600 Buddhist temples and 400 Shinto shrines in the Kansai region.',
      'Famed for walking paths lined by over 10,000 bright vermilion Torii gates climbing Mount Inari.',
      'The historic cultural capital where traditional Geisha culture in Gion is still preserved.',
    ],
    correctAnswer: 'Kyoto, Japan',
    options: ['Kyoto, Japan', 'Seoul, South Korea', 'Taipei, Taiwan', 'Hangzhou, China'],
    funFact: 'Kyoto was originally chosen as an atomic bomb target in WWII, but the US Secretary of War removed it because he had spent his honeymoon there and admired its cultural treasures!',
    country: 'Japan',
    stampId: 'stamp_kyoto',
  },
  {
    id: 'q_matterhorn',
    title: 'Pyramid of Ice and Granite',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'Iconic four-sided nearly symmetrical mountain peak towering at 4,478 meters.',
      'The mountain village at its base has banned combustion-engine cars since 1961.',
      'Its distinctive shape inspired the world-famous triangular Toblerone chocolate bar.',
    ],
    correctAnswer: 'Zermatt (Matterhorn), Switzerland',
    options: ['Zermatt (Matterhorn), Switzerland', 'Chamonix, France', 'Innsbruck, Austria', 'Aspen, USA'],
    funFact: 'The Matterhorn was the last major Alpine peak to be climbed, only conquered in July 1865 in a dramatic race between rival mountaineers!',
    country: 'Switzerland',
    stampId: 'stamp_matterhorn',
  },
  {
    id: 'q_santorini',
    title: 'The Sunken Caldera',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80',
    clues: [
      'Formed by one of the largest volcanic eruptions in human history around 1600 BC.',
      'Renowned for whitewashed cycladic houses clinging to steep volcanic cliffs above a flooded caldera.',
      'The village of Oia at its northern tip attracts thousands daily to witness sunset over the Aegean Sea.',
    ],
    correctAnswer: 'Santorini, Greece',
    options: ['Santorini, Greece', 'Mykonos, Greece', 'Capri, Italy', 'Ibiza, Spain'],
    funFact: 'Due to scarcity of rain, vines in Santorini are pruned into tight woven "baskets" low to the ground to trap morning sea fog!',
    country: 'Greece',
    stampId: 'stamp_santorini',
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
  { id: 'stamp_amalfi', name: 'Amalfi Aviator', city: 'Amalfi', country: 'Italy', flag: '🇮🇹', iconName: 'Compass', color: '#0284c7' },
  { id: 'stamp_tokyo', name: 'Sunrise Pilot', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', iconName: 'Sun', color: '#e11d48' },
  { id: 'stamp_ksamil', name: 'Riviera Explorer', city: 'Ksamil', country: 'Albania', flag: '🇦🇱', iconName: 'Anchor', color: '#0d9488' },
  { id: 'stamp_matterhorn', name: 'Alpine Navigator', city: 'Zermatt', country: 'Switzerland', flag: '🇨🇭', iconName: 'Mountain', color: '#dc2626' },
  { id: 'stamp_paris', name: 'Twilight Jetsetter', city: 'Paris', country: 'France', flag: '🇫🇷', iconName: 'Sparkles', color: '#8b5cf6' },
  { id: 'stamp_santorini', name: 'Aegean Voyager', city: 'Santorini', country: 'Greece', flag: '🇬🇷', iconName: 'Camera', color: '#2563eb' },
  { id: 'stamp_berat', name: 'Citadel Scout', city: 'Berat', country: 'Albania', flag: '🇦🇱', iconName: 'Castle', color: '#b45309' },
  { id: 'stamp_cairo', name: 'Pharaoh Wings', city: 'Cairo', country: 'Egypt', flag: '🇪🇬', iconName: 'Crown', color: '#d97706' },
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
    requirement: 'Complete Level 3 (Albania) or solve 3 Trivia',
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
