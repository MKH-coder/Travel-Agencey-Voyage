import React, { useState } from 'react';
import {
  X,
  Calendar,
  Plane,
  Download,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Share2,
  ExternalLink,
  Info,
  Instagram,
  Star
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';
import {
  ALBANIA_PACKAGE_TIERS,
  ALBANIA_DAYS_ITINERARY,
  ALBANIA_PACKAGE_INCLUSIONS,
  ALBANIA_TIER_COMPARISON_ROWS,
  PackageTierInfo
} from '../data/albaniaItineraryData.ts';
import { AlbaniaTierReviewsSection } from './AlbaniaTierReviewsSection.tsx';
import { AlbaniaPdfService } from '../services/albaniaPdfService.ts';
import { Listing } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface AlbaniaItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookTier?: (tierId: 'basic' | 'midrange' | 'luxury') => void;
  defaultTier?: 'basic' | 'midrange' | 'luxury';
}

export const AlbaniaItineraryModal: React.FC<AlbaniaItineraryModalProps> = ({
  isOpen,
  onClose,
  onBookTier,
  defaultTier = 'midrange'
}) => {
  const { styles } = useTheme();
  const { formatPrice, currency } = useCurrency();
  const [selectedTier, setSelectedTier] = useState<'basic' | 'midrange' | 'luxury'>(defaultTier);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'comparison' | 'reviews' | 'flights' | 'pdf'>('itinerary');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [downloadingTier, setDownloadingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTierInfo = ALBANIA_PACKAGE_TIERS[selectedTier];

  // Base USD ranges for package tiers
  const TIER_USD_PRICES: Record<'basic' | 'midrange' | 'luxury', { min: number; max: number; fourPaxMin: number; fourPaxMax: number }> = {
    basic: { min: 1334, max: 1520, fourPaxMin: 5336, fourPaxMax: 6080 },
    midrange: { min: 1723, max: 2011, fourPaxMin: 6892, fourPaxMax: 8044 },
    luxury: { min: 5100, max: 5690, fourPaxMin: 20400, fourPaxMax: 22760 },
  };

  const getTierConvertedPrice = (tierKey: 'basic' | 'midrange' | 'luxury') => {
    if (currency === 'INR') {
      return ALBANIA_PACKAGE_TIERS[tierKey].estimatePerPerson;
    }
    const { min, max } = TIER_USD_PRICES[tierKey];
    return `${formatPrice(min)} – ${formatPrice(max)}`;
  };

  const handleDownload = (tierId: 'basic' | 'midrange' | 'luxury') => {
    setDownloadingTier(tierId);
    try {
      AlbaniaPdfService.generateTierPdf(tierId);
      AuthAudit.showToast({
        title: 'PDF Downloaded',
        message: `Albania 9-Day Itinerary (${tierId.toUpperCase()}) PDF generated successfully.`,
        type: 'success'
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloadingTier(null);
    }
  };

  const handleDownloadComparison = () => {
    setDownloadingTier('comparison');
    try {
      AlbaniaPdfService.generateComparisonPdf();
      AuthAudit.showToast({
        title: 'Comparison PDF Downloaded',
        message: '3-Tier Albania Comparison PDF generated successfully.',
        type: 'success'
      });
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setDownloadingTier(null);
    }
  };

  const handleBook = () => {
    if (onBookTier) {
      onBookTier(selectedTier);
    }
    AuthAudit.showToast({
      title: 'Booking Inquiry Sent',
      message: `Reserved your spot for Albania 9-Day ${currentTierInfo.title}. Our concierge (+91 9567465134) will reach out!`,
      type: 'success',
      duration: 7000
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-5xl rounded-[2.5rem] border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}>
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-sm">
              🇦🇱
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-lg sm:text-xl font-black ${styles.textPrimary} tracking-tight`}>
                  Albania 9-Day Grand Expedition
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  9–19 Oct 2026
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/25 hover:bg-amber-500/20 transition-all cursor-pointer"
                  title="Click to view verified customer reviews for each tier"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>4.96 ★ Tier Reviews</span>
                </button>
              </div>
              <p className={`text-xs ${styles.textMuted}`}>
                Official Itinerary PDF & Multi-Tier Package Guide • Tirana to Riviera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload(selectedTier)}
              disabled={downloadingTier !== null}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Download official PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingTier === selectedTier ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tier Selector Ribbon */}
        <div className="px-6 py-3 border-b border-slate-200/40 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Tier:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-200/50 dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800">
              {(['basic', 'midrange', 'luxury'] as const).map(tierKey => {
                const isSelected = selectedTier === tierKey;
                const tier = ALBANIA_PACKAGE_TIERS[tierKey];
                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedTier(tierKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{tier.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {tier.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Estimate:</span>
            <span className="font-mono font-bold text-amber-500 text-sm">
              {getTierConvertedPrice(selectedTier)}
            </span>
            <span className="text-[11px] text-slate-400">/ person</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 flex border-b border-slate-200/40 dark:border-slate-800/60 overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'itinerary', label: 'Day-by-Day Route', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'comparison', label: '3-Tier Comparison', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'reviews', label: 'Customer Reviews (4.96 ★)', icon: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> },
            { id: 'flights', label: 'Flight Plan (TRV ⇄ TIA)', icon: <Plane className="w-3.5 h-3.5" /> },
            { id: 'pdf', label: 'Official PDF Dossier', icon: <FileText className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: DAY-BY-DAY ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              
              {/* Route Banner */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Route at a Glance</span>
                  </div>
                  <p className={`text-xs ${styles.textPrimary} font-medium leading-relaxed`}>
                    Tirana → Berat → Gjirokastër → Blue Eye → Sarandë → Ksamil → Butrint → Porto Palermo → Himarë → Jalë → Dhërmi → Llogara → Vlorë → Tirana
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Duration</span>
                  <div className="text-xs font-black text-amber-500">9 Days / 8 Nights</div>
                </div>
              </div>

              {/* Arrival Night Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span>Arrival Night • 9 October 2026</span>
                  <span className="text-sky-500">Tirana International Airport (TIA)</span>
                </div>
                <p className={`text-xs ${styles.textSecondary}`}>
                  {selectedTier === 'luxury'
                    ? '18:30 — Arrive at TIA via Athens. Private transfer to Tirana luxury hotel, check-in, rest and enjoy a relaxed light welcome dinner.'
                    : '23:45 — Arrive at TIA via Milan. Terminal exit, pre-arranged transfer to Tirana hotel, check-in and full overnight rest. Sightseeing commences 09:00 next morning.'}
                </p>
              </div>

              {/* Day List Accordion */}
              <div className="space-y-3">
                {ALBANIA_DAYS_ITINERARY.map(day => {
                  const isExpanded = expandedDay === day.dayNumber;
                  const daySpend = day.estimatedSpend[selectedTier];

                  return (
                    <div
                      key={day.dayNumber}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? `border-sky-500/40 ${styles.cardBg} shadow-md`
                          : `border-slate-200/50 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700`
                      }`}
                    >
                      {/* Day Header Accordion Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                        className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                            isExpanded ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            D{day.dayNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {day.dateStr}
                              </span>
                              <span className="text-[10px] font-mono text-amber-500 font-semibold">
                                Spend: {daySpend}
                              </span>
                            </div>
                            <h4 className={`text-sm font-bold ${styles.textPrimary}`}>
                              {day.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="hidden sm:inline text-xs text-slate-400 font-medium truncate max-w-xs">
                            {day.routeTitle}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-sky-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Day Details Body */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-slate-200/40 dark:border-slate-800/60 space-y-4">
                          {/* Authentic Location Photo */}
                          {day.image && (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-md group">
                              <img
                                src={day.image}
                                alt={day.photoCaption || day.title}
                                className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                                <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>Day {day.dayNumber} Verified Albania Location</span>
                                </div>
                                <p className="text-white text-xs sm:text-sm font-semibold drop-shadow-sm">
                                  {day.photoCaption || day.routeTitle}
                                </p>
                              </div>
                            </div>
                          )}

                          <p className={`text-xs ${styles.textSecondary} leading-relaxed italic bg-slate-100/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800`}>
                            {day.detail}
                          </p>

                          {/* Timetable */}
                          <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                  <th className="p-2.5">Time</th>
                                  <th className="p-2.5">Activity</th>
                                  <th className="p-2.5">Duration</th>
                                  <th className="p-2.5">Cost / Notes</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {day.activities.map((act, actIdx) => (
                                  <tr key={actIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="p-2.5 font-bold font-mono text-sky-500 whitespace-nowrap">
                                      {act.time}
                                    </td>
                                    <td className={`p-2.5 font-semibold ${styles.textPrimary}`}>
                                      {act.activity}
                                    </td>
                                    <td className="p-2.5 text-slate-400 whitespace-nowrap">
                                      {act.duration}
                                    </td>
                                    <td className="p-2.5 text-slate-500 dark:text-slate-300">
                                      {act.costNotes}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Day Spend Banner */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                            <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px]">
                              {currentTierInfo.title} Estimated Spend for Day {day.dayNumber}:
                            </span>
                            <span className="font-mono font-black text-amber-500 text-sm">
                              {daySpend}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day-by-Day Reviews Prompt */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className={`text-xs ${styles.textPrimary} font-medium`}>
                    <strong>99% Guest Recommendation</strong> across all 9-day route stops. Want to see verified feedback for the <strong>{currentTierInfo.title}</strong>?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <span>See {currentTierInfo.title} Reviews →</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 3-TIER COMPARISON MATRIX */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <h3 className={`text-lg font-black ${styles.textPrimary}`}>
                  Three Package Levels • One 9-Day Route
                </h3>
                <p className={`text-xs ${styles.textMuted}`}>
                  The itinerary and route stay the same across all three packages. Package tiers change the airfare cabin, accommodation luxury, dining allowance, and transport style.
                </p>
              </div>

              {/* 3 Tier Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['basic', 'midrange', 'luxury'] as const).map(tierKey => {
                  const t = ALBANIA_PACKAGE_TIERS[tierKey];
                  const isCur = selectedTier === tierKey;
                  return (
                    <div
                      key={tierKey}
                      onClick={() => setSelectedTier(tierKey)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                        isCur
                          ? 'border-sky-500 bg-sky-500/5 ring-2 ring-sky-500/20 shadow-lg'
                          : `border-slate-200 dark:border-slate-800 ${styles.cardBg} hover:border-slate-300 dark:hover:border-slate-700`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-sky-500">
                          {t.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {t.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-amber-500">
                          {getTierConvertedPrice(tierKey)}
                        </div>
                        <div className="text-[11px] text-slate-400">per person</div>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
                        <div><strong>4 People:</strong> {t.estimateFourPax}</div>
                        <div><strong>Airfare:</strong> {t.airfarePerPerson}</div>
                        <div><strong>Land:</strong> {t.landPackagePerPerson}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-sky-600 dark:text-sky-400">Basic</th>
                      <th className="p-3 text-amber-600 dark:text-amber-400">Mid-Range (Recommended)</th>
                      <th className="p-3 text-purple-600 dark:text-purple-400">Luxury</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ALBANIA_TIER_COMPARISON_ROWS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-400 uppercase text-[10px] tracking-wider whitespace-nowrap bg-slate-50/50 dark:bg-slate-900/30">
                          {row.category}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {row.basic}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 bg-amber-500/5">
                          {row.midrange}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {row.luxury}
                        </td>
                      </tr>
                    ))}
                    {/* Guest Rating Row */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-400 uppercase text-[10px] tracking-wider whitespace-nowrap bg-slate-50/50 dark:bg-slate-900/30">
                        Guest Reviews
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 font-bold text-sky-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>4.8 / 5.0</span>
                          <span className="text-[10px] text-slate-400 font-normal">(38 reviews)</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 bg-amber-500/5">
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>4.95 / 5.0</span>
                          <span className="text-[10px] text-slate-400 font-normal">(74 reviews)</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1 font-bold text-purple-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>4.98 / 5.0</span>
                          <span className="text-[10px] text-slate-400 font-normal">(32 reviews)</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Inclusions List */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${styles.textPrimary} flex items-center gap-1.5`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Package Inclusions (All 3 Tiers)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {ALBANIA_PACKAGE_INCLUSIONS.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Cross-link Banner in Comparison */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${styles.textPrimary}`}>
                      Want to see traveler feedback on these 3 tiers?
                    </h5>
                    <p className={`text-[11px] ${styles.textMuted}`}>
                      Check authentic reviews on hotel comfort, private driver experience, and dining allowances.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Read Tier Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <AlbaniaTierReviewsSection
              currentTier={selectedTier}
              onSelectTier={setSelectedTier}
              onBookTier={onBookTier}
            />
          )}

          {/* TAB 3: FLIGHT SCHEDULE */}
          {activeTab === 'flights' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-sky-500">
                    Selected Flight Schedule: India (TRV) ⇄ Albania (TIA)
                  </h4>
                  <p className={`text-xs ${styles.textMuted}`}>
                    Airfare is fully factored into each package level. Economy for Basic/Mid-Range; Choice of cabin for Luxury.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Airfare Included</span>
                  <div className="text-xs font-bold text-amber-500">{currentTierInfo.airfarePerPerson}</div>
                </div>
              </div>

              {/* Outbound Flights */}
              <div className="space-y-3">
                <h5 className={`text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5`}>
                  <Plane className="w-3.5 h-3.5 text-sky-500" />
                  <span>{currentTierInfo.flightPlan.outboundTitle}</span>
                </h5>
                <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Sector</th>
                        <th className="p-2.5">Duration / Connection</th>
                        <th className="p-2.5">Airline / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentTierInfo.flightPlan.outboundLegs.map((leg, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-bold font-mono text-sky-500">{leg.time}</td>
                          <td className={`p-2.5 font-bold ${styles.textPrimary}`}>{leg.sector}</td>
                          <td className="p-2.5 text-slate-400">{leg.duration}</td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-300">{leg.airlineNotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Return Flights */}
              <div className="space-y-3">
                <h5 className={`text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5`}>
                  <Plane className="w-3.5 h-3.5 text-emerald-500 rotate-180" />
                  <span>{currentTierInfo.flightPlan.returnTitle}</span>
                </h5>
                <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Sector</th>
                        <th className="p-2.5">Duration / Connection</th>
                        <th className="p-2.5">Airline / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentTierInfo.flightPlan.returnLegs.map((leg, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-bold font-mono text-emerald-500">{leg.time}</td>
                          <td className={`p-2.5 font-bold ${styles.textPrimary}`}>{leg.sector}</td>
                          <td className="p-2.5 text-slate-400">{leg.duration}</td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-300">{leg.airlineNotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL PDF DOSSIER DOWNLOADS */}
          {activeTab === 'pdf' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <h3 className={`text-lg font-black ${styles.textPrimary}`}>
                  Download Official Itinerary PDFs
                </h3>
                <p className={`text-xs ${styles.textMuted}`}>
                  Printable, publication-quality PDF dossiers with flight tables, timetable matrices, cost breakdowns, and UNESCO heritage passes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Mid-Range PDF Card */}
                <div className={`p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Recommended
                    </span>
                    <span className="text-xs text-slate-400">11 Pages • Complete</span>
                  </div>
                  <div>
                    <h4 className={`text-base font-black ${styles.textPrimary}`}>Mid-Range Package PDF</h4>
                    <p className={`text-xs ${styles.textMuted} mt-1`}>
                      Boutique hotels, dedicated driver, comfortable restaurant allowance, and cable car passes.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Estimate: <strong className="text-amber-500 font-mono">₹1,43,390–₹1,67,390</strong>/person
                  </div>
                  <button
                    onClick={() => handleDownload('midrange')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Mid-Range PDF (11 Pages)</span>
                  </button>
                </div>

                {/* Luxury PDF Card */}
                <div className={`p-5 rounded-3xl border border-purple-500/30 bg-purple-500/5 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      VIP Odyssey
                    </span>
                    <span className="text-xs text-slate-400">11 Pages • Complete</span>
                  </div>
                  <div>
                    <h4 className={`text-base font-black ${styles.textPrimary}`}>Luxury Package PDF</h4>
                    <p className={`text-xs ${styles.textMuted} mt-1`}>
                      5-star seaside suites, private luxury vehicle, chartered boat in Ksamil, and upscale fine dining.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Estimate: <strong className="text-purple-400 font-mono">₹4,24,343–₹4,73,343</strong>/person
                  </div>
                  <button
                    onClick={() => handleDownload('luxury')}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Luxury PDF (11 Pages)</span>
                  </button>
                </div>

                {/* Basic PDF Card */}
                <div className={`p-5 rounded-3xl border border-sky-500/30 bg-sky-500/5 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      Best Value
                    </span>
                    <span className="text-xs text-slate-400">11 Pages • Complete</span>
                  </div>
                  <div>
                    <h4 className={`text-base font-black ${styles.textPrimary}`}>Basic Package PDF</h4>
                    <p className={`text-xs ${styles.textMuted} mt-1`}>
                      Private-room value hotels, economy airfare, practical transport, and core sightseeing entries.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Estimate: <strong className="text-sky-500 font-mono">₹1,11,018–₹1,26,518</strong>/person
                  </div>
                  <button
                    onClick={() => handleDownload('basic')}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Basic PDF (11 Pages)</span>
                  </button>
                </div>

                {/* Side-by-Side Comparison PDF */}
                <div className={`p-5 rounded-3xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-400">
                      Comparison
                    </span>
                    <span className="text-xs text-slate-400">5 Pages • Summary</span>
                  </div>
                  <div>
                    <h4 className={`text-base font-black ${styles.textPrimary}`}>3-Tier Comparison PDF</h4>
                    <p className={`text-xs ${styles.textMuted} mt-1`}>
                      Side-by-side matrices comparing flight options, accommodations, daily budgets, and highlights.
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Includes flight cabin options and group breakdowns for 4 travellers.
                  </div>
                  <button
                    onClick={handleDownloadComparison}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Comparison PDF</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-4 text-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-bold ${styles.textPrimary}`}>
                Direct Concierge Booking Available
              </div>
              <p className={`text-[11px] ${styles.textMuted} flex flex-wrap items-center gap-x-2 gap-y-0.5`}>
                <span>Support: +91 9567465134</span>
                <span>•</span>
                <a
                  href="https://www.instagram.com/voyage_tours._.travels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-600 font-bold inline-flex items-center gap-1 transition-colors"
                  title="Official Instagram: @voyage_tours._.travels"
                >
                  <Instagram className="w-3 h-3" />
                  <span>@voyage_tours._.travels</span>
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleDownload(selectedTier)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handleBook}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book {currentTierInfo.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
