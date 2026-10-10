import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Plus,
  MapPin,
  Camera,
  Calendar,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  Compass,
  Star,
  CheckCircle2,
  Navigation,
  FileText,
  Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Booking } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';

export interface TravelJournalEntry {
  id: string;
  tripTitle: string;
  location: string;
  date: string;
  notes: string;
  photos: string[];
  geoCoords?: { lat: number; lng: number };
  rating: number;
  createdAt: string;
}

interface TravelJournalSectionProps {
  userBookings: Booking[];
}

export const TravelJournalSection: React.FC<TravelJournalSectionProps> = ({ userBookings }) => {
  const { styles } = useTheme();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<TravelJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`voyage_journal_${user?.uid || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'sample-1',
        tripTitle: 'Sunset over Ksamil Turquoise Islands',
        location: 'Ksamil, Sarandë, Albania',
        date: '2026-10-14',
        notes: 'Discovered an incredible cliffside tavern overlooking the four uninhabited islands. Watched the evening sun paint the Ionian waters gold over the Corfu channel.',
        photos: ['https://upload.wikimedia.org/wikipedia/commons/0/0e/Ksamill-1.jpg'],
        geoCoords: { lat: 39.7712, lng: 20.0055 },
        rating: 5,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [newGeoCoords, setNewGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(`voyage_journal_${user?.uid || 'guest'}`, JSON.stringify(entries));
    } catch {}
  }, [entries, user?.uid]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      AuthAudit.showToast({
        title: 'Geolocation Error',
        message: 'Geolocation is not supported by your browser.',
        type: 'error',
        duration: 3000
      });
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewGeoCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4))
        });
        setGeoLoading(false);
        AuthAudit.showToast({
          title: '📍 GPS Location Tagged',
          message: `Latitude: ${pos.coords.latitude.toFixed(4)}, Longitude: ${pos.coords.longitude.toFixed(4)}`,
          type: 'success',
          duration: 3000
        });
      },
      () => {
        setGeoLoading(false);
        AuthAudit.showToast({
          title: 'Location Unavailable',
          message: 'Unable to retrieve your current location.',
          type: 'error',
          duration: 3000
        });
      }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setNewPhotos(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim()) {
      AuthAudit.showToast({
        title: 'Missing Details',
        message: 'Please provide a title and location for your journal entry.',
        type: 'error',
        duration: 3000
      });
      return;
    }

    const newEntry: TravelJournalEntry = {
      id: `journal-${Date.now()}`,
      tripTitle: newTitle.trim(),
      location: newLocation.trim(),
      date: newDate,
      notes: newNotes.trim(),
      photos: newPhotos.length > 0 ? newPhotos : ['https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Berat_UNESCO_2016_Albania.jpg/1280px-Berat_UNESCO_2016_Albania.jpg'],
      geoCoords: newGeoCoords || undefined,
      rating: newRating,
      createdAt: new Date().toISOString()
    };

    setEntries(prev => [newEntry, ...prev]);
    setIsCreating(false);
    
    // Reset form
    setNewTitle('');
    setNewLocation('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewNotes('');
    setNewPhotos([]);
    setNewGeoCoords(null);
    setNewRating(5);

    AuthAudit.showToast({
      title: '📖 Journal Entry Saved!',
      message: 'Your travel memory has been logged into your profile journal.',
      type: 'success',
      duration: 3500
    });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    AuthAudit.showToast({
      title: 'Entry Deleted',
      message: 'Journal memory removed.',
      type: 'success',
      duration: 2500
    });
  };

  const filteredEntries = entries.filter(e =>
    e.tripTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Journal Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-sky-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Digital Travel Journal</h3>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold border border-sky-500/30">
                {entries.length} Memories Logged
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Log personal notes, snap photos, and tag geolocated memories from your voyages.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel Entry' : 'Log New Memory'}</span>
        </button>
      </div>

      {/* New Memory Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateEntry} className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} space-y-4 shadow-xl animate-in slide-in-from-top-2`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h4 className={`text-sm font-black ${styles.textPrimary} flex items-center gap-2`}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Log Travel Memory</span>
            </h4>
            {userBookings.length > 0 && (
              <select
                onChange={(e) => {
                  const b = userBookings.find(item => item.id === e.target.value);
                  if (b) {
                    setNewTitle(b.listingTitle);
                    setNewLocation(b.checkInDate ? `Trip Date: ${b.checkInDate}` : 'Booked Escape');
                  }
                }}
                className="text-xs p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none"
              >
                <option value="">-- Autofill from Booked Trips --</option>
                {userBookings.map(b => (
                  <option key={b.id} value={b.id}>{b.listingTitle}</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Memory Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Scuba Diving in Great Barrier Reef"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Location Name *</label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Cairns, Queensland, Australia"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Visit Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">GPS Tagging</label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoLoading}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 text-sky-500 ${geoLoading ? 'animate-spin' : ''}`} />
                <span>
                  {newGeoCoords
                    ? `Tagged: ${newGeoCoords.lat}°, ${newGeoCoords.lng}°`
                    : 'Attach Current GPS Location'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Journal Notes & Highlights</label>
            <textarea
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Record feelings, hidden cafes, local conversations, or special memories..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Photo upload section */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Snap / Upload Photos</label>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Camera / Photo Library</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
              />

              {newPhotos.map((p, idx) => (
                <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                  <img src={p} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewPhotos(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Journal Entry</span>
            </button>
          </div>
        </form>
      )}

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search memories by destination, notes, or title..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-sky-500"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-3.5">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-500" />
            <div className="text-xs font-bold">No travel memories found.</div>
            <p className="text-[11px] text-slate-500">Click "Log New Memory" to record your travel adventures!</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} space-y-3 shadow-sm hover:shadow-md transition-shadow relative group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-black ${styles.textPrimary}`}>{entry.tripTitle}</h4>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-400">{entry.rating}.0</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-sky-500">
                      <MapPin className="w-3 h-3" />
                      <span>{entry.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{entry.date}</span>
                    </span>
                    {entry.geoCoords && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <Navigation className="w-2.5 h-2.5" />
                        <span>{entry.geoCoords.lat}°, {entry.geoCoords.lng}°</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete memory entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {entry.notes && (
                <p className={`text-xs ${styles.textMuted} leading-relaxed bg-slate-500/5 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50`}>
                  "{entry.notes}"
                </p>
              )}

              {entry.photos && entry.photos.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1">
                  {entry.photos.map((photo, idx) => (
                    <div key={idx} className="w-24 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <img
                        src={photo}
                        alt="memory"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
