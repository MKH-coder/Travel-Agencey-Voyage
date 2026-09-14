import { Listing } from '../types.ts';

export const DEFAULT_LISTINGS: Listing[] = [
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
    createdByName: 'Technical Super Admin',
    amenities: ['Caldera View', 'Infinity Pool', 'Sunset Terrace', 'Complimentary Breakfast', 'Private Hot Tub'],
    tags: ['Scenic', 'Sunset', 'Romantic', 'Architecture'],
    timestamps: {
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z'
    }
  },
  {
    id: 'list-kyoto-02',
    title: 'Arashiyama Bamboo Grove & Tenryu-ji Temple Estate',
    category: 'PLACE',
    price: 180,
    rating: 4.92,
    reviewCount: 412,
    location: 'Arashiyama, Kyoto',
    country: 'Japan',
    coordinates: { lat: 35.0163, lng: 135.6713 },
    description: 'Soaring bamboo forest pathways, UNESCO Zen gardens with serene reflecting ponds, and seasonal sakura blossoms alongside Mount Ogura.',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_tech_admin_01',
    createdByName: 'Technical Super Admin',
    amenities: ['Guided Cultural Walk', 'Tea Ceremony Experience', 'Temple Access Pass', 'Bicycle Rental'],
    tags: ['Zen', 'Nature', 'Culture', 'Historical'],
    timestamps: {
      createdAt: '2025-01-11T12:00:00.000Z',
      updatedAt: '2025-01-11T12:00:00.000Z'
    }
  },
  {
    id: 'list-amalfi-03',
    title: 'Positano Cliffside Grand Villa & Private Yacht Mooring',
    category: 'HOTEL',
    price: 680,
    rating: 4.98,
    reviewCount: 215,
    location: 'Positano, Amalfi Coast',
    country: 'Italy',
    coordinates: { lat: 40.6281, lng: 14.4850 },
    description: 'Ultra-luxurious coastal sanctuary built directly into the vertical cliffs of Positano with tiered bougainvillea gardens and private funicular elevator to the sea.',
    images: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_admin_02',
    createdByName: 'Sarah Jenkins',
    hotelPerks: ['Private Beach Club', 'Michelin-starred Dining', 'Helipad', 'Sea-view Spa Suites', 'Speedboat Transfer'],
    tags: ['Luxury Stay', 'Sea View', 'Amalfi', 'Resort'],
    timestamps: {
      createdAt: '2025-01-12T14:30:00.000Z',
      updatedAt: '2025-01-12T14:30:00.000Z'
    }
  },
  {
    id: 'list-swiss-04',
    title: 'The Chedi Andermatt Alpine Chalet & Thermal Bath',
    category: 'HOTEL',
    price: 850,
    rating: 4.96,
    reviewCount: 184,
    location: 'Andermatt, Uri',
    country: 'Switzerland',
    coordinates: { lat: 46.6341, lng: 8.5947 },
    description: 'Masterpiece Alpine luxury resort blending traditional Swiss chalet timber architecture with sleek Asian elegance and heated outdoor pools facing snowy peaks.',
    images: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_admin_02',
    createdByName: 'Sarah Jenkins',
    hotelPerks: ['Ski-in / Ski-out Valet', 'Hydrothermal Spa', 'Wine & Cigar Library', 'Indoor Fireplaces'],
    tags: ['Alps', 'Skiing', 'Chalet', 'Mountain'],
    timestamps: {
      createdAt: '2025-01-13T09:15:00.000Z',
      updatedAt: '2025-01-13T09:15:00.000Z'
    }
  },
  {
    id: 'list-tokyo-05',
    title: 'Sukiyabashi Master Omakase Tasting & Sake Flight',
    category: 'FOOD',
    price: 290,
    rating: 4.99,
    reviewCount: 512,
    location: 'Ginza, Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6724, lng: 139.7656 },
    description: 'Legendary 18-course Edomae sushi omakase crafted with wild seafood hand-selected daily at Toyosu Market paired with rare boutique sake vintages.',
    images: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_tech_admin_01',
    createdByName: 'Technical Super Admin',
    diningSpecialties: ['Private Counter Seating', 'Master Sommelier Pairing', 'Chef Q&A', 'English Translator Guide'],
    tags: ['Sushi', 'Omakase', 'Michelin', 'Ginza'],
    timestamps: {
      createdAt: '2025-01-14T18:00:00.000Z',
      updatedAt: '2025-01-14T18:00:00.000Z'
    }
  },
  {
    id: 'list-paris-06',
    title: 'Le Gabriel Seine Riverfront Haute Gastronomy',
    category: 'FOOD',
    price: 360,
    rating: 4.94,
    reviewCount: 289,
    location: '8th Arrondissement, Paris',
    country: 'France',
    coordinates: { lat: 48.8698, lng: 2.3117 },
    description: 'Triple-Michelin decorated French classical gastronomy reimagined with contemporary Brittany coastal accents in a Napoleon III gilded salon.',
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80'
    ],
    status: 'PUBLISHED',
    createdBy: 'user_admin_02',
    createdByName: 'Sarah Jenkins',
    diningSpecialties: ['Eiffel Tower Sightlines', 'Private Dining Salons', 'Champagne Cellar Tasting', 'Valet Parking'],
    tags: ['Fine Dining', 'Parisian', 'Gourmet', 'Historic'],
    timestamps: {
      createdAt: '2025-01-15T19:30:00.000Z',
      updatedAt: '2025-01-15T19:30:00.000Z'
    }
  }
];
