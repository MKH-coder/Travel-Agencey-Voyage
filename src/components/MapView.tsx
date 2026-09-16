import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Compass,
  Hotel,
  UtensilsCrossed,
  MapPin,
  Star,
  Bookmark,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Listing, ListingCategory } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

// Fix default leaflet asset paths in bundled environments safely
try {
  if (typeof L !== 'undefined' && L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }
} catch {
  // Ignore in environments without window/DOM
}

interface MapViewProps {
  listings: Listing[];
  activeListingId?: string | null;
  savedListingIds: string[];
  onSelectListing: (listing: Listing) => void;
  onToggleSave: (listing: Listing) => void;
  className?: string;
  isCompact?: boolean;
}

const CATEGORY_STYLES: Record<
  ListingCategory,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  PLACE: {
    label: 'Iconic Place',
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    icon: 'compass',
  },
  HOTEL: {
    label: 'Luxury Stay',
    bg: 'bg-sky-500',
    text: 'text-sky-500',
    border: 'border-sky-500',
    icon: 'hotel',
  },
  FOOD: {
    label: 'Dining & Food',
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    icon: 'utensils',
  },
};

export const MapView: React.FC<MapViewProps> = ({
  listings,
  activeListingId,
  savedListingIds,
  onSelectListing,
  onToggleSave,
  className = '',
  isCompact = false,
}) => {
  const { theme, styles } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ListingCategory | 'ALL'>('ALL');

  // Filter listings with valid coordinates
  const validListings = useMemo(() => {
    return listings.filter((l) => {
      const hasCoords = l.coordinates && typeof l.coordinates.lat === 'number' && typeof l.coordinates.lng === 'number';
      const matchesCategory = activeCategoryFilter === 'ALL' || l.category === activeCategoryFilter;
      return hasCoords && matchesCategory;
    });
  }, [listings, activeCategoryFilter]);

  // OpenStreetMap Standard Tile Layer Configuration
  const tileConfig = useMemo(() => {
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };
  }, []);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30, 15],
        zoom: 2.5,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Invalidate size on resize observer
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // 2. Update Tile Layer on Theme Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    });

    tileLayer.addTo(map);
  }, [tileConfig]);

  // 3. Render Custom Markers for listings
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);

    validListings.forEach((listing) => {
      if (!listing.coordinates) return;
      const { lat, lng } = listing.coordinates;
      const categoryStyle = CATEGORY_STYLES[listing.category] || CATEGORY_STYLES.PLACE;
      const isSelected = selectedListing?.id === listing.id || activeListingId === listing.id;
      const isSaved = savedListingIds.includes(listing.id);

      // Create Custom Interactive Pin with Price Badge
      const customHtml = `
        <div class="leaflet-custom-marker group cursor-pointer transition-transform duration-200 hover:scale-110 ${
          isSelected ? 'scale-125 z-50' : 'z-10'
        }" style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <!-- Floating Price Badge -->
          <div style="
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 2px 7px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            background: ${isSelected ? '#06b6d4' : '#0f172a'};
            color: #ffffff;
            border: 1.5px solid ${isSelected ? '#ffffff' : '#334155'};
            margin-bottom: -4px;
            transition: all 0.2s ease;
          ">
            <span>$${listing.price}</span>
            ${isSaved ? '<span style="color: #f43f5e; font-size: 10px;">♥</span>' : ''}
          </div>

          <!-- Pin Icon Point -->
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${
              listing.category === 'PLACE'
                ? '#10b981'
                : listing.category === 'HOTEL'
                ? '#0ea5e9'
                : '#f59e0b'
            };
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            color: #ffffff;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              ${
                listing.category === 'PLACE'
                  ? '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'
                  : listing.category === 'HOTEL'
                  ? '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>'
                  : '<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M12 2v20"/><path d="M21 15v7"/><path d="M21 15a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v7"/>'
              }
            </svg>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid ${
              listing.category === 'PLACE'
                ? '#10b981'
                : listing.category === 'HOTEL'
                ? '#0ea5e9'
                : '#f59e0b'
            };
            margin-top: -1px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-div-icon',
        html: customHtml,
        iconSize: [60, 48],
        iconAnchor: [30, 46],
        popupAnchor: [0, -48],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedListing(listing);
        map.panTo([lat, lng], { animate: true, duration: 0.6 });
      });

      marker.addTo(map);
      markersRef.current.set(listing.id, marker);
      bounds.extend([lat, lng]);
    });

    // Fit bounds if multiple points exist
    if (validListings.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
        animate: true,
      });
    }
  }, [validListings, selectedListing?.id, activeListingId, savedListingIds]);

  // 4. Focus on active listing if provided externally
  useEffect(() => {
    if (!activeListingId || !mapInstanceRef.current) return;
    const target = listings.find((l) => l.id === activeListingId);
    if (target?.coordinates) {
      setSelectedListing(target);
      mapInstanceRef.current.flyTo([target.coordinates.lat, target.coordinates.lng], 9, {
        duration: 1.2,
      });
    }
  }, [activeListingId, listings]);

  // Controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([]);
    validListings.forEach((l) => {
      if (l.coordinates) bounds.extend([l.coordinates.lat, l.coordinates.lng]);
    });
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  };

  return (
    <div
      id="travel-platform-map-view"
      className={`relative w-full overflow-hidden rounded-2xl border shadow-lg ${styles.cardBg} ${styles.border} ${className}`}
      style={{ minHeight: isCompact ? '400px' : '520px' }}
    >
      {/* Map Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Floating Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Category Pills on Map */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-800/80 pointer-events-auto">
          <button
            id="map-filter-all-btn"
            type="button"
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategoryFilter === 'ALL'
                ? `${styles.buttonPrimary} shadow-sm`
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({listings.filter((l) => l.coordinates).length})
          </button>

          <button
            id="map-filter-place-btn"
            type="button"
            onClick={() => setActiveCategoryFilter('PLACE')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategoryFilter === 'PLACE'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-500" />
            <span>Places</span>
          </button>

          <button
            id="map-filter-hotel-btn"
            type="button"
            onClick={() => setActiveCategoryFilter('HOTEL')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategoryFilter === 'HOTEL'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Hotel className="w-3.5 h-3.5 text-sky-500" />
            <span>Stays</span>
          </button>

          <button
            id="map-filter-food-btn"
            type="button"
            onClick={() => setActiveCategoryFilter('FOOD')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategoryFilter === 'FOOD'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
            <span>Dining</span>
          </button>
        </div>

        {/* Zoom & Fit Bounds Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-800/80 pointer-events-auto">
          <button
            id="map-fit-bounds-btn"
            type="button"
            onClick={handleFitBounds}
            title="Fit All Destinations"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
          <button
            id="map-zoom-in-btn"
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="map-zoom-out-btn"
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Selected Listing Preview Card */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`p-3.5 rounded-2xl border shadow-2xl backdrop-blur-lg ${styles.cardBg} ${styles.border} transition-all`}
          >
            <div className="flex gap-3.5">
              {/* Thumbnail */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                <img
                  src={selectedListing.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  id={`map-preview-save-btn-${selectedListing.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(selectedListing);
                  }}
                  className={`absolute top-1.5 right-1.5 p-1.5 rounded-lg backdrop-blur-md transition-all ${
                    savedListingIds.includes(selectedListing.id)
                      ? 'bg-rose-500 text-white'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      savedListingIds.includes(selectedListing.id) ? 'fill-white' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        CATEGORY_STYLES[selectedListing.category].bg
                      } text-white`}
                    >
                      {CATEGORY_STYLES[selectedListing.category].label}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{selectedListing.rating.toFixed(2)}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm leading-snug line-clamp-1 text-slate-900 dark:text-white">
                    {selectedListing.title}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
                    <span className="truncate">
                      {selectedListing.location}, {selectedListing.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                  <div>
                    <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">
                      ${selectedListing.price}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      {selectedListing.category === 'HOTEL'
                        ? '/night'
                        : selectedListing.category === 'FOOD'
                        ? '/person'
                        : '/entry'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`map-view-details-btn-${selectedListing.id}`}
                      type="button"
                      onClick={() => onSelectListing(selectedListing)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-sm`}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id="close-map-preview-btn"
                      type="button"
                      onClick={() => setSelectedListing(null)}
                      className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend Chip in bottom-left */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>Places</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm" />
          <span>Stays</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>Dining</span>
        </div>
      </div>
    </div>
  );
};
