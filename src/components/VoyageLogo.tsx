import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.tsx';
import logoImage from '../assets/images/voyage_logo_1790705612447.jpg';

interface VoyageLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'horizontal' | 'emblem' | 'compact';
  showTagline?: boolean;
  className?: string;
}

export const VoyageLogo: React.FC<VoyageLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  showTagline = true,
  className = '',
}) => {
  const { styles, theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  // Height mappings based on size
  const heightClasses = {
    xs: 'h-8',
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  const emblemSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (!imageError) {
    if (variant === 'emblem') {
      return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
          <img
            src={logoImage}
            alt="Voyage Tours and Travels"
            onError={() => setImageError(true)}
            className={`${emblemSizes[size]} object-cover object-top rounded-full shadow-sm border border-sky-500/20`}
          />
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
          <img
            src={logoImage}
            alt="Voyage Tours and Travels"
            onError={() => setImageError(true)}
            className={`${emblemSizes[size]} object-contain rounded-xl`}
          />
          <div className="flex flex-col">
            <span className={`font-serif font-black tracking-tight leading-none text-base sm:text-lg ${styles.textPrimary}`}>
              VOYAGE
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
              TOURS & TRAVELS
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
        <img
          src={logoImage}
          alt="Voyage - Tours and Travels (More Destinations. Greater Stories.)"
          onError={() => setImageError(true)}
          className={`${heightClasses[size]} w-auto object-contain drop-shadow-sm rounded-lg`}
        />
      </div>
    );
  }

  // Fallback Vector Rendering if image is loading or fails
  return (
    <div className={`inline-flex items-center gap-3 shrink-0 select-none ${className}`}>
      {/* Decorative Compass & Mountain Emblem */}
      <div className={`${emblemSizes[size]} rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 text-white flex items-center justify-center shadow-md relative overflow-hidden border border-sky-400/30 shrink-0`}>
        {/* Subtle sun */}
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-400 opacity-90 blur-[0.5px]" />
        {/* Compass star */}
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white drop-shadow-sm" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-serif text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none`}>
            VOYAGE
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="h-[1px] w-3 bg-sky-500/50" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
            Tours and Travels
          </span>
          <span className="h-[1px] w-3 bg-sky-500/50" />
        </div>
        {showTagline && (
          <span className="text-[10px] italic font-serif text-slate-500 dark:text-slate-400 leading-tight">
            More Destinations. Greater Stories.
          </span>
        )}
      </div>
    </div>
  );
};
