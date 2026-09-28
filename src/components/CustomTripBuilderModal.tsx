import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  X,
  Sparkles,
  Calendar,
  Users,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Shield,
  Utensils,
  Hotel,
  Landmark,
  Package,
  FileDown,
  Info,
  Heart,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Listing, CustomTripRequest, CustomTripDayItinerary } from '../types.ts';
import { customTripService } from '../services/customTripService.ts';

interface CustomTripBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableListings: Listing[];
  initialDestination?: string;
  initialListing?: Listing;
  onTripCreated?: (trip: CustomTripRequest) => void;
  onOpenTracker?: () => void;
}

export const CustomTripBuilderModal: React.FC<CustomTripBuilderModalProps> = ({
  isOpen,
  onClose,
  availableListings,
  initialDestination = '',
  initialListing,
  onTripCreated,
  onOpenTracker,
}) => {
  const { styles } = useTheme();
  const { user, token, setShowLoginModal } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Trip Essentials
  const [tripTitle, setTripTitle] = useState('My Curated Signature Escape');
  const [destination, setDestination] = useState(initialDestination || 'Santorini Island');
  const [country, setCountry] = useState('Greece');
  const [travelStyle, setTravelStyle] = useState<CustomTripRequest['travelStyle']>('ROMANTIC_HONEYMOON');
  const [budgetTier, setBudgetTier] = useState<CustomTripRequest['budgetTier']>('ELITE');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [durationDays, setDurationDays] = useState(4);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Step 2: Selected Listings & Day-by-Day Itinerary
  const [selectedListings, setSelectedListings] = useState<Listing[]>([]);
  const [itineraryDays, setItineraryDays] = useState<CustomTripDayItinerary[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<'ALL' | 'HOTEL' | 'FOOD' | 'PLACE'>('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Step 3: Inclusions & Preferences
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([
    '5-Star Boutique Stays with Breakfast',
    'VIP Airport Meet & Greet Chauffeur Transfer',
    '24/7 Dedicated Concierge Support & Table Reservations',
    'Verified Local Guided Excursions'
  ]);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(['Authentic Local Cuisine']);
  const [specialRequests, setSpecialRequests] = useState('');

  // Submission / Waiting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<CustomTripRequest | null>(null);

  // Popular Destination Presets
  const destinationPresets = [
    { name: 'Mannanthala, Trivandrum', country: 'India', vibe: 'LUXURY_WELLNESS', title: 'Kerala Ayurvedic Healing & Heritage Trail' },
    { name: 'Gion & Arashiyama', country: 'Japan', vibe: 'CULTURAL_HERITAGE', title: 'Kyoto Zen & Michelin Kaiseki Odyssey' },
    { name: 'Oia, Santorini Island', country: 'Greece', vibe: 'ROMANTIC_HONEYMOON', title: 'Aegean Caldera Sunset & Wine Tour' },
    { name: 'Ravello, Amalfi Coast', country: 'Italy', vibe: 'CULINARY_EXPLORER', title: 'Amalfi Coastline Clifftop & Gastronomy' },
    { name: 'Ginza & Shibuya', country: 'Japan', vibe: 'CULINARY_EXPLORER', title: 'Tokyo Omakase & Neon Cityscape' },
    { name: 'Saint-Germain-des-Prés', country: 'France', vibe: 'ROMANTIC_HONEYMOON', title: 'Parisian Haute Romance & Bistro Discovery' },
    { name: 'Lucerne & Zermatt', country: 'Switzerland', vibe: 'ADVENTURE_NATURE', title: 'Swiss Alpine Glacial & Lakes Panorama' },
  ];

  // Initialize with initialListing if provided
  useEffect(() => {
    if (initialListing) {
      setSelectedListings([initialListing]);
      if (initialListing.location) setDestination(initialListing.location);
      if (initialListing.country) setCountry(initialListing.country);
      setTripTitle(`Curated Journey: ${initialListing.title}`);
    }
  }, [initialListing]);

  // Synchronize Itinerary Days based on durationDays
  useEffect(() => {
    setItineraryDays((prev) => {
      const days: CustomTripDayItinerary[] = [];
      for (let i = 1; i <= durationDays; i++) {
        const existing = prev.find(p => p.day === i);
        if (existing) {
          days.push(existing);
        } else {
          days.push({
            day: i,
            title: i === 1 ? 'Arrival & VIP Welcome Reception' : i === durationDays ? 'Leisure, Spa & Chauffeured Departure' : `Day ${i}: Signature Local Exploration`,
            description: i === 1 
              ? `Chauffeured arrival in ${destination}, private check-in, and welcome refreshments.`
              : i === durationDays
              ? 'Morning relaxation, farewell souvenir gifting, and private airport transfer.'
              : `Curated excursions and dining experiences in ${destination}.`,
            customNotes: ''
          });
        }
      }
      return days;
    });
  }, [durationDays, destination]);

  // Pricing Calculation with Dynamic Bundle Savings
  const pricingSummary = useMemo(() => {
    const itemsTotal = selectedListings.reduce((sum, item) => {
      if (item.category === 'HOTEL') {
        return sum + (item.price * Math.max(1, durationDays - 1));
      }
      return sum + (item.price * (adults + children * 0.5));
    }, 0);

    const baseEstimate = itemsTotal > 0 ? itemsTotal : (durationDays * 120 * adults);
    const bundleDiscountPercent = selectedListings.length >= 3 ? 20 : selectedListings.length >= 2 ? 15 : 10;
    const discountAmount = Math.round((baseEstimate * bundleDiscountPercent) / 100);
    const finalPrice = Math.max(99, baseEstimate - discountAmount);

    return {
      baseEstimate,
      bundleDiscountPercent,
      discountAmount,
      finalPrice
    };
  }, [selectedListings, durationDays, adults, children]);

  if (!isOpen) return null;

  const toggleListingSelection = (listing: Listing) => {
    setSelectedListings(prev => {
      const exists = prev.some(l => l.id === listing.id);
      if (exists) {
        return prev.filter(l => l.id !== listing.id);
      } else {
        return [...prev, listing];
      }
    });
  };

  const handleInclusionToggle = (inc: string) => {
    setSelectedInclusions(prev => 
      prev.includes(inc) ? prev.filter(i => i !== inc) : [...prev, inc]
    );
  };

  const handleDietaryToggle = (pref: string) => {
    setDietaryPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleApplyPreset = (preset: typeof destinationPresets[0]) => {
    setDestination(preset.name);
    setCountry(preset.country);
    setTravelStyle(preset.vibe as any);
    setTripTitle(preset.title);
  };

  const handleSubmitCustomTrip = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const calculatedEndDate = new Date(new Date(startDate).getTime() + (durationDays - 1) * 86400000).toISOString().split('T')[0];

      const tripPayload: Partial<CustomTripRequest> = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.name,
        tripTitle: tripTitle.trim(),
        destination: destination.trim(),
        country: country.trim(),
        travelStyle,
        budgetTier,
        startDate,
        endDate: calculatedEndDate,
        durationDays,
        adults,
        children,
        selectedListingIds: selectedListings.map(l => l.id),
        selectedListings: selectedListings.map(l => ({
          id: l.id,
          title: l.title,
          category: l.category,
          price: l.price,
          location: l.location,
          image: l.images[0] || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
        })),
        itinerary: itineraryDays,
        inclusions: selectedInclusions,
        dietaryPreferences: dietaryPrefs,
        specialRequests: specialRequests.trim(),
        estimatedTotal: pricingSummary.baseEstimate,
        bundleDiscount: pricingSummary.bundleDiscountPercent,
        finalPrice: pricingSummary.finalPrice,
        status: 'SUBMITTED',
      };

      const result = await customTripService.createTrip(tripPayload, token || undefined);
      setCreatedTrip(result);
      onTripCreated?.(result);
      setStep(5); // Move to Waiting / Concierge Review state
    } catch (err) {
      console.error('Failed to submit custom trip request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableInclusionOptions = [
    '5-Star Boutique Stays with Breakfast',
    'VIP Airport Meet & Greet Chauffeur Transfer',
    '24/7 Dedicated Concierge Support & Table Reservations',
    'Verified Local Guided Excursions',
    'Ayurvedic Wellness & Spa Rejuvenation Pass',
    'Private Speedboat / Luxury Yacht Excursion',
    'Comprehensive Travel & Medical Insurance',
    'Michelin-Starred Priority Reservations',
    'SIM Card / High-Speed Portable Wi-Fi Device',
  ];

  const dietaryOptions = [
    'Authentic Local Cuisine',
    'Kerala Sadhya & Plantain Leaf Banquet',
    'Strictly Vegetarian',
    'Vegan & Organic',
    'Halal Certified',
    'Gluten-Free & Celiac Safe',
    'Seafood Specialist',
  ];

  const filteredCatalog = availableListings.filter(l => {
    if (catalogFilter !== 'ALL' && l.category !== catalogFilter) return false;
    if (!catalogSearch.trim()) return true;
    const raw = catalogSearch.trim().toLowerCase();
    const norm = raw.replace(/[^a-z0-9]/g, '');
    const fuzzy = raw.replace(/nn/g, 'n').replace(/mm/g, 'm').replace(/ll/g, 'l');

    const testMatch = (text?: string): boolean => {
      if (!text) return false;
      const lower = text.toLowerCase();
      if (lower.includes(raw)) return true;
      if (lower.replace(/[^a-z0-9]/g, '').includes(norm)) return true;
      return lower.replace(/nn/g, 'n').replace(/mm/g, 'm').replace(/ll/g, 'l').includes(fuzzy);
    };

    return (
      testMatch(l.title) ||
      testMatch(l.location) ||
      testMatch(l.country) ||
      testMatch(l.description) ||
      l.tags?.some(t => testMatch(t)) ||
      l.amenities?.some(a => testMatch(a))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-5xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}>
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-sky-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg sm:text-xl font-black tracking-tight ${styles.textPrimary}`}>
                  Custom Trip & Tour Package Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Concierge Tailored
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Design your personalized luxury itinerary, calculate bundle savings, and receive tailored concierge quotes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTracker && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTracker();
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${styles.border} ${styles.textSecondary} hover:${styles.cardBg} transition-all`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>My Inquiries</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl text-slate-400 hover:${styles.textPrimary} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progression Bar (Steps 1 to 4) */}
        {step !== 5 && (
          <div className="px-6 py-3 border-b border-slate-200/40 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between overflow-x-auto text-xs">
            {[
              { num: 1, label: 'Trip Blueprint' },
              { num: 2, label: 'Itinerary & Experiences' },
              { num: 3, label: 'Inclusions & Wishlist' },
              { num: 4, label: 'Review & Package Quote' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                  step === s.num
                    ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                    : step > s.num
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  step === s.num ? 'bg-white text-amber-600' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">

          {/* STEP 1: Trip Essentials & Presets */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Destination Presets */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Popular Destination Curations</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Click to autofill</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {destinationPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        destination.includes(preset.name)
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500'
                          : `border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30`
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{preset.country}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Primary Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                    Custom Trip Title
                  </label>
                  <input
                    type="text"
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    placeholder="e.g. Kerala Ayurvedic Retreat & Heritage Sadhya"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-all ${styles.inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                    Destination City / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Mannanthala, Trivandrum"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-all ${styles.inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Duration, Start Date, Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                    Departure Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none ${styles.inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                    Trip Duration ({durationDays} Days / {Math.max(1, durationDays - 1)} Nights)
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 7, 10].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          durationDays === d
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                    Party Size ({adults} Adults, {children} Kids)
                  </label>
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Adults:</span>
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Kids:</span>
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Style & Budget Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-600 dark:text-slate-300">
                    Travel Vibe & Focus
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'LUXURY_WELLNESS', label: '🌿 Ayurveda & Wellness' },
                      { id: 'CULTURAL_HERITAGE', label: '🏛️ Heritage & Temples' },
                      { id: 'CULINARY_EXPLORER', label: '🍽️ Gastronomy & Sadhya' },
                      { id: 'ROMANTIC_HONEYMOON', label: '✨ Romantic Escapes' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setTravelStyle(st.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          travelStyle === st.id
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-600 dark:text-slate-300">
                    Service & Luxury Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'SMART', label: 'Smart Boutique', desc: '4-Star Curated' },
                      { id: 'PREMIUM', label: 'Premium Gold', desc: '5-Star Luxury' },
                      { id: 'ELITE', label: 'Elite Royal VIP', desc: 'Presidential Concierge' },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setBudgetTier(tier.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          budgetTier === tier.id
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{tier.label}</div>
                        <div className="text-[10px] text-slate-400">{tier.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Selected Listings & Day-by-Day Itinerary */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left Side: Dynamic Day-by-Day Itinerary */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${styles.textPrimary} flex items-center gap-2`}>
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{durationDays}-Day Schedule Blueprint</span>
                    </h3>
                    <span className="text-xs text-amber-500 font-semibold">
                      {selectedListings.length} Experiences Attached
                    </span>
                  </div>

                  <div className="space-y-3">
                    {itineraryDays.map((dayItem, idx) => (
                      <div
                        key={dayItem.day}
                        className={`p-4 rounded-2xl border ${styles.border} bg-slate-50/50 dark:bg-slate-900/40 space-y-2`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px] uppercase">
                            Day {dayItem.day}
                          </span>
                          <input
                            type="text"
                            value={dayItem.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItineraryDays(prev => prev.map(d => d.day === dayItem.day ? { ...d, title: val } : d));
                            }}
                            className="text-xs font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 outline-none flex-1 mx-3"
                          />
                        </div>

                        <textarea
                          rows={2}
                          value={dayItem.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItineraryDays(prev => prev.map(d => d.day === dayItem.day ? { ...d, description: val } : d));
                          }}
                          placeholder="Describe activities, transfers, or dining for this day..."
                          className={`w-full p-2 rounded-xl text-xs border ${styles.border} ${styles.inputBg} outline-none`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Catalog Item Selector */}
                <div className="w-full lg:w-96 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-6 pt-4 lg:pt-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Add from Verified Catalog
                    </h4>
                    <span className="text-[10px] text-slate-400">{filteredCatalog.length} items</span>
                  </div>

                  {/* Filter chips & Search */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search Mannanthala, Kyoto, hotels..."
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${styles.inputBg}`}
                    />
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {(['ALL', 'HOTEL', 'FOOD', 'PLACE'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCatalogFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            catalogFilter === cat
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Catalog List */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {filteredCatalog.map((item) => {
                      const isSelected = selectedListings.some(l => l.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30'
                          }`}
                        >
                          <img
                            src={item.images[0] || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=200&q=80'}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">{item.title}</div>
                            <div className="text-[10px] text-slate-500 truncate">{item.location}, {item.country}</div>
                            <div className="text-[10px] font-bold text-amber-500">${item.price} / {item.category === 'HOTEL' ? 'night' : 'guest'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleListingSelection(item)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                              isSelected
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white'
                            }`}
                          >
                            {isSelected ? '✓ Added' : '+ Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Concierge Inclusions & Custom Wishlist */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Concierge Inclusions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Included VIP Concierge Perks & Amenities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {availableInclusionOptions.map((inc) => {
                    const isChecked = selectedInclusions.includes(inc);
                    return (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => handleInclusionToggle(inc)}
                        className={`p-3 rounded-2xl border text-left text-xs font-medium flex items-center justify-between gap-2 transition-all ${
                          isChecked
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{inc}</span>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-amber-500 text-white font-bold' : 'border border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Culinary & Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((diet) => {
                    const isSelected = dietaryPrefs.includes(diet);
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => handleDietaryToggle(diet)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {diet}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Requests & Wishlist */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-300">
                  Special Notes, Anniversaries or Custom Wishlist
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Celebrating 10th anniversary, request high-floor ocean view villa in Mannanthala, private car pickup with English speaking driver..."
                  className={`w-full p-3 rounded-2xl border text-xs ${styles.border} ${styles.inputBg} outline-none`}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review & Live Package Pricing */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Itinerary Summary */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-base font-extrabold ${styles.textPrimary}`}>{tripTitle}</h3>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                        {durationDays} Days / {Math.max(1, durationDays - 1)} Nights
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-4">
                      <span>📍 {destination}, {country}</span>
                      <span>👥 {adults} Adults {children > 0 ? `• ${children} Kids` : ''}</span>
                      <span>📅 Departs {startDate}</span>
                    </div>
                  </div>

                  {/* Attached Catalog Items */}
                  {selectedListings.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Included Accommodations & Experiences ({selectedListings.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedListings.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border ${styles.border} bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2.5`}
                          >
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">{item.title}</div>
                              <div className="text-[10px] text-slate-400">{item.location}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inclusions summary */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      VIP Inclusions & Services ({selectedInclusions.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInclusions.map((inc) => (
                        <span
                          key={inc}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                        >
                          ✓ {inc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Price Calculator & Submit Card */}
                <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-xl flex flex-col justify-between space-y-6`}>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Package Price Breakdown
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Individual Items Total:</span>
                        <span className="font-semibold">${pricingSummary.baseEstimate}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Package Bundle Savings ({pricingSummary.bundleDiscountPercent}%):</span>
                        <span>-${pricingSummary.discountAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Concierge Planning Fee:</span>
                        <span className="text-emerald-600 font-bold">FREE ($0)</span>
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated Package Total</div>
                          <div className="text-2xl font-black text-amber-500">${pricingSummary.finalPrice}</div>
                        </div>
                        <div className="text-right text-[10px] text-slate-400">
                          <div>All Taxes & VIP</div>
                          <div>Concierge Included</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      id="submit-custom-trip-btn"
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmitCustomTrip}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Compass className="w-4 h-4 animate-spin" />
                          <span>Transmitting to Concierge...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Submit Custom Trip for Quote</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      No immediate payment needed. Our private travel concierge will review your schedule and respond within 2-4 hours.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 5: Live Waiting State & Concierge Review Tracker */}
          {step === 5 && createdTrip && (
            <div className="py-6 px-4 max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className={`text-xl font-black ${styles.textPrimary}`}>
                  Custom Package Request Transmitted!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your personalized itinerary is currently under live review by our senior travel designers.
                </p>
              </div>

              {/* Status Timeline */}
              <div className={`p-4 rounded-2xl border ${styles.border} bg-slate-50/50 dark:bg-slate-900/40 text-left space-y-3`}>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Inquiry ID:</span>
                  <span className="font-mono font-bold text-amber-500">{createdTrip.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-bold">{createdTrip.destination}, {createdTrip.country}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    ● Under Concierge Review
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Estimated Concierge Quotation Time: <strong>~2 to 4 Hours</strong></span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {onOpenTracker && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTracker();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Track Inquiries in My Trips</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs border ${styles.border} ${styles.textSecondary} hover:${styles.cardBg} transition-all`}
                >
                  Return to Explorer
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons (Steps 1 to 4) */}
        {step !== 5 && (
          <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${styles.border} ${styles.textSecondary} hover:${styles.cardBg} transition-all flex items-center gap-1.5`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">Step {step} of 4</span>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((step + 1) as any)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
