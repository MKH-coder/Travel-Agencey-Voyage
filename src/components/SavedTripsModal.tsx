import React, { useState } from 'react';
import {
  Bookmark,
  X,
  Trash2,
  MapPin,
  Star,
  ExternalLink,
  Calendar,
  Compass,
  Hotel,
  UtensilsCrossed,
  Sparkles,
  Luggage,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Listing } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedListings: Listing[];
  onRemoveSavedTrip?: (listingId: string) => void;
  onRemoveSaved?: (listingId: string) => void;
  onSelectListing: (listing: Listing) => void;
  onBookListing?: (listing: Listing) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  isOpen,
  onClose,
  savedListings,
  onRemoveSavedTrip,
  onRemoveSaved,
  onSelectListing,
  onBookListing,
}) => {
  const { styles } = useTheme();
  const { user, setShowLoginModal } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadItinerary = async () => {
    if (savedListings.length === 0) return;
    setIsDownloading(true);
    try {
      // 1. Initialize portrait PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const rPrimary = 14;
      const gPrimary = 165;
      const bPrimary = 233;

      const rTextPrimary = 15;
      const gTextPrimary = 23;
      const bTextPrimary = 42;

      const rTextSec = 71;
      const gTextSec = 85;
      const bTextSec = 105;

      // Title & Header Banner
      doc.setFillColor(248, 250, 252); // Light background header card
      doc.rect(0, 0, 210, 50, 'F');

      // Top branding line
      doc.setDrawColor(rPrimary, gPrimary, bPrimary);
      doc.setLineWidth(1.5);
      doc.line(0, 0, 210, 0);

      // Logo/Brand Text
      doc.setTextColor(rPrimary, gPrimary, bPrimary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('VOYAGE PLATFORM', 15, 20);

      doc.setTextColor(rTextSec, gTextSec, bTextSec);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Smart Traveler Booking & Wishlist Itinerary', 15, 26);

      // Metadata card right side
      const dateStr = new Date().toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.setFontSize(9);
      doc.setTextColor(rTextSec, gTextSec, bTextSec);
      doc.text(`Generated on: ${dateStr}`, 140, 20);
      doc.text(`Curated for: ${user?.name || 'Guest Explorer'}`, 140, 25);
      doc.text(`E-mail: ${user?.email || 'N/A'}`, 140, 30);

      // Main line divider
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(15, 45, 195, 45);

      // Heading: SAVED DESTINATIONS
      doc.setTextColor(rTextPrimary, gTextPrimary, bTextPrimary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('YOUR CURATED ITINERARY SUMMARY', 15, 58);

      let currentY = 66;

      // Draw listings
      savedListings.forEach((listing, index) => {
        // Handle page breaking safely
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
          // Sub-header on new page
          doc.setTextColor(rTextSec, gTextSec, bTextSec);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('Voyage Curated Itinerary (Continued)', 15, 12);
          doc.line(15, 14, 195, 14);
          currentY = 22;
        }

        // Draw card background
        doc.setFillColor(252, 253, 254);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.roundedRect(15, currentY, 180, 26, 3, 3, 'FD');

        // Draw index badge
        doc.setFillColor(rPrimary, gPrimary, bPrimary);
        doc.roundedRect(18, currentY + 4, 8, 8, 1.5, 1.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(String(index + 1), 21, currentY + 9.5);

        // Category Tag
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        if (listing.category === 'HOTEL') {
          doc.setTextColor(14, 116, 144); // Cyan-700
        } else if (listing.category === 'FOOD') {
          doc.setTextColor(180, 83, 9); // Amber-700
        } else {
          doc.setTextColor(4, 120, 87); // Emerald-700
        }
        doc.text(listing.category, 30, currentY + 8);

        // Title
        doc.setTextColor(rTextPrimary, gTextPrimary, bTextPrimary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        // Truncate title if extremely long
        const titleText = listing.title.length > 50 ? listing.title.slice(0, 48) + '...' : listing.title;
        doc.text(titleText, 30, currentY + 14);

        // Location Info
        doc.setTextColor(rTextSec, gTextSec, bTextSec);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`${listing.location}, ${listing.country}`, 30, currentY + 20);

        // Right side details: Rating and Price
        doc.setTextColor(217, 119, 6); // rating gold
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(`Rating: ${listing.rating.toFixed(1)} / 5.0`, 145, currentY + 8);

        doc.setTextColor(rTextPrimary, gTextPrimary, bTextPrimary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const term = listing.category === 'HOTEL' ? '/night' : listing.category === 'FOOD' ? '/person' : '/tour';
        doc.text(`$${listing.price}`, 145, currentY + 15);
        doc.setTextColor(rTextSec, gTextSec, bTextSec);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(term, 145, currentY + 19);

        currentY += 31;
      });

      // Total estimated cost block
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Draw Price Summary Card
      doc.setFillColor(240, 249, 255); // Light sky background
      doc.setDrawColor(186, 230, 253);
      doc.roundedRect(15, currentY, 180, 22, 3, 3, 'FD');

      const totalEstimated = savedListings.reduce((sum, item) => sum + item.price, 0);
      doc.setTextColor(3, 105, 161); // sky-700
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TOTAL ESTIMATED BASE BUDGET:', 22, currentY + 13);

      doc.setTextColor(rTextPrimary, gTextPrimary, bTextPrimary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(`$${totalEstimated.toLocaleString()}`, 145, currentY + 14);

      // Terms/Footer at bottom of page
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFontSize(8);
      doc.text('Disclaimer: This PDF serves as a personalized travel planning summary. Actual rates and availability are subject to change.', 15, 280);
      doc.text('Generated via Voyage multi-factor verified portal. Happy travels!', 15, 284);

      // Save PDF
      doc.save(`Voyage_Itinerary_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemove = (id: string) => {
    if (onRemoveSavedTrip) {
      onRemoveSavedTrip(id);
    } else if (onRemoveSaved) {
      onRemoveSaved(id);
    }
  };

  const handleBook = (listing: Listing) => {
    if (onBookListing) {
      onBookListing(listing);
    } else {
      onSelectListing(listing);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${styles.cardBg} ${styles.border}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Bookmark className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Saved Trips & Wishlist</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {savedListings.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user ? `Curated bookmarks for ${user.name}` : 'Sign in to sync saved trips across your devices'}
              </p>
            </div>
          </div>

          <button
            id="close-saved-trips-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!user ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
                <Luggage className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Save your favorite destinations
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                Sign in with Google OAuth or Phone OTP to bookmark hotels, culinary spots, and places to your personal itinerary.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setShowLoginModal(true);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md`}
              >
                Sign In to View Saved Trips
              </button>
            </div>
          ) : savedListings.length === 0 ? (
            <div className="text-center py-14 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <Bookmark className="w-8 h-8 stroke-1" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Your saved list is empty
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                Click the bookmark heart icon on any destination, hotel, or dining spot across the feed or map to save it here.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonSecondary}`}
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {savedListings.map((listing) => {
                const isHotel = listing.category === 'HOTEL';
                const isFood = listing.category === 'FOOD';

                return (
                  <div
                    key={listing.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all bg-white/50 dark:bg-slate-900/50 group"
                  >
                    {/* Image & Title Info */}
                    <div
                      className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        onSelectListing(listing);
                        onClose();
                      }}
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                        <img
                          src={listing.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 left-1 p-1 rounded-md bg-black/60 text-white backdrop-blur-sm text-[9px] font-bold">
                          {isHotel ? (
                            <Hotel className="w-3 h-3 text-sky-400" />
                          ) : isFood ? (
                            <UtensilsCrossed className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Compass className="w-3 h-3 text-emerald-400" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {listing.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{listing.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-500 transition-colors">
                          {listing.title}
                        </h4>

                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span className="truncate">
                            {listing.location}, {listing.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">
                          ${listing.price}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isHotel ? '/night' : isFood ? '/person' : '/tour'}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectListing(listing);
                            onClose();
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonSecondary}`}
                          title="View Details"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleBook(listing);
                            onClose();
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-sm`}
                          title="Book Now"
                        >
                          Book
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(listing.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedListings.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total estimated base price:{' '}
              <span className="font-extrabold text-slate-900 dark:text-white">
                ${savedListings.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadItinerary}
                disabled={isDownloading}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonSecondary} flex items-center gap-1.5 shadow-sm`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Exporting...' : 'Download Itinerary'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary}`}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
