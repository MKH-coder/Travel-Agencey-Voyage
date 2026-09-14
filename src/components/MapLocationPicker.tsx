import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Utensils, Sparkles, Check, Compass } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

export interface LocationResult {
  coordinates: { lat: number; lng: number };
  location: string;
  country: string;
  suggestedTitle?: string;
  category?: 'FOOD' | 'HOTEL' | 'PLACE';
  tags?: string[];
  diningSpecialties?: string[];
}

interface MapLocationPickerProps {
  initialCoordinates?: { lat: number; lng: number };
  initialLocation?: string;
  onSelectLocation: (result: LocationResult) => void;
  onClose?: () => void;
}

const PRESET_RESTAURANTS: LocationResult[] = [
  {
    coordinates: { lat: 35.6719, lng: 139.7640 },
    location: 'Ginza, Tokyo',
    country: 'Japan',
    suggestedTitle: 'Ginza Hachiman Edomae Sushi & Chef Counter',
    category: 'FOOD',
    tags: ['Omakase', 'Sushi', 'Michelin Star', 'Ginza'],
    diningSpecialties: ['Otoro Nigiri Flamed', 'Uni Gunkan Triple Layer', 'Anago Sea Eel with Tare'],
  },
  {
    coordinates: { lat: 35.0037, lng: 135.7772 },
    location: 'Gion District, Kyoto',
    country: 'Japan',
    suggestedTitle: 'Gion Karyo Kaiseki Machiya & Zen Garden',
    category: 'FOOD',
    tags: ['Kaiseki', 'Zen Garden', 'Historic Kyoto', 'Fine Dining'],
    diningSpecialties: ['Seasonal 10-Course Banquet', 'Kyoto Wild Herb Tempura', 'A5 Wagyu Sukiyaki'],
  },
  {
    coordinates: { lat: 48.8534, lng: 2.3338 },
    location: 'Saint-Germain-des-Prés, Paris',
    country: 'France',
    suggestedTitle: 'Le Comptoir du Relais Neo-Bistro Gastronomy',
    category: 'FOOD',
    tags: ['Bistronomy', 'Natural Wine', 'Parisian Dining', 'Yves Camdeborde'],
    diningSpecialties: ['Butter-Poached Brittany Oysters', 'Roasted Pigeon with Foie Gras', 'Artisanal Charcuterie'],
  },
  {
    coordinates: { lat: 41.8885, lng: 12.4770 },
    location: 'Trastevere, Rome',
    country: 'Italy',
    suggestedTitle: 'Trattoria Da Enzo al 29 Artisanal Pasta',
    category: 'FOOD',
    tags: ['Roman Trattoria', 'Pasta Artigianale', 'Carbonara', 'Historic Rome'],
    diningSpecialties: ['Rigatoni alla Carbonara', 'Carciofi alla Giudia', 'Tiramisu Artigianale'],
  },
  {
    coordinates: { lat: 40.6281, lng: 14.4850 },
    location: 'Positano, Amalfi Coast',
    country: 'Italy',
    suggestedTitle: 'La Sponda Cliffside Candlelight Ristorante',
    category: 'FOOD',
    tags: ['Michelin Star', '400 Candles', 'Amalfi Cliffside', 'Mediterranean'],
    diningSpecialties: ['Mediterranean Red Prawn Crudo', 'Handmade Lemon Tagliolini', 'Sea Salt Baked Catch'],
  },
  {
    coordinates: { lat: 45.9658, lng: 9.2025 },
    location: 'Lenno, Lake Como',
    country: 'Italy',
    suggestedTitle: 'Villa del Balbianello Shoreline Dining',
    category: 'FOOD',
    tags: ['Lakefront Villa', 'Private Riva Boat', 'Lombardy Cuisine'],
    diningSpecialties: ['Lake Como Perch Risotto', 'Black Truffle Tagliatelle', 'Barolo Wine Reduction'],
  },
  {
    coordinates: { lat: -8.5069, lng: 115.2625 },
    location: 'Payangan, Ubud, Bali',
    country: 'Indonesia',
    suggestedTitle: 'Locavore Rainforest Culinary Sanctuary',
    category: 'FOOD',
    tags: ['Farm to Table', 'Indonesian Hyper-Local', 'Rainforest Dining'],
    diningSpecialties: ['Smoked Black Heritage Pig', 'Spiced Duck Betutu', 'Palm Nectar Gelato'],
  },
  {
    coordinates: { lat: 45.9765, lng: 7.7491 },
    location: 'Findeln, Zermatt',
    country: 'Switzerland',
    suggestedTitle: 'Chez Vrony Matterhorn Alpine Gourmet',
    category: 'FOOD',
    tags: ['Alpine Chalet', 'Glacier Views', 'Swiss Gourmet', 'Matterhorn'],
    diningSpecialties: ['Vrony Air-Dried Alpine Beef', 'Valais Truffle Fondue', 'Organic Walliser Cheese'],
  },
  {
    coordinates: { lat: 36.4618, lng: 25.3753 },
    location: 'Oia, Santorini Island',
    country: 'Greece',
    suggestedTitle: 'Lycabettus Sunset Caldera Restaurant',
    category: 'FOOD',
    tags: ['Caldera Edge', 'Sunset Dining', 'Cycladic Gastronomy'],
    diningSpecialties: ['Aegean Lobster Tail with Saffron', 'Santorini Fava & Octopus', 'Assyrtiko Wine Poached Pears'],
  },
  {
    coordinates: { lat: 41.3879, lng: 2.1557 },
    location: 'Eixample, Barcelona',
    country: 'Spain',
    suggestedTitle: 'Disfrutar Avant-Garde Mediterranean Kitchen',
    category: 'FOOD',
    tags: ['World Best Restaurant', 'Molecular Cuisine', 'Catalan Modern'],
    diningSpecialties: ['Panchino Dough with Caviar', 'Crispy Egg Yolk with Mushroom Gel', 'Idiazabal Multi-Sphere'],
  }
];

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialCoordinates = { lat: 35.6719, lng: 139.7640 },
  onSelectLocation,
  onClose,
}) => {
  const { theme, styles } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(initialCoordinates);
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<LocationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialCoordinates.lat, initialCoordinates.lng],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    const isDark = theme === 'dark-slate' || theme === 'crimson-black';
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

    // Custom map pin icon
    const customIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #f43f5e;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const marker = L.marker([initialCoordinates.lat, initialCoordinates.lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);

    const handleLatLngChange = async (lat: number, lng: number) => {
      setCurrentCoords({ lat, lng });
      setIsGeocoding(true);
      try {
        const res = await fetch('/api/places/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedPlaceInfo({
            coordinates: { lat, lng },
            location: data.location || `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            country: data.country || 'International',
            suggestedTitle: data.suggestedTitle,
            category: data.category || 'FOOD',
            tags: data.tags || ['Restaurant', 'Gourmet'],
            diningSpecialties: data.diningSpecialties || ['Chef Tasting Menu', 'Seasonal Specialty'],
          });
        }
      } catch {
        // fallback
        setSelectedPlaceInfo({
          coordinates: { lat, lng },
          location: `Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          country: 'International',
          category: 'FOOD',
        });
      } finally {
        setIsGeocoding(false);
      }
    };

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      handleLatLngChange(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      handleLatLngChange(Number(lat.toFixed(5)), Number(lng.toFixed(5)));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger initial geocode
    handleLatLngChange(initialCoordinates.lat, initialCoordinates.lng);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [initialCoordinates, theme]);

  // Jump map to a preset restaurant location
  const handleSelectPreset = (preset: LocationResult) => {
    setSelectedPlaceInfo(preset);
    setCurrentCoords(preset.coordinates);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([preset.coordinates.lat, preset.coordinates.lng], 13, {
        duration: 1.2,
      });
      markerRef.current.setLatLng([preset.coordinates.lat, preset.coordinates.lng]);
    }
  };

  // Search places via API
  const handleSearchPlaces = async () => {
    if (!searchQuery.trim()) return;
    setIsGeocoding(true);
    try {
      const res = await fetch('/api/places/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.coordinates) {
          const result: LocationResult = {
            coordinates: data.coordinates,
            location: data.location,
            country: data.country,
            suggestedTitle: data.suggestedTitle,
            category: data.category || 'FOOD',
            tags: data.tags,
            diningSpecialties: data.diningSpecialties,
          };
          handleSelectPreset(result);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsGeocoding(false);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedPlaceInfo) {
      onSelectLocation(selectedPlaceInfo);
    } else {
      onSelectLocation({
        coordinates: currentCoords,
        location: `Location (${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)})`,
        country: 'International',
        category: 'FOOD',
      });
    }
    if (onClose) onClose();
  };

  return (
    <div className={`p-5 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-xl space-y-4`}>
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-500" />
            <h3 className={`text-base font-bold ${styles.textPrimary}`}>
              Interactive Location & Restaurant Auto-Detector
            </h3>
          </div>
          <p className={`text-xs ${styles.textMuted}`}>
            Click anywhere on the map or pick a culinary hotspot to automatically populate coordinates, address, and dining specialties.
          </p>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPlaces()}
              placeholder="Search restaurant or city..."
              className={`pl-8 pr-3 py-1.5 text-xs rounded-xl outline-none ${styles.inputBg} w-48 sm:w-60`}
            />
          </div>
          <button
            type="button"
            onClick={handleSearchPlaces}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${styles.buttonPrimary}`}
          >
            Find
          </button>
        </div>
      </div>

      {/* Quick Restaurant Hotspot Chips */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Utensils className="w-3 h-3 text-amber-500" />
          <span>Quick Hotspot Presets (Auto-Adds Restaurant Data)</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_RESTAURANTS.slice(0, 6).map((preset) => (
            <button
              key={preset.suggestedTitle}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 border ${
                selectedPlaceInfo?.suggestedTitle === preset.suggestedTitle
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>{preset.location}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Helper overlay badge */}
        <div className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Click map to place or drag pin</span>
        </div>

        {isGeocoding && (
          <div className="absolute top-2 right-2 z-[400] bg-slate-900/80 text-white px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Detecting place...</span>
          </div>
        )}
      </div>

      {/* Detected Location Card & Confirm Button */}
      {selectedPlaceInfo && (
        <div className={`p-4 rounded-2xl border ${styles.border} bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 uppercase">
                Detected Restaurant / Spot
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
              </span>
            </div>
            <div className={`text-sm font-bold ${styles.textPrimary}`}>
              {selectedPlaceInfo.suggestedTitle || selectedPlaceInfo.location}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{selectedPlaceInfo.location}, {selectedPlaceInfo.country}</span>
              {selectedPlaceInfo.diningSpecialties && selectedPlaceInfo.diningSpecialties.length > 0 && (
                <span className="text-[10px] text-amber-500 font-medium">
                  • {selectedPlaceInfo.diningSpecialties.join(' • ')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-2 rounded-xl text-xs font-medium ${styles.buttonSecondary}`}
              >
                Cancel
              </button>
            )}
            <button
              id="confirm-location-btn"
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center gap-1.5`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Location & Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
