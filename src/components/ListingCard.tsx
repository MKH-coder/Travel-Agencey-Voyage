import React from 'react';
import {
  MapPin,
  Star,
  Heart,
  Hotel,
  Utensils,
  Landmark,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { Listing } from '../types.ts';

interface ListingCardProps {
  listing: Listing;
  isSaved: boolean;
  onToggleSave: (listing: Listing) => void;
  onSelect: (listing: Listing) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSaved,
  onToggleSave,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { styles } = useTheme();

  const getCategoryIcon = () => {
    switch (listing.category) {
      case 'HOTEL':
        return <Hotel className="w-3 h-3" />;
      case 'FOOD':
        return <Utensils className="w-3 h-3" />;
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
      default:
        return 'Destination';
    }
  };

  const primaryImage = listing.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group rounded-2xl border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col`}
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
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-black/60 text-white shadow-sm">
          {getCategoryIcon()}
          <span>{getCategoryLabel()}</span>
        </div>

        {/* Save/Bookmark button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/50 text-white hover:bg-black/80'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Rating Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-md bg-black/70 text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>{listing.rating.toFixed(2)}</span>
          <span className="text-white/70 font-normal text-[10px]">({listing.reviewCount})</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white font-bold text-xs shadow-md">
          <span className="text-xs text-slate-500 font-normal">from </span>
          <span className="text-sm font-extrabold">${listing.price}</span>
          <span className="text-[10px] text-slate-500 font-normal"> / {listing.category === 'HOTEL' ? 'night' : 'guest'}</span>
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
          <h3
            onClick={() => onSelect(listing)}
            className={`text-base font-bold line-clamp-1 ${styles.textPrimary} group-hover:text-sky-500 transition-colors cursor-pointer mb-2`}
          >
            {listing.title}
          </h3>

          {/* Description snippet */}
          <p className={`text-xs ${styles.textMuted} line-clamp-2 mb-3 leading-relaxed`}>
            {listing.description}
          </p>

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
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {listing.category === 'HOTEL' ? 'Free Cancellation' : 'Curated Experience'}
          </div>

          <button
            id={`card-view-btn-${listing.id}`}
            onClick={() => onSelect(listing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${styles.buttonPrimary} transition-all`}
          >
            <span>View & Book</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
