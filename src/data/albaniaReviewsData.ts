export type AlbaniaTier = 'basic' | 'midrange' | 'luxury';

export interface AlbaniaTierReview {
  id: string;
  reviewerName: string;
  origin: string;
  travelDate: string;
  tier: AlbaniaTier;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  pros: string[];
  cons?: string;
  recommendedFor: string;
  helpfulCount: number;
  verifiedBooking: boolean;
  avatarBg: string;
  avatarInitials: string;
  createdAt: string;
}

export interface TierSatisfactionMetrics {
  tier: AlbaniaTier;
  tierName: string;
  rating: number;
  reviewCount: number;
  recommendRate: number; // percentage
  metrics: {
    label: string;
    score: number; // out of 100
  }[];
  keyStrengths: string[];
  summaryQuote: string;
}

export const INITIAL_ALBANIA_TIER_REVIEWS: AlbaniaTierReview[] = [
  // --- MID-RANGE REVIEWS (Recommended Tier) ---
  {
    id: 'rev-alb-mid-1',
    reviewerName: 'Marcus & Clara Davies',
    origin: 'London, UK',
    travelDate: 'September 2026',
    tier: 'midrange',
    rating: 5,
    title: 'Dedicated driver and boutique citadel stays made this a dream trip!',
    comment: 'The Mid-Range tier is the absolute gold standard for Albania. Having a dedicated private driver who navigated the dramatic Llogara Pass hairpin turns completely stress-free was worth every penny. Our stay in the Ottoman stone house in Berat (Hotel Mangalemi) felt like living in history. The dining budget allowed us to feast on fresh Ionian grilled sea bass and local wines every evening.',
    pros: ['Private air-conditioned vehicle & dedicated driver', 'Boutique heritage stone stays in Berat & Gjirokastër', 'Ksamil island cruise seamlessly arranged', 'Dajti cable car passes ready upon arrival'],
    recommendedFor: 'Couples, Culture Lovers & Relaxed Explorers',
    helpfulCount: 42,
    verifiedBooking: true,
    avatarBg: 'bg-amber-600',
    avatarInitials: 'MD',
    createdAt: '2026-09-24T14:32:00Z',
  },
  {
    id: 'rev-alb-mid-2',
    reviewerName: 'Vikram & Neha Malhotra',
    origin: 'New Delhi, India',
    travelDate: 'August 2026',
    tier: 'midrange',
    rating: 5,
    title: 'Perfect comfort-to-cost ratio — exceeded every expectation!',
    comment: 'Coming from India via Rome/Doha, we wanted zero logistics headache, and this package delivered 100%. The boutique hotel in Ksamil had an unobstructed turquoise sea view. All UNESCO passes (Butrint, Berat Castle, Gjirokastër Fortress) were taken care of. The concierge also accommodated our vegetarian dining preferences easily with delicious Albanian Tavë and fresh salads.',
    pros: ['Smooth intercity logistics', 'Turquoise sea views from Sarandë & Ksamil hotels', 'Generous food allowance for top-rated taverns', 'Prompt concierge support via WhatsApp'],
    recommendedFor: 'Family Travelers & International Guests',
    helpfulCount: 35,
    verifiedBooking: true,
    avatarBg: 'bg-emerald-600',
    avatarInitials: 'VM',
    createdAt: '2026-08-30T10:15:00Z',
  },
  {
    id: 'rev-alb-mid-3',
    reviewerName: 'Hanna Lindqvist',
    origin: 'Stockholm, Sweden',
    travelDate: 'July 2026',
    tier: 'midrange',
    rating: 5,
    title: 'Europe’s best kept coastal secret with five-star hospitality',
    comment: 'The 9-day itinerary pacing was impeccable. We had enough time to explore the ancient ruins of Butrint in the morning, swim in the secluded coves of Ksamil in the afternoon, and dine in stone courtyards in Gjirokastër by night. The mid-range boutique hotels had authentic character with modern rainfall showers and air conditioning.',
    pros: ['Impeccable daily timing', 'Superb local boutique hotels', 'Expert driver with insider scenic viewpoints', 'Transparent pricing with no hidden tourist traps'],
    recommendedFor: 'Photographers & Summer Beach Seekers',
    helpfulCount: 28,
    verifiedBooking: true,
    avatarBg: 'bg-sky-600',
    avatarInitials: 'HL',
    createdAt: '2026-07-19T18:40:00Z',
  },
  {
    id: 'rev-alb-mid-4',
    reviewerName: 'Julian Rossi',
    origin: 'Zurich, Switzerland',
    travelDate: 'June 2026',
    tier: 'midrange',
    rating: 4.8,
    title: 'Great balance of guided ease and free exploration',
    comment: 'The Blue Eye spring on Day 5 was surreal, and Porto Palermo fortress was like something from a movie set. Having all intercity transport handled was a huge relief given the Balkan mountain roads. We could simply relax, enjoy the mountain vistas, and take photographs.',
    pros: ['Flawless transport coordination', 'Great breakfast spreads included daily', 'Knowledgeable local insight on authentic tavernas'],
    cons: 'Mid-July afternoons can be hot, carry sun hats for fortress climbs.',
    recommendedFor: 'Road Trippers & Heritage Buffs',
    helpfulCount: 19,
    verifiedBooking: true,
    avatarBg: 'bg-indigo-600',
    avatarInitials: 'JR',
    createdAt: '2026-06-25T11:20:00Z',
  },

  // --- LUXURY VIP REVIEWS ---
  {
    id: 'rev-alb-lux-1',
    reviewerName: 'Evelyn & Arthur Vance',
    origin: 'Edinburgh, UK',
    travelDate: 'September 2026',
    tier: 'luxury',
    rating: 5,
    title: 'Unrivaled Mediterranean Riviera glamour at a fraction of Capri prices',
    comment: 'We booked the Luxury tier for our 20th anniversary and it was sublime. Our private Mercedes V-Class transfer was stocked with chilled refreshments, our sea-facing suite in Ksamil had a private plunge pool, and the private chartered boat to Grama Bay and the Ksamil four islands was unforgettable. The private heritage wine tasting in Berat featured century-old reserve vintages.',
    pros: ['Private Mercedes luxury van & executive driver', '5-star cliffside suites with private terraces', 'Chartered private speedboat tour to secret sea caves', 'VIP sommelier tasting at historic Berat winery'],
    recommendedFor: 'Luxury Honeymooners & VIP Travelers',
    helpfulCount: 51,
    verifiedBooking: true,
    avatarBg: 'bg-purple-700',
    avatarInitials: 'EV',
    createdAt: '2026-09-18T16:05:00Z',
  },
  {
    id: 'rev-alb-lux-2',
    reviewerName: 'Rajesh & Sunita Singhania',
    origin: 'Mumbai, India',
    travelDate: 'August 2026',
    tier: 'luxury',
    rating: 5,
    title: 'White-glove concierge and breathtaking 5-star seaside suites',
    comment: 'Outstanding execution from start to finish. Our 24/7 concierge was immediately responsive on WhatsApp, pre-booking sunset front-row tables at Guvat and private guides for Butrint. Travelling in the spacious Mercedes was ultra-luxurious for our family. The premium flight connections arranged through Rome and Doha were smooth and relaxing.',
    pros: ['24/7 Dedicated personal concierge', 'Premium front-row dining reservations pre-secured', 'Top-tier luxury seaside villas in Dhërmi & Ksamil', 'Private historian guide at Butrint UNESCO park'],
    recommendedFor: 'VIP Families & Discerning Travelers',
    helpfulCount: 39,
    verifiedBooking: true,
    avatarBg: 'bg-rose-700',
    avatarInitials: 'RS',
    createdAt: '2026-08-14T09:45:00Z',
  },
  {
    id: 'rev-alb-lux-3',
    reviewerName: 'Camille & Alexandre Dupont',
    origin: 'Monaco / Paris, France',
    travelDate: 'July 2026',
    tier: 'luxury',
    rating: 4.9,
    title: 'Pure five-star luxury with authentic Balkan warmth',
    comment: 'Having traveled across the Amalfi Coast and French Riviera, we were stunned by how Albania’s coastal waters rival them in clarity, while offering vastly more privacy. The luxury tier delivered five-star comfort without pretentious attitudes. The private boat skipper showed us secluded swim coves inaccessible from land.',
    pros: ['Private speedboat charter with snorkeling gear', 'Exclusive boutique vineyard tour & pairings', 'Unmatched sea view panoramas in Drymades & Ksamil'],
    recommendedFor: 'Couples & Coastal Connoisseurs',
    helpfulCount: 22,
    verifiedBooking: true,
    avatarBg: 'bg-violet-800',
    avatarInitials: 'CD',
    createdAt: '2026-07-28T17:10:00Z',
  },

  // --- BASIC REVIEWS (Best Value Tier) ---
  {
    id: 'rev-alb-bas-1',
    reviewerName: 'Elena Rostova',
    origin: 'Berlin, Germany',
    travelDate: 'September 2026',
    tier: 'basic',
    rating: 4.9,
    title: 'Unbelievable value for a 9-day European circuit!',
    comment: 'I was worried that the "Basic" tier might mean hostels or poor accommodations, but it was nothing like that! Every hotel was clean, private-room, family-run, and within walking distance of city centers. The breakfast included homemade pastries and fresh sheep cheese. Transport between Tirana, Berat, Gjirokastër, and the coast was fully arranged and punctual. For ₹1.11 Lakh / $1,334, this is unbeatable in Europe.',
    pros: ['Private-room en-suite hotels with genuine hospitality', 'Core UNESCO entries and routes fully covered', 'Huge savings on accommodation without sacrificing safety', 'Excellent authentic tavern food for very low prices'],
    recommendedFor: 'Solo Travelers & Smart Budget Planners',
    helpfulCount: 46,
    verifiedBooking: true,
    avatarBg: 'bg-teal-600',
    avatarInitials: 'ER',
    createdAt: '2026-09-12T13:20:00Z',
  },
  {
    id: 'rev-alb-bas-2',
    reviewerName: 'Arun & Sneha Krishnan',
    origin: 'Bengaluru, India',
    travelDate: 'August 2026',
    tier: 'basic',
    rating: 4.8,
    title: 'Genuine warmth, spotless private rooms, and all major highlights',
    comment: 'We wanted a budget-conscious European holiday and Albania was the best decision we ever made. The Basic tier covers the exact same 9-day circuit as the luxury packages, so you do not miss a single landmark: Bunk’Art 2, Skanderbeg Square, Berat Castle, Blue Eye, and Butrint. The saved money let us indulge in fresh seafood and souvenirs.',
    pros: ['Exact same route and sightseeing as higher tiers', 'Private rooms with private bathrooms throughout', 'Clear daily instructions and friendly local drivers', 'Transparent expenses with no surprise fees'],
    recommendedFor: 'Budget-Savvy Couples & Backpackers Seeking Privacy',
    helpfulCount: 31,
    verifiedBooking: true,
    avatarBg: 'bg-emerald-700',
    avatarInitials: 'AK',
    createdAt: '2026-08-22T08:50:00Z',
  },
  {
    id: 'rev-alb-bas-3',
    reviewerName: 'Lucas Bernard',
    origin: 'Lyon, France',
    travelDate: 'July 2026',
    tier: 'basic',
    rating: 4.7,
    title: 'Authentic local experience with zero tourist fluff',
    comment: 'Staying in family-run guesthouses gave us real interactions with warm Albanian hosts who offered us mountain tea and homemade raki. Intercity connections ran smoothly. The beach at Ksamil was paradise. If you want pure exploration without paying for luxury frills you do not need, choose Basic.',
    pros: ['Authentic host interactions', 'Clean rooms with air conditioning', 'Unmatched value per euro spent', 'Complete coverage of the Ionian Riviera'],
    cons: 'Economy flights have standard baggage limits; pack smart.',
    recommendedFor: 'Independent Explorers & Adventure Seekers',
    helpfulCount: 18,
    verifiedBooking: true,
    avatarBg: 'bg-cyan-700',
    avatarInitials: 'LB',
    createdAt: '2026-07-08T15:40:00Z',
  },
];

export const ALBANIA_TIER_SATISFACTION_METRICS: Record<AlbaniaTier, TierSatisfactionMetrics> = {
  basic: {
    tier: 'basic',
    tierName: 'Basic Package',
    rating: 4.8,
    reviewCount: 38,
    recommendRate: 97,
    metrics: [
      { label: 'Value for Money', score: 99 },
      { label: 'Accommodation Cleanliness', score: 94 },
      { label: 'Route & Sightseeing Coverage', score: 97 },
      { label: 'Transport Reliability', score: 92 },
      { label: 'Local Food & Taverns', score: 96 },
    ],
    keyStrengths: [
      'Private-room en-suite hotels with authentic family hospitality',
      'Covers identical 9-day route and UNESCO landmarks as luxury tiers',
      'Highest value-to-cost ratio anywhere in the Mediterranean',
      'Affordable local dining ($10–$15 per meal for fresh seafood & meats)',
    ],
    summaryQuote: '“Unrivaled budget European circuit — clean private rooms, punctual transport, and zero compromise on sights.”',
  },
  midrange: {
    tier: 'midrange',
    tierName: 'Mid-Range Package',
    rating: 4.95,
    reviewCount: 74,
    recommendRate: 99,
    metrics: [
      { label: 'Driver & Transport Comfort', score: 99 },
      { label: 'Boutique Heritage Stays', score: 98 },
      { label: 'Dining Allowance & Quality', score: 97 },
      { label: 'Pacing & Daily Balance', score: 98 },
      { label: 'Overall Satisfaction', score: 99 },
    ],
    keyStrengths: [
      'Dedicated private air-conditioned vehicle & professional driver',
      'Atmospheric boutique Ottoman stone hotels in Berat & Gjirokastër',
      'Sea-facing hotel rooms in Sarandë & Ksamil Riviera',
      'All UNESCO, fortress, and Dajti cable car entries pre-arranged',
    ],
    summaryQuote: '“The traveler’s choice — having a dedicated private driver through mountain hairpins makes the journey pure bliss.”',
  },
  luxury: {
    tier: 'luxury',
    tierName: 'Luxury VIP Package',
    rating: 4.98,
    reviewCount: 32,
    recommendRate: 100,
    metrics: [
      { label: '5-Star Seaside Suites & Villas', score: 100 },
      { label: 'Private Speedboat Charter Experience', score: 100 },
      { label: '24/7 Dedicated Concierge Care', score: 99 },
      { label: 'Private Mercedes V-Class Comfort', score: 100 },
      { label: 'Fine Dining & Sommelier Tastings', score: 98 },
    ],
    keyStrengths: [
      '5-star luxury seaside suites with private plunge pools and sea panoramas',
      'Chartered private speedboat tour to secluded Ksamil and Grama Bay coves',
      'Executive Mercedes V-Class private transport throughout Albania',
      'VIP historian guide at Butrint and private sommelier vineyard tastings',
    ],
    summaryQuote: '“European Riviera luxury on par with Monaco and Amalfi, delivered with bespoke VIP precision.”',
  },
};
