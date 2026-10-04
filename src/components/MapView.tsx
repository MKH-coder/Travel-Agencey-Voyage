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
  ArrowRight,
  Route,
  Flame,
  Plane,
  Eye,
  EyeOff,
  Navigation
} from 'lucide-react';
import { Listing, ListingCategory } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';

// Curved path generator for smooth airline-style route arcs
function getCurvedPath(start: [number, number], end: [number, number], curvature: number = 0.18): [number, number][] {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;
  
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  
  if (dist === 0) return [start, end];
  
  // Normal offset
  const offsetLat = midLat - (dLng / dist) * (dist * curvature);
  const offsetLng = midLng + (dLat / dist) * (dist * curvature);
  
  const points: [number, number][] = [];
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * offsetLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * offsetLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

export interface DestinationCluster {
  id: string;
  rank: number;
  name: string;
  country: string;
  center: [number, number];
  estimatedBookings: number;
  listingsCount: number;
  topListing: Listing;
}

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
  PACKAGE: {
    label: 'Curated Package',
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
    icon: 'package',
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
  const { formatPrice } = useCurrency();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const trailsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ListingCategory | 'ALL'>('ALL');
  const [showPopularTrails, setShowPopularTrails] = useState<boolean>(true);
  const [selectedTrailCluster, setSelectedTrailCluster] = useState<DestinationCluster | null>(null);

  // Filter listings with valid coordinates
  const validListings = useMemo(() => {
    return listings.filter((l) => {
      const hasCoords = l.coordinates && typeof l.coordinates.lat === 'number' && typeof l.coordinates.lng === 'number';
      const matchesCategory = activeCategoryFilter === 'ALL' || l.category === activeCategoryFilter;
      return hasCoords && matchesCategory;
    });
  }, [listings, activeCategoryFilter]);

  // Compute Top 3 Destination Clusters based on bookings & popularity
  const topClusters: DestinationCluster[] = useMemo(() => {
    if (validListings.length === 0) return [];

    // Group listings by geographic proximity (within ~3.5 degrees)
    const clusterMap: {
      centerLat: number;
      centerLng: number;
      listings: Listing[];
      name: string;
      country: string;
    }[] = [];

    validListings.forEach((listing) => {
      if (!listing.coordinates) return;
      const { lat, lng } = listing.coordinates;

      let found = false;
      for (const c of clusterMap) {
        const dLat = Math.abs(c.centerLat - lat);
        const dLng = Math.abs(c.centerLng - lng);
        if (dLat < 4.5 && dLng < 4.5) {
          c.listings.push(listing);
          found = true;
          break;
        }
      }

      if (!found) {
        clusterMap.push({
          centerLat: lat,
          centerLng: lng,
          listings: [listing],
          name: listing.location || listing.title,
          country: listing.country || 'Global',
        });
      }
    });

    // Score clusters based on bookings/reviews and popularity
    const scoredClusters = clusterMap.map((c, idx) => {
      const totalRatings = c.listings.reduce((sum, l) => sum + (l.rating || 4.5), 0);
      const avgPrice = c.listings.reduce((sum, l) => sum + (l.price || 100), 0) / c.listings.length;
      const calculatedBookings = Math.round(
        (c.listings.length * 280) + (totalRatings * 45) + (avgPrice > 200 ? 120 : 60)
      );

      // Best representative listing
      const topListing = [...c.listings].sort((a, b) => b.rating - a.rating)[0] || c.listings[0];

      return {
        id: `cluster_${idx}_${c.name.toLowerCase().replace(/\s+/g, '_')}`,
        rank: 0,
        name: c.name,
        country: c.country,
        center: [c.centerLat, c.centerLng] as [number, number],
        estimatedBookings: calculatedBookings,
        listingsCount: c.listings.length,
        topListing,
      };
    });

    // Sort descending by bookings and take top 3
    scoredClusters.sort((a, b) => b.estimatedBookings - a.estimatedBookings);

    return scoredClusters.slice(0, 3).map((cluster, index) => ({
      ...cluster,
      rank: index + 1,
    }));
  }, [validListings]);

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

      // Layer group for route trails
      const trailsGroup = L.layerGroup().addTo(map);
      trailsLayerGroupRef.current = trailsGroup;

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

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);

    validListings.forEach((listing) => {
      if (!listing.coordinates) return;
      const { lat, lng } = listing.coordinates;
      const isSelected = selectedListing?.id === listing.id || activeListingId === listing.id;
      const isSaved = savedListingIds.includes(listing.id);

      const customHtml = `
        <div class="leaflet-custom-marker group cursor-pointer transition-transform duration-200 hover:scale-110 ${
          isSelected ? 'scale-125 z-50' : 'z-10'
        }" style="position: relative; display: flex; flex-direction: column; align-items: center;">
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
            <span>${formatPrice(listing.price)}</span>
            ${isSaved ? '<span style="color: #f43f5e; font-size: 10px;">♥</span>' : ''}
          </div>

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
                : listing.category === 'FOOD'
                ? '#f59e0b'
                : '#8b5cf6'
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
                  : listing.category === 'FOOD'
                  ? '<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M12 2v20"/><path d="M21 15v7"/><path d="M21 15a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v7"/>'
                  : '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'
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
                : listing.category === 'FOOD'
                ? '#f59e0b'
                : '#8b5cf6'
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

    if (validListings.length > 0 && bounds.isValid() && !activeListingId) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
        animate: true,
      });
    }
  }, [validListings, selectedListing?.id, activeListingId, savedListingIds]);

  // 4. Render Popular Route Trails (Animated Lines connecting Top 3 Clusters)
  useEffect(() => {
    const trailsGroup = trailsLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!trailsGroup || !map) return;

    // Clear previous trail layers
    trailsGroup.clearLayers();

    if (!showPopularTrails || topClusters.length < 2) return;

    // Connect top 3 clusters in sequence: 1 -> 2 -> 3 -> 1
    const clusterPairs: [DestinationCluster, DestinationCluster][] = [];
    if (topClusters.length === 2) {
      clusterPairs.push([topClusters[0], topClusters[1]]);
    } else if (topClusters.length >= 3) {
      clusterPairs.push([topClusters[0], topClusters[1]]);
      clusterPairs.push([topClusters[1], topClusters[2]]);
      clusterPairs.push([topClusters[2], topClusters[0]]);
    }

    // Render Animated Polylines
    clusterPairs.forEach(([fromCluster, toCluster]) => {
      const curvedCoords = getCurvedPath(fromCluster.center, toCluster.center);

      // 1. Background Wide Glow Line
      const glowPolyline = L.polyline(curvedCoords, {
        color: '#f59e0b',
        weight: 9,
        opacity: 0.35,
        className: 'popular-route-glow',
        lineCap: 'round',
        lineJoin: 'round',
      });

      // 2. Foreground Animated Flowing Core Line
      const corePolyline = L.polyline(curvedCoords, {
        color: '#fbbf24',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '10, 10',
        className: 'popular-route-core cursor-pointer',
        lineCap: 'round',
        lineJoin: 'round',
      });

      corePolyline.on('click', () => {
        setSelectedTrailCluster(fromCluster);
        setSelectedListing(fromCluster.topListing);
        map.flyTo(fromCluster.center, 7, { duration: 1 });
      });

      glowPolyline.addTo(trailsGroup);
      corePolyline.addTo(trailsGroup);
    });

    // Render Hub Cluster Milestone Badges on the 3 clusters
    topClusters.forEach((cluster) => {
      const clusterBadgeHtml = `
        <div class="popular-cluster-node-marker group cursor-pointer" style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <!-- Pulsing Halo -->
          <div class="popular-route-cluster-pulse" style="
            position: absolute;
            top: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(245, 158, 11, 0.4);
            pointer-events: none;
          "></div>

          <!-- Rank Ribbon Tag -->
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 900;
            white-space: nowrap;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #0f172a;
            border: 1.5px solid #fef08a;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.5);
            margin-bottom: -5px;
            z-index: 30;
          ">
            <span>🔥 #${cluster.rank} Top Trail</span>
            <span style="font-size: 9px; opacity: 0.85;">(${cluster.estimatedBookings}+)</span>
          </div>

          <!-- Main Hub Pin Point -->
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #0f172a;
            border: 2.5px solid #fbbf24;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            color: #fbbf24;
            z-index: 25;
            transition: transform 0.2s ease;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.2c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.1z"/>
            </svg>
          </div>
        </div>
      `;

      const clusterIcon = L.divIcon({
        className: 'custom-cluster-div-icon',
        html: clusterBadgeHtml,
        iconSize: [120, 56],
        iconAnchor: [60, 48],
      });

      const clusterMarker = L.marker(cluster.center, { icon: clusterIcon, zIndexOffset: 1000 });
      
      clusterMarker.on('click', () => {
        setSelectedTrailCluster(cluster);
        setSelectedListing(cluster.topListing);
        map.flyTo(cluster.center, 8, { duration: 1 });
      });

      clusterMarker.addTo(trailsGroup);
    });

  }, [showPopularTrails, topClusters]);

  // 5. Focus on active listing if provided externally
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
      style={{ minHeight: isCompact ? '420px' : '560px' }}
    >
      {/* Map Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Floating Header Controls */}
      <div className="absolute top-3 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none max-w-full">
        {/* Category Pills & Popular Routes Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-800/80 pointer-events-auto overflow-x-auto max-w-full no-scrollbar">
          <button
            id="map-filter-all-btn"
            type="button"
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategoryFilter === 'FOOD'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
            <span>Dining</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Popular Route Trails Toggle Button */}
          <button
            id="map-toggle-popular-routes-btn"
            type="button"
            onClick={() => setShowPopularTrails(!showPopularTrails)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              showPopularTrails
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
            title="Toggle Animated Popular Route Trails connecting Top 3 Destination Clusters"
          >
            <Flame className={`w-3.5 h-3.5 ${showPopularTrails ? 'fill-slate-950 text-slate-950' : 'text-amber-500'}`} />
            <span>Popular Trails</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
              showPopularTrails ? 'bg-black/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {showPopularTrails ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Zoom & Fit Bounds Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/80 dark:border-slate-800/80 pointer-events-auto">
          <button
            id="map-fit-bounds-btn"
            type="button"
            onClick={handleFitBounds}
            title="Fit All Destinations"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
          <button
            id="map-zoom-in-btn"
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="map-zoom-out-btn"
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Popular Route Trail Itinerary Pill Banner */}
      {showPopularTrails && topClusters.length >= 2 && (
        <div className="absolute top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-auto z-10 pointer-events-auto max-w-lg">
          <div className="p-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-amber-500/40 shadow-2xl text-white space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  Popular Route Trails (Top 3 Booked Hubs)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Multi-Destination Circuit</span>
            </div>

            {/* Clusters Stop List */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              {topClusters.map((cluster, idx) => (
                <React.Fragment key={cluster.id}>
                  <button
                    onClick={() => {
                      setSelectedTrailCluster(cluster);
                      setSelectedListing(cluster.topListing);
                      mapInstanceRef.current?.flyTo(cluster.center, 8, { duration: 1 });
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      selectedTrailCluster?.id === cluster.id
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-black">
                      {cluster.rank}
                    </span>
                    <span className="truncate max-w-[110px]">{cluster.name}</span>
                    <span className="text-[9px] text-amber-400/80">({cluster.estimatedBookings}+)</span>
                  </button>
                  {idx < topClusters.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-amber-400/70 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

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
                  className={`absolute top-1.5 right-1.5 p-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer ${
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
                      {formatPrice(selectedListing.price)}
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
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-sm cursor-pointer`}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id="close-map-preview-btn"
                      type="button"
                      onClick={() => setSelectedListing(null)}
                      className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
        {showPopularTrails && (
          <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-2 text-amber-500 font-bold">
            <span className="w-2.5 h-1 rounded-full bg-amber-400" />
            <span>Popular Route Trail</span>
          </div>
        )}
      </div>
    </div>
  );
};

