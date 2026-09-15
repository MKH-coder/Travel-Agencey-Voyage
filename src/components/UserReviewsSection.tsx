import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ThumbsUp,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Flag,
  ShieldAlert,
  X,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Listing, Review } from '../types.ts';
import { FirebaseSyncService } from '../services/firebase.ts';

interface UserReviewsSectionProps {
  listing: Listing;
  onReviewAdded?: (newReview: Review, updatedAvgRating: number, newCount: number) => void;
}

export const UserReviewsSection: React.FC<UserReviewsSectionProps> = ({
  listing,
  onReviewAdded
}) => {
  const { styles } = useTheme();
  const { user, setShowLoginModal } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newlyAddedReviewId, setNewlyAddedReviewId] = useState<string | null>(null);
  const reviewListRef = useRef<HTMLDivElement | null>(null);

  // Review Form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Report Modal state
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  const [reportReasonCategory, setReportReasonCategory] = useState<string>('Spam or unwanted promotional content');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  const [reportNotification, setReportNotification] = useState<string>('');

  // Fetch reviews for this listing
  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      setLoading(true);
      try {
        const data = await FirebaseSyncService.getReviewsForListing(listing.id);
        if (isMounted) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [listing.id]);

  // Derived rating metrics
  const { avgRating, totalCount, distribution } = useMemo(() => {
    if (reviews.length === 0) {
      return {
        avgRating: listing.rating || 5.0,
        totalCount: listing.reviewCount || 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      dist[star] = (dist[star] || 0) + 1;
      sum += r.rating;
    });

    const calculatedAvg = sum / reviews.length;
    return {
      avgRating: calculatedAvg,
      totalCount: reviews.length,
      distribution: dist
    };
  }, [reviews, listing.rating, listing.reviewCount]);

  const ratingLabels: Record<number, string> = {
    1: '1 - Disappointing',
    2: '2 - Fair',
    3: '3 - Good experience',
    4: '4 - Very Good',
    5: '5 - Exceptional / Must Visit'
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMsg('Please choose a rating between 1 and 5 stars.');
      return;
    }

    const trimmed = comment.trim();
    if (trimmed.length < 5) {
      setErrorMsg('Please write at least a few words describing your experience (min 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const newReview: Review = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        listingId: listing.id,
        userId: user.uid,
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        userAvatar: user.avatar,
        rating,
        comment: trimmed,
        createdAt: new Date().toISOString()
      };

      const success = await FirebaseSyncService.saveReview(newReview);
      if (success) {
        const updatedList = [newReview, ...reviews];
        setReviews(updatedList);
        setNewlyAddedReviewId(newReview.id);
        setComment('');
        setRating(5);
        setSuccessMsg('Your review has been published!');
        setTimeout(() => setSuccessMsg(''), 4000);

        // Smoothly scroll to top so new review entrance is immediately visible
        setTimeout(() => {
          if (reviewListRef.current) {
            reviewListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);

        // Clear highlight ring after 6 seconds
        setTimeout(() => {
          setNewlyAddedReviewId(prev => (prev === newReview.id ? null : prev));
        }, 6000);

        // Notify parent if needed
        const newAvg = (reviews.reduce((acc, r) => acc + r.rating, 0) + newReview.rating) / (reviews.length + 1);
        if (onReviewAdded) {
          onReviewAdded(newReview, Number(newAvg.toFixed(2)), reviews.length + 1);
        }
      } else {
        setErrorMsg('Failed to save review to cloud database. Saved locally.');
      }
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to remove this review?')) return;
    setDeletingId(reviewId);
    try {
      await FirebaseSyncService.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleInitiateReport = (rev: Review) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setReportingReview(rev);
    setReportReasonCategory('Spam or unwanted promotional content');
    setReportDetails('');
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReview || !user) return;

    setSubmittingReport(true);
    const fullReason = reportDetails.trim()
      ? `${reportReasonCategory}: ${reportDetails.trim()}`
      : reportReasonCategory;

    try {
      const success = await FirebaseSyncService.reportReview(
        reportingReview.id,
        fullReason,
        user.email,
        user.uid,
        listing.title
      );

      if (success) {
        setReviews(prev =>
          prev.map(r =>
            r.id === reportingReview.id
              ? {
                  ...r,
                  isReported: true,
                  reportReason: fullReason,
                  reportedBy: user.uid,
                  reportedByEmail: user.email,
                  reportedAt: new Date().toISOString(),
                  moderationStatus: 'PENDING'
                }
              : r
          )
        );
        setReportNotification('Review reported to administrator moderation queue.');
        setTimeout(() => setReportNotification(''), 6000);
      }
    } catch (err) {
      console.error('Error reporting review:', err);
    } finally {
      setSubmittingReport(false);
      setReportingReview(null);
    }
  };

  const formatReviewDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div id="user-reviews-section" className={`p-5 sm:p-6 rounded-2xl border ${styles.border} ${styles.cardBg} space-y-6 shadow-sm`}>
      
      {/* Section Header with Aggregate Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-500" />
            <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
              Guest Reviews & Ratings
            </h3>
          </div>
          <p className={`text-xs ${styles.textMuted} mt-1`}>
            Verified traveler feedback and community ratings for {listing.title}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-amber-500 font-extrabold text-xl sm:text-2xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{avgRating.toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-normal">/ 5</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Based on {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Ratings Distribution Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="text-center px-3 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <span className="text-3xl font-black text-amber-500">{avgRating.toFixed(1)}</span>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Overall Score</div>
          </div>

          <div className="text-xs space-y-1 text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Verified Community Feedback</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Only authenticated travelers can publish ratings and impressions.
            </p>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = distribution[stars] || 0;
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-7 text-[11px] font-medium text-slate-500 flex items-center justify-end gap-0.5">
                  {stars} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[10px] text-slate-400 font-mono">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form / Authentication Banner */}
      <div className={`p-4 rounded-xl border ${styles.border} ${styles.bg}`}>
        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-sky-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className={`text-xs font-bold ${styles.textPrimary} flex items-center gap-1.5`}>
                    <span>{user.name}</span>
                    <span className="text-[10px] font-medium text-sky-500 px-1.5 py-0.2 bg-sky-500/10 rounded">
                      Posting as Verified Guest
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{user.email}</div>
                </div>
              </div>

              {/* Star Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Your Rating:</span>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map(starIndex => {
                    const active = (hoverRating || rating) >= starIndex;
                    return (
                      <button
                        type="button"
                        key={starIndex}
                        id={`star-select-${starIndex}`}
                        onClick={() => setRating(starIndex)}
                        onMouseEnter={() => setHoverRating(starIndex)}
                        className="p-1 hover:scale-125 transition-transform"
                        title={ratingLabels[starIndex]}
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            active
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-semibold text-amber-500 min-w-[120px]">
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="relative">
              <textarea
                id="review-comment-input"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What made this destination or stay memorable? Mention highlights, tips for future guests, or room recommendations..."
                maxLength={1000}
                className={`w-full p-3 text-xs sm:text-sm rounded-xl outline-none resize-none transition-all ${styles.inputBg} border ${styles.border}`}
              />
              <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                <span>Supports plain text • Be respectful and constructive</span>
                <span>{comment.length} / 1000</span>
              </div>
            </div>

            {/* Status Feedback */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end">
              <button
                type="submit"
                id="submit-review-btn"
                disabled={submitting || comment.trim().length === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${styles.buttonPrimary} flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm`}
              >
                {submitting ? (
                  <span>Posting Review...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-4 px-3 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className={`text-sm font-bold ${styles.textPrimary}`}>
              Have you visited {listing.title}?
            </h4>
            <p className={`text-xs ${styles.textSecondary} max-w-md mx-auto`}>
              Sign in to share your star rating, traveler tips, and honest review with the Voyage community.
            </p>
            <button
              id="signin-to-review-btn"
              onClick={() => setShowLoginModal(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${styles.buttonPrimary} shadow-sm transition-all`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Post a Review</span>
            </button>
          </div>
        )}
      </div>

      {/* Moderation Notification Toast */}
      {reportNotification && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm"
        >
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="flex-1">{reportNotification}</span>
          <button
            type="button"
            onClick={() => setReportNotification('')}
            className="p-1 rounded-md text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Scrollable List of Reviews */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className={`text-xs font-bold uppercase tracking-wider text-slate-400`}>
            Recent Guest Impressions ({reviews.length})
          </h4>
          {reviews.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Sorted by most recent
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <span>Loading reviews from community...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
            <div className={`text-sm font-semibold ${styles.textPrimary}`}>
              No reviews posted yet
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the very first guest to rate this destination and share insights!
            </p>
          </div>
        ) : (
          <div
            ref={reviewListRef}
            className="max-h-[380px] overflow-y-auto pr-1.5 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin"
          >
            <AnimatePresence initial={false}>
              {reviews.map((rev) => {
                const canDelete =
                  user &&
                  (user.uid === rev.userId ||
                    user.role === 'TECH_ADMIN' ||
                    user.role === 'ADMIN');
                const isNew = newlyAddedReviewId === rev.id;

                return (
                  <motion.div
                    key={rev.id}
                    id={`review-item-${rev.id}`}
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95, transition: { duration: 0.25 } }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className={`pt-3 first:pt-0 space-y-2 group transition-all duration-500 rounded-xl p-2.5 ${
                      isNew
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 shadow-xs ring-1 ring-amber-400/25'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {rev.userAvatar ? (
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                            {rev.userName ? rev.userName[0].toUpperCase() : 'G'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-bold ${styles.textPrimary}`}>
                              {rev.userName}
                            </span>
                            <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified Stay
                            </span>
                            {isNew && (
                              <motion.span
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.3 }}
                                className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30"
                              >
                                <Sparkles className="w-2.5 h-2.5 animate-pulse text-amber-500" />
                                <span>Just Posted</span>
                              </motion.span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatReviewDate(rev.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 mr-1">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star
                              key={st}
                              className={`w-3 h-3 ${
                                st <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Report Review Button / Moderation Flag */}
                        {rev.isReported ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25 font-semibold"
                            title="This review is pending review in the admin moderation queue"
                          >
                            <Flag className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>Reported</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            id={`report-review-${rev.id}`}
                            onClick={() => handleInitiateReport(rev)}
                            className="opacity-70 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all text-xs flex items-center gap-1"
                            title="Report review to admin moderation queue"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline font-medium">Report</span>
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            disabled={deletingId === rev.id}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all text-xs"
                            title="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className={`text-xs sm:text-sm ${styles.textSecondary} leading-relaxed pl-9`}>
                      {rev.comment}
                    </p>

                    {rev.isReported && (
                      <div className="ml-9 mt-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] flex items-center gap-1.5 border border-amber-500/20 font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
                        <span>Under admin moderation review ({rev.reportReason || 'Flagged by community'})</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Report Review Modal */}
      <AnimatePresence>
        {reportingReview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => !submittingReport && setReportingReview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-3xl border ${styles.border} ${styles.cardBg} p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${styles.textPrimary}`}>Report Guest Review</h3>
                    <p className="text-[11px] text-slate-400">Flag for Administrator Moderation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReportingReview(null)}
                  disabled={submittingReport}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Review Excerpt */}
              <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>Author:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{reportingReview.userName}</strong>
                  <span className="text-slate-400 text-[10px]">({formatReviewDate(reportingReview.createdAt)})</span>
                </div>
                <p className="text-xs italic text-slate-600 dark:text-slate-300 line-clamp-3 bg-white/40 dark:bg-black/20 p-2 rounded-xl">
                  "{reportingReview.comment}"
                </p>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold ${styles.textPrimary} mb-2`}>
                    Select Violation Category
                  </label>
                  <div className="space-y-1.5">
                    {[
                      'Spam, advertising, or commercial promo',
                      'Inappropriate, offensive, or hateful language',
                      'Misleading, fabricated, or fake experience',
                      'Conflict of interest or competitor smear',
                      'Harassment, defamation, or privacy breach',
                      'Other policy or community guideline violation'
                    ].map((cat) => (
                      <label
                        key={cat}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          reportReasonCategory === cat
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold shadow-xs'
                            : `border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50`
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReasonCategory"
                          value={cat}
                          checked={reportReasonCategory === cat}
                          onChange={() => setReportReasonCategory(cat)}
                          className="text-amber-500 focus:ring-amber-500 h-3.5 w-3.5"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold ${styles.textPrimary} mb-1.5`}>
                    Additional Context <span className="text-[10px] text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide details for administrators evaluating this report..."
                    className={`w-full p-2.5 rounded-xl border ${styles.border} ${styles.inputBg} ${styles.textPrimary} text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none`}
                  />
                </div>

                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-[11px] text-sky-700 dark:text-sky-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-sky-500" />
                  <p className="leading-relaxed">
                    This review will immediately be routed to the <strong>Admin Portal Verification Queue</strong> for urgent review and audit logging.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReportingReview(null)}
                    disabled={submittingReport}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-report-review-btn"
                    disabled={submittingReport}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{submittingReport ? 'Submitting...' : 'Submit to Moderation Queue'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
