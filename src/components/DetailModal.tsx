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
  BellOff,
  Package,
  Layers,
  Compass,
  Download,
  FileText,
  PlaneLanding,
  PlaneTakeoff,
  Navigation,
  Flag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { Listing, Booking, PriceAlert, Review } from '../types.ts';
import { FirebaseSyncService } from '../services/firebase.ts';
import { AuthAudit } from '../services/authAudit.ts';
import { UserReviewsSection } from './UserReviewsSection.tsx';
import { ZipArchiveService } from '../services/zipExportService.ts';
import { AlbaniaPdfService } from '../services/albaniaPdfService.ts';
import { PromoService, PromoVoucher } from '../services/promoService.ts';
import { VirtualTourModal } from './VirtualTourModal.tsx';

interface DetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (listing: Listing) => void;
  onBookingSuccess?: (booking: Booking) => void;
  onCreatePackage?: (listing: Listing) => void;
  onCustomTripBuild?: (listing: Listing) => void;
  onOpenAlbaniaModal?: (tier?: 'basic' | 'midrange' | 'luxury') => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  listing,
  onClose,
  isSaved,
  onToggleSave,
  onBookingSuccess,
  onCreatePackage,
  onCustomTripBuild,
  onOpenAlbaniaModal,
}) => {
  const { styles } = useTheme();
  const { user, token, setShowLoginModal } = useAuth();
  const { formatPrice } = useCurrency();

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
  const [isVirtualTourOpen, setIsVirtualTourOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [promoInput, setPromoInput] = useState(() => PromoService.getActivePromo()?.code || '');
  const [appliedPromo, setAppliedPromo] = useState<PromoVoucher | null>(() => PromoService.getActivePromo());
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Sync if promo code in localStorage changes
  React.useEffect(() => {
    const active = PromoService.getActivePromo();
    if (active) {
      setAppliedPromo(active);
      setPromoInput(active.code);
    }
  }, [listing]);

  const handleApplyPromo = () => {
    const res = PromoService.validateCode(promoInput);
    if (res.valid && res.promo) {
      setAppliedPromo(res.promo);
      PromoService.setActivePromo(res.promo.code);
      setPromoMessage({ text: res.message, isError: false });
    } else {
      setPromoMessage({ text: res.message, isError: true });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    PromoService.clearActivePromo();
    setPromoInput('');
    setPromoMessage(null);
  };

  const [hasPriceAlert, setHasPriceAlert] = useState(false);
  const [priceAlertLoading, setPriceAlertLoading] = useState(false);
  const [priceAlertId, setPriceAlertId] = useState<string | null>(null);

  const [liveRating, setLiveRating] = useState<number | null>(null);
  const [liveReviewCount, setLiveReviewCount] = useState<number | null>(null);
  const [includedListings, setIncludedListings] = useState<Listing[]>([]);
  const [loadingIncluded, setLoadingIncluded] = useState(false);

  React.useEffect(() => {
    if (listing?.category === 'PACKAGE' && listing.listingIds?.length) {
      const fetchIncluded = async () => {
        setLoadingIncluded(true);
        try {
          // Fetch all listings once and filter, much more efficient for the app's current scale
          const res = await fetch('/api/listings');
          if (res.ok) {
            const allListings: Listing[] = await res.json();
            const filtered = listing.listingIds!.map(id => 
              allListings.find(l => l.id === id)
            ).filter((l): l is Listing => !!l);
            setIncludedListings(filtered);
          }
        } catch (err) {
          console.warn('Failed to fetch included listings:', err);
        } finally {
          setLoadingIncluded(false);
        }
      };
      fetchIncluded();
    } else {
      setIncludedListings([]);
    }
  }, [listing?.id, listing?.listingIds]);

  React.useEffect(() => {
    if (listing) {
      setLiveRating(listing.rating);
      setLiveReviewCount(listing.reviewCount);
    }
  }, [listing?.id]);

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
  const rawTotal = subtotal + serviceFee + taxes;
  const discountAmount = appliedPromo ? Math.round(rawTotal * (appliedPromo.discountPercent / 100)) : 0;
  const totalPrice = Math.max(0, rawTotal - discountAmount);

  // Competitor comparisons
  const competitor1Price = Math.round(rawTotal * 1.22);
  const competitor2Price = Math.round(rawTotal * 1.15);
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
          promoCode: appliedPromo?.code,
          discountAmount,
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
            {listing.duration && (
              <>
                <span className="text-slate-300 mx-1">•</span>
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  <Clock className="w-3 h-3" />
                  <span>{listing.duration}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const shareText = `Check out ${listing.title} in ${listing.location} for ${formatPrice(listing.price)}!\n${listing.description}`;
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
              className={`p-2 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
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
                <button
                  type="button"
                  id="detail-modal-reviews-trigger"
                  onClick={() => {
                    const el = document.getElementById('user-reviews-section');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex items-center gap-1 text-amber-500 font-bold hover:underline cursor-pointer text-left"
                  title="Click to view verified guest reviews"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{(liveRating !== null ? liveRating : listing.rating).toFixed(2)}</span>
                  <span className="text-slate-400 font-normal">({liveReviewCount !== null ? liveReviewCount : listing.reviewCount} verified guest reviews)</span>
                </button>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Content
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-normal">
                {listing.category === 'PACKAGE' ? 'Total Bundle Price' : 'Platform Direct Rate'}
              </span>
              <div className={`text-2xl sm:text-3xl font-black ${listing.category === 'PACKAGE' ? 'text-amber-500' : 'text-sky-500'}`}>
                {formatPrice(listing.price)}
                <span className="text-xs text-slate-400 font-normal"> {listing.category === 'HOTEL' ? '/ night' : listing.category === 'PACKAGE' ? '' : '/ experience'}</span>
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-3">
            <div className="aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative group">
              <img
                src={listing.images[activeImageIndex] || listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setIsVirtualTourOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-black/80 hover:bg-black backdrop-blur-md border border-white/20 text-white font-black text-xs shadow-xl shadow-black/40 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-sky-400 animate-spin-slow" />
                  <span>🌐 Enter 360° Virtual Tour</span>
                </button>
              </div>
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
              
              {/* Admin Convert to Package Banner */}
              {user && ['ADMIN', 'TECH_ADMIN', 'TECH_SUBADMIN'].includes(user.role) && listing.category !== 'PACKAGE' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${styles.textPrimary}`}>Admin Tour Package Generator</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Transform this post into a multi-day luxury travel package</div>
                    </div>
                  </div>
                  <button
                    id="admin-create-package-from-modal-btn"
                    type="button"
                    onClick={() => {
                      onClose();
                      onCreatePackage?.(listing);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Package from this Post</span>
                  </button>
                </div>
              )}

              {/* Overview */}
              <div>
                <h3 className={`text-base font-bold mb-2 ${styles.textPrimary}`}>
                  Experience Overview
                </h3>
                <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>
                  {listing.description}
                </p>
              </div>

              {/* Trip Milestones & Itinerary Timeline */}
              <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${styles.textPrimary}`}>Trip Milestones & Itinerary Timeline</h4>
                      <p className={`text-[11px] ${styles.textMuted}`}>Visualizing key stops, arrivals, and departures</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Interactive Timeline
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-sky-500 before:via-amber-500 before:to-emerald-500">
                  {/* Milestone 1: Arrival & Tirana */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-sky-500/30 ring-4 ring-white dark:ring-slate-900">
                      <PlaneLanding className="w-3 h-3" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
                        <span>Day 1 • Arrival & Tirana Historic Centre</span>
                        <span className="text-[10px] text-slate-400">09:00 Arrival</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Arrival at Tirana International Airport (TIA), check-in to boutique hotel, explore Skanderbeg Square, Et’hem Bey Mosque, Clock Tower, and Bunk’Art 2.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 2: Mount Dajti & Berat */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-amber-500/30 ring-4 ring-white dark:ring-slate-900">
                      <Compass className="w-3 h-3" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                        <span>Day 2 • Mount Dajti Cable Car & Berat Fortress</span>
                        <span className="text-[10px] text-slate-400">Scenic Drive</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Ride the Dajti Ekspres cable car over Tirana, then journey south to UNESCO-listed Berat (City of a Thousand Windows) and Onufri Museum.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 3: Gjirokastër & Blue Eye */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-indigo-500/30 ring-4 ring-white dark:ring-slate-900">
                      <MapPin className="w-3 h-3" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        <span>Day 3 • Syri i Kaltër Blue Eye & Gjirokastër Stone City</span>
                        <span className="text-[10px] text-slate-400">Karst Spring</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Marvel at the mesmerizing turquoise waters of the Blue Eye spring, followed by an afternoon tour of Gjirokastër stone castle and Skënduli house.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 4: Ksamil & Butrint */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-900">
                      <Flag className="w-3 h-3" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        <span>Day 4 • Ksamil Islands Cruise & Butrint UNESCO Park</span>
                        <span className="text-[10px] text-slate-400">Ionian Coast</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Private boat cruise around Ksamil's 4 idyllic turquoise islands, relaxing on Bora Bora white sands, and exploring ancient Greco-Roman ruins at Butrint.
                      </p>
                    </div>
                  </div>

                  {/* Milestone 5: Departure */}
                  <div className="relative group">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-rose-500/30 ring-4 ring-white dark:ring-slate-900">
                      <PlaneTakeoff className="w-3 h-3" />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                        <span>Day 9 • Riviera Panoramas & Return Flight</span>
                        <span className="text-[10px] text-slate-400">Departure TIA</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Scenic drive across Llogara Pass, Vlorë bay viewpoints, and comfortable return flight connection back to India.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Components */}
              {listing.category === 'PACKAGE' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-500" />
                    <h3 className={`text-base font-bold ${styles.textPrimary}`}>
                      Included in this Luxury Bundle
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {loadingIncluded ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className={`h-24 rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800`} />
                      ))
                    ) : includedListings.map(inc => (
                      <div key={inc.id} className={`flex gap-3 p-3 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
                        <img src={inc.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-extrabold text-sky-500 uppercase">{inc.category}</span>
                          <h4 className={`text-xs font-bold truncate ${styles.textPrimary}`}>{inc.title}</h4>
                          <p className={`text-[10px] truncate ${styles.textMuted}`}>{inc.location}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold text-slate-500">{inc.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400">{formatPrice(totalPrice)}</div>
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
                      <div className="text-xs font-semibold text-slate-500 line-through">{formatPrice(competitor1Price)}</div>
                      <div className="text-[10px] text-rose-500 font-medium">+{formatPrice(memberSavings)} more</div>
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
                      <div className="text-xs font-semibold text-slate-500 line-through">{formatPrice(competitor2Price)}</div>
                      <div className="text-[10px] text-rose-500 font-medium">+{formatPrice(competitor2Price - totalPrice)} more</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Reviews & Ratings Section */}
              <UserReviewsSection
                listing={listing}
                onReviewAdded={(_newRev, avg, count) => {
                  setLiveRating(avg);
                  setLiveReviewCount(count);
                }}
              />

            </div>

            {/* Right Column: Hotel Booking Engine Widget */}
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-lg sticky top-2`}>
                <h4 className={`text-base font-bold mb-3 ${styles.textPrimary}`}>
                  {listing.category === 'HOTEL' ? 'Reserve Hotel Stay' : listing.category === 'PACKAGE' ? 'Reserve Bundle' : 'Book Experience'}
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
                        <span className="font-bold text-sky-500">{formatPrice(bookingConfirmed.totalPrice)}</span>
                      </div>
                      {bookingConfirmed.discountAmount ? (
                        <div className="flex justify-between text-emerald-500 font-medium">
                          <span>Voucher Savings ({bookingConfirmed.promoCode || 'Promo'}):</span>
                          <span>-{formatPrice(bookingConfirmed.discountAmount)}</span>
                        </div>
                      ) : null}
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

                    {/* Travel Voucher & Promo Code Section */}
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Travel Voucher / Promo</span>
                        </label>
                        {appliedPromo && (
                          <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {appliedPromo.discountPercent}% OFF APPLIED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. VOYAGE10, ALBANIA15"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          disabled={Boolean(appliedPromo)}
                          className={`flex-1 p-2 text-xs rounded-xl outline-none font-mono uppercase tracking-wider ${styles.inputBg} ${
                            appliedPromo ? 'border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold' : ''
                          }`}
                        />
                        {appliedPromo ? (
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="px-2.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            Apply
                          </button>
                        )}
                      </div>

                      {promoMessage && (
                        <div
                          className={`text-[11px] mt-1 font-medium ${
                            promoMessage.isError ? 'text-rose-500' : 'text-emerald-500'
                          }`}
                        >
                          {promoMessage.text}
                        </div>
                      )}
                    </div>

                    {/* Price breakdown */}
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>{formatPrice(listing.price)} × {daysCount} {listing.category === 'HOTEL' ? 'nights' : 'guest(s)'}</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Platform Concierge & Service Fee</span>
                        <span>{formatPrice(serviceFee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>City & Tourism Taxes</span>
                        <span>{formatPrice(taxes)}</span>
                      </div>

                      {appliedPromo && discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Voucher Discount ({appliedPromo.code} -{appliedPromo.discountPercent}%)</span>
                          </span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-sm">
                        <span className={styles.textPrimary}>Total Due</span>
                        <div className="text-right">
                          {appliedPromo && discountAmount > 0 && (
                            <span className="text-xs text-slate-400 line-through mr-2 font-normal">
                              {formatPrice(rawTotal)}
                            </span>
                          )}
                          <span className="text-sky-500">{formatPrice(totalPrice)}</span>
                        </div>
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

                    {/* Custom Trip Planner Trigger */}
                    {onCustomTripBuild && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onCustomTripBuild(listing);
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-500" />
                        <span>Add to Custom Trip & Package Planner</span>
                      </button>
                    )}

                    {/* View 9-Day Itinerary PDF */}
                    {(listing.country === 'Albania' || listing.location?.includes('Albania') || listing.tags?.some(t => t.toLowerCase().includes('albania')) || listing.category === 'PACKAGE') && (
                      <button
                        type="button"
                        onClick={() => {
                          const tier = listing.id.includes('luxury') ? 'luxury' : listing.id.includes('basic') ? 'basic' : 'midrange';
                          if (onOpenAlbaniaModal) {
                            onOpenAlbaniaModal(tier);
                          } else {
                            AlbaniaPdfService.generateTierPdf(tier);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <FileText className="w-4 h-4 text-sky-500" />
                        <span>View 9-Day Itinerary (PDF)</span>
                      </button>
                    )}

                    {/* Download Offline Destination ZIP Bundle - ADMIN ONLY */}
                    {user && ['ADMIN', 'TECH_ADMIN', 'TECH_SUBADMIN'].includes(user.role) && (
                      <button
                        type="button"
                        onClick={() => ZipArchiveService.exportTripPackageZip(listing.title, {
                          ...listing,
                          bookingDetails: { checkInDate, checkOutDate, guests, totalPrice, serviceFee, taxes }
                        })}
                        className="w-full py-2 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                        title="Download offline itinerary, guides, and JSON package as ZIP (Admin Only)"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Destination Package ZIP (Admin)</span>
                      </button>
                    )}

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

      <VirtualTourModal
        isOpen={isVirtualTourOpen}
        onClose={() => setIsVirtualTourOpen(false)}
        title={listing.title}
        location={listing.location}
        country={listing.country}
        imageUrl={listing.images[activeImageIndex] || listing.images[0]}
      />
    </div>
  );
};
