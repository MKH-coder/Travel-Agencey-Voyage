import React, { useState, useEffect } from 'react';
import {
  Compass,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  DollarSign,
  MessageSquare,
  Package,
  ArrowRight,
  RotateCcw,
  Send,
  Plus,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { CustomTripRequest, Listing } from '../types.ts';
import { customTripService } from '../services/customTripService.ts';

interface CustomTripsAdminTabProps {
  onRefreshListings?: () => void;
}

export const CustomTripsAdminTab: React.FC<CustomTripsAdminTabProps> = ({ onRefreshListings }) => {
  const { styles } = useTheme();
  const { user, token } = useAuth();

  const [trips, setTrips] = useState<CustomTripRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'QUOTED' | 'CONFIRMED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<CustomTripRequest | null>(null);

  // Quote form state
  const [quotedPriceInput, setQuotedPriceInput] = useState<number>(0);
  const [conciergeNotesInput, setConciergeNotesInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await customTripService.getTrips(undefined, token || undefined);
      setTrips(data);
      if (data.length > 0 && (!selectedTrip || !data.some(d => d.id === selectedTrip.id))) {
        setSelectedTrip(data[0]);
        setQuotedPriceInput(data[0].quotedPrice || data[0].finalPrice);
        setConciergeNotesInput(data[0].conciergeNotes || '');
      }
    } catch (e) {
      console.error('Failed to fetch custom trips in admin portal:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSelectTrip = (trip: CustomTripRequest) => {
    setSelectedTrip(trip);
    setQuotedPriceInput(trip.quotedPrice || trip.finalPrice);
    setConciergeNotesInput(trip.conciergeNotes || '');
    setActionSuccess('');
  };

  const handleUpdateStatus = async (status: CustomTripRequest['status']) => {
    if (!selectedTrip) return;
    setIsProcessing(true);
    try {
      const updated = await customTripService.updateTrip(
        selectedTrip.id,
        {
          status,
          quotedPrice: quotedPriceInput > 0 ? quotedPriceInput : undefined,
          conciergeNotes: conciergeNotesInput.trim() || undefined,
        },
        token || undefined
      );

      if (updated) {
        setSelectedTrip(updated);
        setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
        setActionSuccess(`Inquiry status updated to ${status}!`);
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertToPackage = async () => {
    if (!selectedTrip) return;
    setIsProcessing(true);
    try {
      const updated = await customTripService.updateTrip(
        selectedTrip.id,
        {
          convertToPackage: true,
          packageTitle: selectedTrip.tripTitle,
          packagePrice: quotedPriceInput > 0 ? quotedPriceInput : selectedTrip.finalPrice,
          packageDescription: `Curated multi-day luxury package: ${selectedTrip.tripTitle}. Includes verified stays in ${selectedTrip.destination}, private transfers, and signature activities.`,
        },
        token || undefined
      );

      if (updated) {
        setSelectedTrip(updated);
        setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
        setActionSuccess('Successfully published as a live Tour Package!');
        onRefreshListings?.();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (e) {
      console.error('Failed to convert to package:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTrips = trips.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.tripTitle.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg font-black tracking-tight ${styles.textPrimary} flex items-center gap-2`}>
            <Compass className="w-5 h-5 text-amber-500" />
            <span>Custom Trips & Package Inquiries</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review custom itinerary proposals submitted by travelers, assign quotations, and publish tailored tour packages.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTrips}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${styles.buttonSecondary} flex items-center gap-1.5`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Inquiries</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Inquiries', count: trips.length },
            { id: 'SUBMITTED', label: 'Submitted', count: trips.filter(t => t.status === 'SUBMITTED').length },
            { id: 'UNDER_REVIEW', label: 'Under Review', count: trips.filter(t => t.status === 'UNDER_REVIEW').length },
            { id: 'QUOTED', label: 'Quoted', count: trips.filter(t => t.status === 'QUOTED').length },
            { id: 'CONFIRMED', label: 'Confirmed', count: trips.filter(t => t.status === 'CONFIRMED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === tab.id ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by destination, traveler, email..."
          className={`w-full md:w-64 px-3 py-1.5 rounded-xl border text-xs outline-none ${styles.inputBg}`}
        />
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Compass className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <div className="text-xs text-slate-400">Loading custom trip inquiries...</div>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="py-16 text-center space-y-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
          <div className="text-sm font-bold text-slate-500">No custom trip inquiries found in this filter.</div>
          <div className="text-xs text-slate-400">Travelers submitting itineraries from the Explorer will appear here.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Proposals List */}
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredTrips.map((t) => {
              const isSelected = selectedTrip?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTrip(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="text-xs font-bold line-clamp-1">{t.tripTitle}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      t.status === 'CONFIRMED'
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        : t.status === 'QUOTED'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : t.status === 'UNDER_REVIEW'
                        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{t.userName}</span>
                      <span className="text-[10px]">{t.durationDays} Days</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span>📍 {t.destination}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">${t.quotedPrice || t.finalPrice}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Proposal Inspector & Concierge Quoting Suite */}
          {selectedTrip && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Traveler & Overview Card */}
              <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">Reference: {selectedTrip.id}</div>
                    <h3 className={`text-base font-black ${styles.textPrimary}`}>{selectedTrip.tripTitle}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedTrip.userName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{selectedTrip.userEmail}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <span>📍 Destination: <strong>{selectedTrip.destination}, {selectedTrip.country}</strong></span>
                  <span>📅 Dates: <strong>{selectedTrip.startDate} to {selectedTrip.endDate} ({selectedTrip.durationDays} Days)</strong></span>
                  <span>👥 Party: <strong>{selectedTrip.adults} Adults {selectedTrip.children > 0 ? `, ${selectedTrip.children} Kids` : ''}</strong></span>
                  <span>✨ Style: <strong>{selectedTrip.travelStyle}</strong></span>
                  <span>💎 Tier: <strong>{selectedTrip.budgetTier}</strong></span>
                </div>

                {selectedTrip.specialRequests && (
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
                    <strong className="text-amber-600 dark:text-amber-400">Traveler Special Wishlist: </strong>
                    <span className="text-slate-600 dark:text-slate-300">{selectedTrip.specialRequests}</span>
                  </div>
                )}
              </div>

              {/* Day-by-Day Itinerary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Day-by-Day Itinerary Schedule ({selectedTrip.itinerary.length} Days)
                </h4>
                <div className="space-y-2">
                  {selectedTrip.itinerary.map((d) => (
                    <div
                      key={d.day}
                      className={`p-3 rounded-xl border ${styles.border} bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-1`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">
                          Day {d.day}
                        </span>
                        <span className="font-bold">{d.title}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{d.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concierge Action Box: Quote & Notes & Conversion */}
              <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-lg space-y-4`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Concierge Actions & Quotation Suite</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-600 dark:text-slate-300">
                      Official Quoted Package Price ($ USD)
                    </label>
                    <input
                      type="number"
                      value={quotedPriceInput}
                      onChange={(e) => setQuotedPriceInput(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-bold outline-none ${styles.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-600 dark:text-slate-300">
                      Update Inquiry Status
                    </label>
                    <div className="flex items-center gap-1.5">
                      {(['UNDER_REVIEW', 'QUOTED', 'CONFIRMED'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(st)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            selectedTrip.status === st
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {st === 'UNDER_REVIEW' ? 'Reviewing' : st === 'QUOTED' ? 'Quote' : 'Confirm'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-600 dark:text-slate-300">
                    Concierge Notes & Personal Message to Traveler
                  </label>
                  <textarea
                    rows={2}
                    value={conciergeNotesInput}
                    onChange={(e) => setConciergeNotesInput(e.target.value)}
                    placeholder="e.g. Upgraded to luxury ocean-front suite in Mannanthala with complimentary sunset boat transfer..."
                    className={`w-full p-2.5 rounded-xl border text-xs ${styles.border} ${styles.inputBg} outline-none`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleUpdateStatus('QUOTED')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Official Quote to Traveler</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing || Boolean(selectedTrip.convertedToPackageId)}
                    onClick={handleConvertToPackage}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>{selectedTrip.convertedToPackageId ? '✓ Live Package Published' : 'Convert to Public Tour Package'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};
