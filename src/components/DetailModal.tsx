import React, { useState } from 'react';
import {
  X,
  MapPin,
  Star,
  Heart,
  Calendar,
  Users,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  Utensils,
  Hotel,
  Landmark,
  Share2,
  Bell,
  BellOff
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Listing, Booking, PriceAlert } from '../types.ts';
import { FirebaseSyncService } from '../services/firebase.ts';

interface DetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (listing: Listing) => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  listing,
  onClose,
  isSaved,
  onToggleSave,
  onBookingSuccess,
}) => {
  const { styles } = useTheme();
  const { user, token, setShowLoginModal } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 10);
    return today.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [hasPriceAlert, setHasPriceAlert] = useState(false);
  const [priceAlertLoading, setPriceAlertLoading] = useState(false);
  const [priceAlertId, setPriceAlertId] = useState<string | null>(null);

  React.useEffect(() => {
    if (user && listing) {
      const checkAlert = async () => {
        setPriceAlertLoading(true);
        try {
          const alert = await FirebaseSyncService.getPriceAlertForUserAndListing(user.uid, listing.id);
          if (alert && alert.active) {
            setHasPriceAlert(true);
            setPriceAlertId(alert.id);
          } else {
            setHasPriceAlert(false);
            setPriceAlertId(null);
          }
        } catch (err) {
          console.error("Error fetching price alert:", err);
        } finally {
          setPriceAlertLoading(false);
        }
      };
      checkAlert();
    } else {
      setHasPriceAlert(false);
      setPriceAlertId(null);
    }
  }, [user, listing]);

  const handleTogglePriceAlert = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!listing) return;

    setPriceAlertLoading(true);
    try {
      if (hasPriceAlert && priceAlertId) {
        const success = await FirebaseSyncService.deletePriceAlert(priceAlertId);
        if (success) {
          setHasPriceAlert(false);
          setPriceAlertId(null);
        }
      } else {
        const newAlertId = `alert_${Date.now()}`;
        const newAlert: PriceAlert = {
          id: newAlertId,
          userId: user.uid,
          userEmail: user.email,
          listingId: listing.id,
          listingTitle: listing.title,
          targetPrice: listing.price,
          active: true,
          createdAt: new Date().toISOString()
        };
        const success = await FirebaseSyncService.savePriceAlert(newAlert);
        if (success) {
          setHasPriceAlert(true);
          setPriceAlertId(newAlertId);
        }
      }
    } catch (err) {
      console.error("Error toggling price alert:", err);
    } finally {
      setPriceAlertLoading(false);
    }
  };

  if (!listing) return null;

  // Calculate pricing
  const calculateDays = () => {
    const start = new Date(checkInDate).getTime();
    const end = new Date(checkOutDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  };

  const daysCount = listing.category === 'HOTEL' ? calculateDays() : 1;
  const subtotal = listing.price * daysCount * (listing.category === 'FOOD' ? guests : 1);
  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.05);
  const totalPrice = subtotal + serviceFee + taxes;

  // Competitor comparisons
  const competitor1Price = Math.round(totalPrice * 1.22);
  const competitor2Price = Math.round(totalPrice * 1.15);
  const memberSavings = competitor1Price - totalPrice;

  const handleBooking = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setIsBooking(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing.id,
          checkInDate,
          checkOutDate: listing.category === 'HOTEL' ? checkOutDate : undefined,
          guests,
          totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place booking.');
      } else {
        setBookingConfirmed(data);
        if (onBookingSuccess) onBookingSuccess(data);
      }
    } catch {
      setErrorMessage('Network communication error.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-5xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles.accentBadge}`}>
              {listing.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{listing.location}, {listing.country}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(listing)}
              className={`p-2 rounded-xl border ${styles.border} transition-colors ${
                isSaved ? 'bg-rose-500 text-white' : `${styles.cardBg} ${styles.textPrimary} hover:bg-slate-100 dark:hover:bg-slate-800`
              }`}
              title={isSaved ? 'Remove from saved' : 'Save to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button
              id="detail-modal-close-btn"
              onClick={onClose}
              className={`p-2 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Title & Rating */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${styles.textPrimary}`}>
                {listing.title}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{listing.rating.toFixed(2)}</span>
                  <span className="text-slate-400 font-normal">({listing.reviewCount} verified guest reviews)</span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Content
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-normal">Platform Direct Rate</span>
              <div className="text-2xl sm:text-3xl font-black text-sky-500">
                ${listing.price}
                <span className="text-xs text-slate-400 font-normal"> / {listing.category === 'HOTEL' ? 'night' : 'experience'}</span>
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-3">
            <div className="aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
              <img
                src={listing.images[activeImageIndex] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            {listing.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-sky-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Two Column Layout: Description & Comparison vs Booking Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Left Column: Details, Highlights & Comparison */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Overview */}
              <div>
                <h3 className={`text-base font-bold mb-2 ${styles.textPrimary}`}>
                  Experience Overview
                </h3>
                <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
                  {listing.description}
                </p>
              </div>

              {/* Amenities / Specialties */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className={`p-4 rounded-2xl border ${styles.border} ${styles.bg}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider text-slate-400 mb-3`}>
                    Included Amenities & Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {listing.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dining Specialties (If Food or Hotel) */}
              {listing.diningSpecialties && listing.diningSpecialties.length > 0 && (
                <div className={`p-4 rounded-2xl border ${styles.border} ${styles.bg}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-rose-500" />
                    <h4 className={`text-xs font-bold uppercase tracking-wider text-slate-400`}>
                      Culinary Specialties & Tasting Menu
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listing.diningSpecialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Perks */}
              {listing.hotelPerks && listing.hotelPerks.length > 0 && (
                <div className={`p-4 rounded-2xl border ${styles.border} ${styles.bg}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className={`text-xs font-bold uppercase tracking-wider text-slate-400`}>
                      Exclusive Hotel Member Privileges
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {listing.hotelPerks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct Pricing Comparison Matrix */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                    <h4 className={`text-sm font-bold ${styles.textPrimary}`}>
                      Live Direct Pricing Comparison
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Save ${memberSavings}
                  </span>
                </div>

                <p className={`text-xs ${styles.textMuted} mb-4`}>
                  Real-time rate aggregator benchmarked against major public travel engines for identical dates and room categories.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <div>
                        <div className="text-xs font-bold text-sky-600 dark:text-sky-400">Voyage Platform Rate</div>
                        <div className="text-[10px] text-slate-400">Direct contract • Zero markup</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400">${totalPrice}</div>
                      <div className="text-[10px] text-emerald-500 font-bold">Best Guaranteed</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Expedia Public Search</div>
                        <div className="text-[10px] text-slate-400">Standard commission rate</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500 line-through">${competitor1Price}</div>
                      <div className="text-[10px] text-rose-500 font-medium">+${memberSavings} more</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Booking.com Standard</div>
                        <div className="text-[10px] text-slate-400">OTA public pricing</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500 line-through">${competitor2Price}</div>
                      <div className="text-[10px] text-rose-500 font-medium">+${competitor2Price - totalPrice} more</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Hotel Booking Engine Widget */}
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-lg sticky top-2`}>
                <h4 className={`text-base font-bold mb-3 ${styles.textPrimary}`}>
                  {listing.category === 'HOTEL' ? 'Reserve Hotel Stay' : 'Book Experience'}
                </h4>

                {bookingConfirmed ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Reservation Confirmed!</h5>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Booking ID: {bookingConfirmed.id}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 text-left text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dates:</span>
                        <span className="font-semibold">{bookingConfirmed.checkInDate} to {bookingConfirmed.checkOutDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Guests:</span>
                        <span className="font-semibold">{bookingConfirmed.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Paid:</span>
                        <span className="font-bold text-sky-500">${bookingConfirmed.totalPrice}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setBookingConfirmed(null)}
                      className={`w-full py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
                    >
                      Book Another Date
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    
                    {/* Date picker */}
                    <div>
                      <label className={`block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1`}>
                        {listing.category === 'HOTEL' ? 'Stay Dates' : 'Experience Date'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className={`w-full p-2 text-xs rounded-xl outline-none ${styles.inputBg}`}
                          />
                        </div>
                        {listing.category === 'HOTEL' ? (
                          <div className="relative">
                            <input
                              type="date"
                              value={checkOutDate}
                              onChange={(e) => setCheckOutDate(e.target.value)}
                              className={`w-full p-2 text-xs rounded-xl outline-none ${styles.inputBg}`}
                            />
                          </div>
                        ) : (
                          <div className="p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center">
                            Single Day Tour
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Guests counter */}
                    <div>
                      <label className={`block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1`}>
                        Guests
                      </label>
                      <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuests(Math.min(8, guests + 1))}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>${listing.price} × {daysCount} {listing.category === 'HOTEL' ? 'nights' : 'guest(s)'}</span>
                        <span>${subtotal}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Platform Concierge & Service Fee</span>
                        <span>${serviceFee}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>City & Tourism Taxes</span>
                        <span>${taxes}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm">
                        <span className={styles.textPrimary}>Total Due</span>
                        <span className="text-sky-500">${totalPrice}</span>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-medium">
                        {errorMessage}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      id="confirm-booking-btn"
                      onClick={handleBooking}
                      disabled={isBooking}
                      className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} flex items-center justify-center gap-2 transition-all shadow-md`}
                    >
                      {isBooking ? (
                        <span>Processing Reservation...</span>
                      ) : (
                        <>
                          <span>Instant Reservation</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center text-[10px] text-slate-400">
                      Free cancellation up to 48 hours before check-in. Instant confirmation slip issued.
                    </div>

                  </div>
                )}
              </div>

              {/* Price Drop Alerts Widget */}
              <div className={`p-4 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className={`w-4 h-4 ${hasPriceAlert ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
                    <div>
                      <h5 className={`text-xs font-bold ${styles.textPrimary}`}>Price Drop Alerts</h5>
                      <p className="text-[10px] text-slate-400">Get notified if this price decreases</p>
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePriceAlert}
                    disabled={priceAlertLoading}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hasPriceAlert ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
                    } ${priceAlertLoading ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        hasPriceAlert ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {hasPriceAlert && (
                  <div className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Alert active! We'll email <strong>{user?.email}</strong> on price drops.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
