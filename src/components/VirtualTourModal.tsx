import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Info,
  Calendar,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  location: string;
  country: string;
  imageUrl: string;
  onBookNow?: () => void;
}

interface Hotspot {
  id: string;
  title: string;
  description: string;
  x: number; // percentage
  y: number;
}

export const VirtualTourModal: React.FC<VirtualTourModalProps> = ({
  isOpen,
  onClose,
  title,
  location,
  country,
  imageUrl,
  onBookNow
}) => {
  const { styles } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  if (!isOpen) return null;

  const hotspots: Hotspot[] = [
    {
      id: 'hs-1',
      title: 'Panoramic Viewpoint',
      description: `Breathtaking horizon overlooking ${location}, ${country}. Crystal clear azure waters and majestic architecture.`,
      x: 35,
      y: 45
    },
    {
      id: 'hs-2',
      title: 'Luxury Suite & Terraces',
      description: 'Private clifftop balcony with infinity plunge pool and 24/7 dedicated butler service.',
      x: 65,
      y: 55
    },
    {
      id: 'hs-3',
      title: 'Michelin Dining Terrace',
      description: 'World-renowned gastronomic dining featuring freshly caught seafood and local vintage wines.',
      x: 82,
      y: 40
    }
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX - panOffset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = e.clientX - startX;
    setPanOffset(Math.max(-200, Math.min(200, newOffset)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl h-[90vh] rounded-3xl border border-white/20 bg-slate-950 text-white shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 backdrop-blur-md border border-sky-500/40 text-sky-400">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">{title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/30 text-sky-300 border border-sky-500/40 uppercase">
                  360° Virtual Tour
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{location}, {country}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panoramic Viewer Stage */}
        <div
          className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center bg-black"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-75 ease-out"
            style={{
              transform: `translateX(${panOffset}px) scale(1.08)`,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.9)'
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Interactive Hotspots */}
          {hotspots.map(hs => (
            <div
              key={hs.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              onClick={() => setActiveHotspot(hs)}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full bg-sky-500/40 animate-ping" />
                <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {hs.title}
              </div>
            </div>
          ))}

          {/* Active Hotspot Modal Card */}
          {activeHotspot && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-md p-4 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-2xl space-y-2 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-black text-white">{activeHotspot.title}</h4>
                </div>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{activeHotspot.description}</p>
            </div>
          )}
        </div>

        {/* Bottom Interactive Toolbar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Drag to Pan 360° Panorama</span>
            </div>
            <span className="hidden sm:inline text-xs text-slate-400">Click glowing eye icons to inspect exclusive locations.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold transition-all cursor-pointer"
            >
              Exit Virtual Tour
            </button>

            {onBookNow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNow();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Book This Destination</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
