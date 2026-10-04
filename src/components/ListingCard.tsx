import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  Heart,
  Hotel,
  Utensils,
  Landmark,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Share2,
  Package,
  Clock,
  Plus,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Thermometer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { Listing } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';
import { fetch3DayWeather, LocationWeather } from '../services/weatherService.ts';

const BookingCountdownTimer: React.FC<{ listingId: string }> = ({ listingId }) => {
  const getInitialSeconds = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    return (absHash % 18900) + 2700;
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => getInitialSeconds(listingId));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : getInitialSeconds(listingId)));
    }, 1000);
    return () => clearInterval(timer);
  }, [listingId]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isExpiringSoon = timeLeft < 7200;

  return (
    <div
      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-md border transition-all ${
        isExpiringSoon
          ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white border-rose-400/60 animate-pulse shadow-rose-500/40 ring-1 ring-rose-400/50'
          : 'bg-black/75 text-amber-300 border-amber-500/30'
      }`}
      title="Time-sensitive deal! Book before expiration."
    >
      <Clock className={`w-3 h-3 ${isExpiringSoon ? 'animate-spin-slow text-white' : 'text-amber-400'}`} />
      <span className="font-mono font-bold">
        {hours > 0 ? `${hours}h ` : ''}{String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
      </span>
    </div>
  );
};

interface ListingCardProps {
  listing: Listing;
  isSaved: boolean;
  onToggleSave: (listing: Listing) => void;
  onSelect: (listing: Listing) => void;
  onCreatePackage?: (listing: Listing) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSaved,
  onToggleSave,
  onSelect,
  onCreatePackage,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { styles } = useTheme();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const isAdmin = user && ['ADMIN', 'TECH_ADMIN', 'TECH_SUBADMIN'].includes(user.role);

  const [weatherData, setWeatherData] = useState<LocationWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showFullWeather, setShowFullWeather] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (listing.location) {
      setWeatherLoading(true);
      fetch3DayWeather(`${listing.location}, ${listing.country || ''}`)
        .then((res) => {
          if (isMounted) {
            setWeatherData(res);
            setWeatherLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setWeatherLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [listing.location, listing.country]);

  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case 'sun':
        return <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'cloud-sun':
        return <CloudSun className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'cloud':
        return <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'thunder':
        return <CloudLightning className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'snow':
        return <Snowflake className="w-3.5 h-3.5 text-sky-300 shrink-0" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
  };

  const getCategoryIcon = () => {
    switch (listing.category) {
      case 'HOTEL':
        return <Hotel className="w-3 h-3" />;
      case 'FOOD':
        return <Utensils className="w-3 h-3" />;
      case 'PACKAGE':
        return <Package className="w-3 h-3 text-amber-400" />;
      default:
        return <Landmark className="w-3 h-3" />;
    }
  };

  const getCategoryLabel = () => {
    switch (listing.category) {
      case 'HOTEL':
        return 'Luxury Stay';
      case 'FOOD':
        return 'Local Dining';
      case 'PACKAGE':
        return 'Tour Package';
      default:
        return 'Destination';
    }
  };

  const primaryImage = listing.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group rounded-2xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col ${
        listing.category === 'PACKAGE' ? 'ring-2 ring-amber-500/40 border-amber-500/30' : ''
      }`}
    >
      {/* Media & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onSelect(listing)}>
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Category Chip */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
          listing.category === 'PACKAGE' 
            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30 font-bold'
            : 'bg-black/60 text-white'
        }`}>
          {getCategoryIcon()}
          <span>{getCategoryLabel()}</span>
        </div>

        {/* Time-Sensitive Deal Countdown Timer */}
        <div className="absolute top-12 left-3 z-10 pointer-events-none">
          <BookingCountdownTimer listingId={listing.id} />
        </div>

        {/* Action Buttons Container */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Admin quick package converter */}
          {isAdmin && listing.category !== 'PACKAGE' && onCreatePackage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreatePackage(listing);
              }}
              className="p-2 rounded-full backdrop-blur-md bg-amber-500 hover:bg-amber-400 text-white shadow-md transition-all group/btn"
              title="Admin: Create Tour Package from this Post"
            >
              <Package className="w-4 h-4" />
            </button>
          )}

          {/* Share button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const shareText = `Check out ${listing.title} in ${listing.location} for ${formatPrice(listing.price)}!`;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText);
                AuthAudit.showToast({
                  title: 'Link Copied',
                  message: 'Listing details copied to clipboard.',
                  type: 'success',
                  duration: 3000
                });
              }
            }}
            className="p-2 rounded-full backdrop-blur-md bg-black/50 text-white hover:bg-black/80 transition-all"
            title="Share listing"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Save/Bookmark button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(listing);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isSaved
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-black/50 text-white hover:bg-black/80'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Rating Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-md bg-black/70 text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>{listing.rating.toFixed(2)}</span>
          <span className="text-white/70 font-normal text-[10px]">({listing.reviewCount})</span>
        </div>

        {/* Price Tag Overlay */}
        <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-xl backdrop-blur-md font-bold text-xs shadow-md ${
          listing.category === 'PACKAGE' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border border-amber-300/30' 
            : 'bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white'
        }`}>
          <span className={`text-xs ${listing.category === 'PACKAGE' ? 'text-white/90' : 'text-slate-500'} font-normal`}>
            {listing.category === 'PACKAGE' ? 'Package ' : 'from '}
          </span>
          <span className="text-sm font-extrabold">{formatPrice(listing.price)}</span>
          <span className={`text-[10px] ${listing.category === 'PACKAGE' ? 'text-white/80' : 'text-slate-500'} font-normal`}> 
            {listing.category === 'PACKAGE' ? ' total' : ` / ${listing.category === 'HOTEL' ? 'night' : 'guest'}`}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location details */}
          <div className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium mb-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{listing.location}, {listing.country}</span>
          </div>

          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              onClick={() => onSelect(listing)}
              className={`text-base font-bold line-clamp-1 ${styles.textPrimary} group-hover:text-sky-500 transition-colors cursor-pointer flex-1`}
            >
              {listing.title}
            </h3>
            {listing.duration && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-tighter shrink-0 border border-amber-500/20">
                <Clock className="w-2.5 h-2.5" />
                <span>{listing.duration}</span>
              </div>
            )}
          </div>

          {/* Description snippet */}
          <p className={`text-xs ${styles.textMuted} line-clamp-2 mb-3 leading-relaxed`}>
            {listing.description}
          </p>

          {/* 3-Day Weather Forecast Widget */}
          <div className="mb-3 p-2 rounded-xl bg-slate-500/5 border border-slate-200/50 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Sun className="w-3 h-3 text-amber-500" />
                <span>3-Day Weather</span>
              </div>
              {weatherData && (
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                  {weatherData.currentTempC}°C ({weatherData.currentCondition})
                </span>
              )}
            </div>

            {weatherLoading ? (
              <div className="grid grid-cols-3 gap-1 animate-pulse py-1">
                <div className="h-10 bg-slate-200/60 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-10 bg-slate-200/60 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-10 bg-slate-200/60 dark:bg-slate-800 rounded-lg"></div>
              </div>
            ) : weatherData && weatherData.forecast ? (
              <div className="grid grid-cols-3 gap-1.5">
                {weatherData.forecast.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/40 dark:border-slate-800 text-center transition-all hover:border-sky-500/40 shadow-2xs"
                    title={`${day.dayName}: ${day.condition}, High ${day.tempMaxC}°C (${day.tempMaxF}°F), Low ${day.tempMinC}°C (${day.tempMinF}°F)`}
                  >
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                      {day.dayName}
                    </span>
                    <div className="my-0.5 flex items-center justify-center">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                      {day.tempMaxC}°C
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium mt-0.5">
                      {day.tempMinC}°
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 text-center py-1">
                Weather loading...
              </div>
            )}
          </div>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {listing.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${styles.accentBadge}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 truncate">
            {listing.category === 'HOTEL' ? 'Free Cancellation' : 
             listing.category === 'PACKAGE' ? `${listing.listingIds?.length || 2}+ Experiences Included` :
             'Curated Experience'}
          </div>

          <button
            id={`card-view-btn-${listing.id}`}
            onClick={() => onSelect(listing)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              listing.category === 'PACKAGE'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 hover:scale-[1.02]'
                : `${styles.buttonPrimary}`
            }`}
          >
            <span>{listing.category === 'PACKAGE' ? 'View Package' : 'View & Book'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
