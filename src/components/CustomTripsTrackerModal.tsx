import React, { useState, useEffect } from 'react';
import {
  Compass,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  FileDown,
  Trash2,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Package,
  CreditCard
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { CustomTripRequest, Booking } from '../types.ts';
import { customTripService } from '../services/customTripService.ts';

interface CustomTripsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBuilder: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const CustomTripsTrackerModal: React.FC<CustomTripsTrackerModalProps> = ({
  isOpen,
  onClose,
  onOpenBuilder,
  onBookingSuccess,
}) => {
  const { styles } = useTheme();
  const { user, token, setShowLoginModal } = useAuth();

  const [trips, setTrips] = useState<CustomTripRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<CustomTripRequest | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await customTripService.getTrips(user?.email || undefined, token || undefined);
      setTrips(data);
      if (data.length > 0 && !selectedTrip) {
        setSelectedTrip(data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch custom trips:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrips();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleConfirmBooking = async (trip: CustomTripRequest) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setActionProcessing(true);
    try {
      await customTripService.updateTrip(trip.id, { status: 'CONFIRMED' }, token || undefined);
      setBookingSuccessId(trip.id);
      
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        listingId: trip.id,
        listingTitle: trip.tripTitle,
        listingCategory: 'PACKAGE',
        listingImage: trip.selectedListings?.[0]?.image || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        userId: user.uid,
        userEmail: user.email,
        checkInDate: trip.startDate,
        checkOutDate: trip.endDate,
        guests: trip.adults + trip.children,
        totalPrice: trip.quotedPrice || trip.finalPrice,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      };

      onBookingSuccess?.(newBooking);
      loadTrips();
    } catch (e) {
      console.error('Failed to confirm custom trip:', e);
    } finally {
      setActionProcessing(false);
    }
  };

  const getStatusBadge = (status: CustomTripRequest['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin-slow" />
            <span>Under Concierge Review</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Itinerary Tailoring in Progress</span>
          </span>
        );
      case 'QUOTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Official Quote Ready!</span>
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Trip Confirmed & Booked</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-5xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}>
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-sky-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${styles.textPrimary}`}>
                My Custom Trips & Package Inquiries
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track concierge quote progress, view itemized day-by-day itineraries, and confirm personalized packages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBuilder();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>New Custom Trip</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl text-slate-400 hover:${styles.textPrimary} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Compass className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <div className="text-xs text-slate-400">Loading custom trip itineraries...</div>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${styles.textPrimary}`}>No Custom Trips Created Yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Design your own personalized multi-day itinerary with hotels, dining, and curated activities in Mannanthala, Kyoto, Santorini, or anywhere in the world.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBuilder();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Custom Trip Studio</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Trip Request List */}
              <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {trips.map((t) => {
                  const isSelected = selectedTrip?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTrip(t)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                          : `border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-xs font-bold line-clamp-1">{t.tripTitle}</div>
                        {getStatusBadge(t.status)}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{t.destination}, {t.country}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span>{t.durationDays} Days • {t.adults} Guests</span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">${t.quotedPrice || t.finalPrice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Selected Trip Details & Live Quotation */}
              {selectedTrip && (
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Status Banner */}
                  <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono">Inquiry Reference: {selectedTrip.id}</div>
                        <h3 className={`text-base font-black ${styles.textPrimary}`}>{selectedTrip.tripTitle}</h3>
                      </div>
                      <div>{getStatusBadge(selectedTrip.status)}</div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      <span>📍 {selectedTrip.destination}, {selectedTrip.country}</span>
                      <span>📅 {selectedTrip.startDate} to {selectedTrip.endDate} ({selectedTrip.durationDays} Days)</span>
                      <span>👥 {selectedTrip.adults} Adults {selectedTrip.children > 0 ? `• ${selectedTrip.children} Kids` : ''}</span>
                    </div>

                    {/* Concierge Notes & Official Quotation */}
                    {selectedTrip.conciergeNotes && (
                      <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-500/20 text-xs space-y-1">
                        <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Senior Concierge Response & Upgrades:</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {selectedTrip.conciergeNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Day-by-Day Schedule */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Curated Day-by-Day Itinerary Schedule</span>
                    </h4>
                    <div className="space-y-2.5">
                      {selectedTrip.itinerary.map((day) => (
                        <div
                          key={day.day}
                          className={`p-3.5 rounded-xl border ${styles.border} bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-1.5`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">
                              Day {day.day}
                            </span>
                            <span className="font-bold">{day.title}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                            {day.description}
                          </p>
                          {day.customNotes && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                              Note: {day.customNotes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & Booking Actions */}
                  <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">
                        {selectedTrip.quotedPrice ? 'Official Concierge Quoted Package' : 'Estimated Package Total'}
                      </div>
                      <div className="text-2xl font-black text-amber-500">
                        ${selectedTrip.quotedPrice || selectedTrip.finalPrice}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Includes {selectedTrip.bundleDiscount}% Multi-Item Package Discount
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {selectedTrip.status !== 'CONFIRMED' ? (
                        <button
                          type="button"
                          disabled={actionProcessing}
                          onClick={() => handleConfirmBooking(selectedTrip)}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Accept Quote & Lock Package</span>
                        </button>
                      ) : (
                        <div className="px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirmed Booking Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
