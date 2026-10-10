import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  PlusCircle,
  X,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Car,
  Home,
  Utensils,
  Camera
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  AlbaniaTier,
  AlbaniaTierReview,
  INITIAL_ALBANIA_TIER_REVIEWS,
  ALBANIA_TIER_SATISFACTION_METRICS,
} from '../data/albaniaReviewsData.ts';
import { ALBANIA_PACKAGE_TIERS } from '../data/albaniaItineraryData.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface AlbaniaTierReviewsSectionProps {
  currentTier: AlbaniaTier;
  onSelectTier: (tier: AlbaniaTier) => void;
  onBookTier?: (tier: AlbaniaTier) => void;
}

const STORAGE_KEY = 'voyage_albania_tier_reviews_v1';
const UPVOTED_KEY = 'voyage_albania_reviews_upvoted_v1';

export const AlbaniaTierReviewsSection: React.FC<AlbaniaTierReviewsSectionProps> = ({
  currentTier,
  onSelectTier,
  onBookTier,
}) => {
  const { styles } = useTheme();

  // Tier filter: 'all' or specific tier
  const [filterTier, setFilterTier] = useState<AlbaniaTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('helpful');

  // Reviews state (initial + persisted user reviews)
  const [reviews, setReviews] = useState<AlbaniaTierReview[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ALBANIA_TIER_REVIEWS;
  });

  // Track user upvoted review IDs
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(UPVOTED_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
    return new Set<string>();
  });

  // Write Review form toggle & state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formTier, setFormTier] = useState<AlbaniaTier>(currentTier);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formName, setFormName] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formPros, setFormPros] = useState('');
  const [formRecommendedFor, setFormRecommendedFor] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Sync formTier if currentTier changes and form is open
  useEffect(() => {
    setFormTier(currentTier);
  }, [currentTier]);

  // Persist reviews when changed
  const saveReviews = (updated: AlbaniaTierReview[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save reviews:', err);
    }
  };

  const handleToggleUpvote = (reviewId: string) => {
    const isUpvoted = upvotedIds.has(reviewId);
    const newUpvoted = new Set(upvotedIds);

    if (isUpvoted) {
      newUpvoted.delete(reviewId);
    } else {
      newUpvoted.add(reviewId);
    }
    setUpvotedIds(newUpvoted);
    try {
      localStorage.setItem(UPVOTED_KEY, JSON.stringify(Array.from(newUpvoted)));
    } catch {}

    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          helpfulCount: isUpvoted ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
        };
      }
      return r;
    });
    saveReviews(updated);

    if (!isUpvoted) {
      AuthAudit.showToast({
        title: 'Thank you for your feedback',
        message: 'Marked review as helpful.',
        type: 'info',
        duration: 3000,
      });
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTitle.trim() || !formComment.trim()) {
      AuthAudit.showToast({
        title: 'Missing Required Fields',
        message: 'Please provide your name, review headline, and detailed feedback.',
        type: 'error',
      });
      return;
    }

    setFormSubmitting(true);

    const nameParts = formName.trim().split(' ');
    const initials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase();

    const prosList = formPros
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const newReview: AlbaniaTierReview = {
      id: `rev-user-${Date.now()}`,
      reviewerName: formName.trim(),
      origin: formOrigin.trim() || 'Verified Traveler',
      travelDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      tier: formTier,
      rating: formRating,
      title: formTitle.trim(),
      comment: formComment.trim(),
      pros: prosList.length > 0 ? prosList : ['Seamless Albania 9-day itinerary route', 'Prompt concierge coordination'],
      recommendedFor: formRecommendedFor.trim() || 'All Albania Travelers',
      helpfulCount: 1,
      verifiedBooking: true,
      avatarBg: formTier === 'luxury' ? 'bg-purple-700' : formTier === 'midrange' ? 'bg-amber-600' : 'bg-sky-600',
      avatarInitials: initials,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);
    setFormSubmitting(false);
    setShowReviewForm(false);

    // Reset fields
    setFormTitle('');
    setFormComment('');
    setFormPros('');
    setFormRecommendedFor('');

    AuthAudit.showToast({
      title: 'Review Published Successfully',
      message: `Your feedback for the ${ALBANIA_PACKAGE_TIERS[formTier].title} has been posted.`,
      type: 'success',
      duration: 6000,
    });
  };

  // Filter & sort logic
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((rev) => {
        if (filterTier !== 'all' && rev.tier !== filterTier) return false;
        if (minRatingFilter > 0 && rev.rating < minRatingFilter) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = rev.title.toLowerCase().includes(query);
          const matchComment = rev.comment.toLowerCase().includes(query);
          const matchAuthor = rev.reviewerName.toLowerCase().includes(query);
          const matchOrigin = rev.origin.toLowerCase().includes(query);
          const matchPros = rev.pros.some((p) => p.toLowerCase().includes(query));
          return matchTitle || matchComment || matchAuthor || matchOrigin || matchPros;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [reviews, filterTier, minRatingFilter, searchQuery, sortBy]);

  // Aggregate stats per tier
  const stats = useMemo(() => {
    const totalCount = reviews.length;
    const avgRating = totalCount ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(2) : '5.0';

    const basicList = reviews.filter((r) => r.tier === 'basic');
    const midList = reviews.filter((r) => r.tier === 'midrange');
    const luxList = reviews.filter((r) => r.tier === 'luxury');

    const calcAvg = (list: AlbaniaTierReview[]) =>
      list.length ? (list.reduce((acc, r) => acc + r.rating, 0) / list.length).toFixed(1) : '5.0';

    return {
      totalCount,
      avgRating,
      basic: {
        count: basicList.length,
        avg: calcAvg(basicList),
      },
      midrange: {
        count: midList.length,
        avg: calcAvg(midList),
      },
      luxury: {
        count: luxList.length,
        avg: calcAvg(luxList),
      },
    };
  }, [reviews]);

  const activeMetrics = ALBANIA_TIER_SATISFACTION_METRICS[filterTier === 'all' ? currentTier : filterTier];

  return (
    <div className="space-y-6">
      {/* Top Overview & Rating Headline */}
      <div className={`p-6 rounded-3xl border ${styles.border} ${styles.cardBg} bg-gradient-to-br from-slate-50 to-amber-50/20 dark:from-slate-900 dark:to-slate-900/60 shadow-sm space-y-5`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-500">
                Verified Traveler Feedback
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                100% Genuine 9-Day Albania Tour Guests
              </span>
            </div>
            <h3 className={`text-xl font-black ${styles.textPrimary} tracking-tight`}>
              Albania Expedition Reviews by Tier
            </h3>
            <p className={`text-xs ${styles.textMuted} max-w-2xl leading-relaxed`}>
              Compare transparent feedback from past travelers across the <strong>Basic Value Discovery</strong>, <strong>Mid-Range Classic</strong>, and <strong>Luxury VIP Odyssey</strong> tiers before confirming your booking.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-2xl font-black text-amber-500 font-mono tracking-tight">{stats.avgRating}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Based on {stats.totalCount} verified reviews
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Tier Scorecards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Basic Tier Card */}
          <div
            onClick={() => {
              setFilterTier('basic');
              onSelectTier('basic');
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              filterTier === 'basic' || (filterTier === 'all' && currentTier === 'basic')
                ? 'border-sky-500/80 bg-sky-500/10 shadow-sm'
                : 'border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-500">
                Basic Package
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                {stats.basic.avg} ({stats.basic.count})
              </span>
            </div>
            <div className={`text-xs font-bold ${styles.textPrimary} line-clamp-1`}>
              Value Discovery & Heritage
            </div>
            <p className={`text-[11px] ${styles.textMuted} mt-1 leading-normal line-clamp-2`}>
              Clean private-room hotels, identical 9-day route, best cost-to-beauty ratio in Europe.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">97% Recommend</span>
              <span className="text-sky-500 font-bold flex items-center gap-0.5">
                View Feedback <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Mid-Range Tier Card (Featured) */}
          <div
            onClick={() => {
              setFilterTier('midrange');
              onSelectTier('midrange');
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              filterTier === 'midrange' || (filterTier === 'all' && currentTier === 'midrange')
                ? 'border-amber-500/80 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/30'
                : 'border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                  Mid-Range Classic
                </span>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase bg-amber-500 text-white">
                  Popular
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                {stats.midrange.avg} ({stats.midrange.count})
              </span>
            </div>
            <div className={`text-xs font-bold ${styles.textPrimary} line-clamp-1`}>
              Boutique Hotels & Dedicated Driver
            </div>
            <p className={`text-[11px] ${styles.textMuted} mt-1 leading-normal line-clamp-2`}>
              Stone citadel boutique stays, dedicated driver through Llogara, generous seafood allowance.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">99% Recommend</span>
              <span className="text-amber-500 font-bold flex items-center gap-0.5">
                View Feedback <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Luxury VIP Tier Card */}
          <div
            onClick={() => {
              setFilterTier('luxury');
              onSelectTier('luxury');
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              filterTier === 'luxury' || (filterTier === 'all' && currentTier === 'luxury')
                ? 'border-purple-500/80 bg-purple-500/10 shadow-sm'
                : 'border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                Luxury VIP Odyssey
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                {stats.luxury.avg} ({stats.luxury.count})
              </span>
            </div>
            <div className={`text-xs font-bold ${styles.textPrimary} line-clamp-1`}>
              5-Star Seaside Suites & Private Boat
            </div>
            <p className={`text-[11px] ${styles.textMuted} mt-1 leading-normal line-clamp-2`}>
              Executive Mercedes V-Class, chartered speedboat to Ksamil caves, 24/7 personal concierge.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Recommend</span>
              <span className="text-purple-400 font-bold flex items-center gap-0.5">
                View Feedback <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Selected Tier Highlights Bar */}
        <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-850/60 border border-slate-200/50 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span className={`font-semibold ${styles.textPrimary}`}>
              {activeMetrics.summaryQuote}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onBookTier && (
              <button
                type="button"
                onClick={() => onBookTier(filterTier === 'all' ? currentTier : filterTier)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Book {ALBANIA_PACKAGE_TIERS[filterTier === 'all' ? currentTier : filterTier].title}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Write a Review Modal / Dropdown */}
      {showReviewForm && (
        <div className={`p-5 rounded-3xl border border-sky-500/40 ${styles.cardBg} shadow-lg space-y-4 animate-in fade-in duration-150`}>
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-500" />
              <h4 className={`text-sm font-black ${styles.textPrimary}`}>
                Share Your Albania Itinerary Experience
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Which Tier Did You Experience? *
                </label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as AlbaniaTier)}
                  className={`w-full p-2.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
                >
                  <option value="basic">Basic Value Discovery</option>
                  <option value="midrange">Mid-Range Classic (Recommended)</option>
                  <option value="luxury">Luxury VIP Odyssey</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Elena Rostova or Liam C."
                  required
                  className={`w-full p-2.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  City / Country Origin
                </label>
                <input
                  type="text"
                  value={formOrigin}
                  onChange={(e) => setFormOrigin(e.target.value)}
                  placeholder="e.g. Zurich, Switzerland"
                  className={`w-full p-2.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Your Overall Rating *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setFormRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (hoverRating || formRating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-bold text-amber-500 ml-2">
                  {hoverRating || formRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Review Headline *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Dedicated driver through Llogara Pass was the best choice!"
                required
                className={`w-full p-2.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Detailed Feedback (Hotels, Transport, Sights, Taverns) *
              </label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts on the hotel comfort, food, itinerary pacing, and driver support..."
                required
                className={`w-full p-2.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Key Strengths / Highlights (comma separated)
                </label>
                <input
                  type="text"
                  value={formPros}
                  onChange={(e) => setFormPros(e.target.value)}
                  placeholder="e.g. Ksamil boat cruise, Boutique hotel in Berat, Fresh grilled sea bass"
                  className={`w-full p-2.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Who would you recommend this tier to?
                </label>
                <input
                  type="text"
                  value={formRecommendedFor}
                  onChange={(e) => setFormRecommendedFor(e.target.value)}
                  placeholder="e.g. Couples, Photography lovers, Budget travelers"
                  className={`w-full p-2.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>{formSubmitting ? 'Submitting...' : 'Post Verified Review'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter, Search & Sort Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Tier filter pill buttons */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterTier('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              filterTier === 'all'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Tiers ({stats.totalCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTier('midrange');
              onSelectTier('midrange');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterTier === 'midrange'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Mid-Range</span>
            <span className="text-[10px] opacity-80 font-mono">({stats.midrange.count})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTier('luxury');
              onSelectTier('luxury');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterTier === 'luxury'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Luxury VIP</span>
            <span className="text-[10px] opacity-80 font-mono">({stats.luxury.count})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTier('basic');
              onSelectTier('basic');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterTier === 'basic'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Basic</span>
            <span className="text-[10px] opacity-80 font-mono">({stats.basic.count})</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none focus:ring-1 focus:ring-sky-500`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-2.5 py-1.5 rounded-xl text-xs border ${styles.border} ${styles.inputBg} ${styles.textPrimary} outline-none cursor-pointer`}
          >
            <option value="helpful">Most Helpful</option>
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className={`p-10 rounded-2xl border ${styles.border} text-center space-y-2`}>
            <p className={`text-sm font-bold ${styles.textPrimary}`}>No reviews match your filters</p>
            <p className={`text-xs ${styles.textMuted}`}>
              Try clearing the search query or switching to &ldquo;All Tiers&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterTier('all');
                setSearchQuery('');
                setMinRatingFilter(0);
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isUpvoted = upvotedIds.has(rev.id);
            const tierMeta = ALBANIA_PACKAGE_TIERS[rev.tier];

            return (
              <div
                key={rev.id}
                className={`p-5 rounded-3xl border transition-all ${
                  rev.tier === 'luxury'
                    ? 'border-purple-500/25 bg-purple-500/[0.02] dark:bg-purple-950/[0.08]'
                    : rev.tier === 'midrange'
                    ? 'border-amber-500/25 bg-amber-500/[0.02] dark:bg-amber-950/[0.08]'
                    : 'border-sky-500/25 bg-sky-500/[0.02] dark:bg-sky-950/[0.08]'
                } ${styles.cardBg} hover:shadow-md space-y-3.5`}
              >
                {/* Review Header: User & Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl ${rev.avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {rev.avatarInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-black ${styles.textPrimary}`}>
                          {rev.reviewerName}
                        </span>
                        {rev.verifiedBooking && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified 9-Day Guest</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span>{rev.origin}</span>
                        <span>·</span>
                        <span>{rev.travelDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier Badge & Rating */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        rev.tier === 'luxury'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : rev.tier === 'midrange'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                      }`}
                    >
                      {tierMeta.title}
                    </span>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 font-mono font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Review Headline & Body */}
                <div className="space-y-1.5">
                  <h4 className={`text-sm font-black ${styles.textPrimary} tracking-tight`}>
                    {rev.title}
                  </h4>
                  <p className={`text-xs ${styles.textSecondary} leading-relaxed`}>
                    {rev.comment}
                  </p>
                </div>

                {/* Pros Highlights */}
                {rev.pros && rev.pros.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/80">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Key Highlights Mentioned
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rev.pros.map((pro, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-850 px-2.5 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Bar: Helpful Upvote & Recommendation */}
                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    Recommended for:{' '}
                    <strong className="text-slate-600 dark:text-slate-300 font-semibold">
                      {rev.recommendedFor}
                    </strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleUpvote(rev.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isUpvoted
                          ? 'bg-sky-500 text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-white' : ''}`} />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>

                    {onBookTier && (
                      <button
                        type="button"
                        onClick={() => onBookTier(rev.tier)}
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
                      >
                        <span>Choose this Tier</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
