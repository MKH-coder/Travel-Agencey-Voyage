import React, { useState, useEffect } from 'react';
import { X, Layers, Star, MapPin, CheckCircle2, ArrowRight, DollarSign, Clock, Tag, Sparkles, Phone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { Listing } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface PackagePreviewModalProps {
  listing: Listing | null;
  onClose: () => void;
  onBook: (listing: Listing) => void;
}

export const PackagePreviewModal: React.FC<PackagePreviewModalProps> = ({
  listing,
  onClose,
  onBook,
}) => {
  const { styles } = useTheme();
  const [includedListings, setIncludedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (listing?.category === 'PACKAGE' && listing.listingIds?.length) {
      const fetchIncluded = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/listings');
          if (res.ok) {
            const all: Listing[] = await res.json();
            const filtered = listing.listingIds!.map(id => all.find(l => l.id === id)).filter((l): l is Listing => !!l);
            setIncludedListings(filtered);
          }
        } catch (err) {
          console.warn('Failed to fetch package components:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchIncluded();
    }
  }, [listing]);

  if (!listing) return null;

  const totalOriginalPrice = includedListings.reduce((sum, l) => sum + l.price, 0);
  const discountAmount = totalOriginalPrice - listing.price;
  const discountPercent = totalOriginalPrice > 0 ? Math.round((discountAmount / totalOriginalPrice) * 100) : 0;

  const handleBook = () => {
    onBook(listing);
    setIsSuccess(true);
    AuthAudit.showToast({
      title: 'Booking Confirmed!',
      message: `Your luxury package "${listing.title}" is reserved. Contact: +91 9567465134`,
      type: 'success',
      duration: 8000,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-4xl rounded-[2.5rem] border ${styles.border} ${styles.cardBg} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
               <Layers className="w-5 h-5" />
             </div>
             <div>
               <h2 className={`text-xl font-bold ${styles.textPrimary}`}>Luxury Package Preview</h2>
               <p className={`text-xs ${styles.textMuted}`}>Curated bundle of premium experiences</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
             <X className="w-6 h-6 text-slate-400" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
           {isSuccess ? (
             <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                   <Sparkles className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                   <h3 className={`text-3xl font-black ${styles.textPrimary}`}>Booking Successful!</h3>
                   <p className={`text-sm ${styles.textSecondary} max-w-md mx-auto leading-relaxed`}>
                     Your luxury adventure is confirmed. Our dedicated concierge will contact you shortly to finalize every detail of your journey.
                   </p>
                </div>
                
                <div className={`p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border ${styles.border} w-full max-w-sm space-y-4`}>
                   <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-3">
                      <span>Assigned Concierge</span>
                      <span className="text-emerald-500">Available Now</span>
                   </div>
                   <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
                         <Phone className="w-6 h-6" />
                      </div>
                      <div>
                         <div className={`text-sm font-bold ${styles.textPrimary}`}>Official Support Line</div>
                         <div className="text-lg font-black text-sky-500 tracking-tight">+91 9567465134</div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={onClose}
                  className={`px-12 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:scale-[1.02] transition-transform`}
                >
                  Return to Dashboard
                </button>
             </div>
           ) : (
             <>
               {/* Top Section: Main Info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-lg">
                   <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex flex-col justify-center space-y-4">
                    <div>
                       <h3 className={`text-2xl font-black tracking-tight ${styles.textPrimary} leading-tight`}>{listing.title}</h3>
                       <div className="flex items-center gap-2 mt-1.5 text-xs text-sky-500 font-semibold uppercase tracking-wider">
                         <MapPin className="w-3.5 h-3.5" />
                         <span>{listing.location}, {listing.country}</span>
                       </div>
                    </div>

                    <p className={`text-sm ${styles.textSecondary} leading-relaxed`}>{listing.description}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                       {listing.duration && (
                         <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {listing.duration}
                         </span>
                       )}
                       <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                          Verified Bundle
                       </span>
                    </div>
                 </div>
               </div>

               {/* Component Breakdown */}
               <div className="space-y-4">
                  <h4 className={`text-sm font-black uppercase tracking-widest ${styles.textPrimary} flex items-center gap-2`}>
                    <Tag className="w-4 h-4 text-sky-500" />
                    Bundle Components Breakdown
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="h-24 rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800" />
                        ))
                     ) : includedListings.map(item => (
                        <div key={item.id} className={`flex gap-4 p-4 rounded-3xl border ${styles.border} ${styles.cardBg} shadow-sm group hover:border-sky-500/30 transition-all cursor-default`}>
                           <img src={item.images[0]} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-sm" />
                           <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <span className="text-[10px] font-extrabold text-sky-500 uppercase tracking-tighter">{item.category}</span>
                                <h5 className={`text-sm font-bold truncate ${styles.textPrimary}`}>{item.title}</h5>
                                <p className={`text-[11px] truncate ${styles.textMuted}`}>{item.location}</p>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                 <div className="flex items-center gap-1">
                                   <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                   <span className="text-[11px] font-bold text-slate-500">{item.rating.toFixed(1)}</span>
                                 </div>
                                 <span className="text-xs font-bold text-slate-400 line-through">${item.price}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Pricing Breakdown Card */}
               <div className={`p-6 rounded-[2rem] bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 shadow-inner`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex-1 text-center md:text-left">
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-1">Exclusive Bundle Pricing</div>
                        <p className={`text-sm ${styles.textSecondary}`}>
                           By booking these components together, you save <strong className="text-emerald-500">${discountAmount}</strong> compared to individual platform rates.
                        </p>
                     </div>
                     
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <div className="text-xs text-slate-400 font-medium mb-0.5">Individual Sum</div>
                           <div className="text-lg font-bold text-slate-500 line-through">${totalOriginalPrice}</div>
                        </div>
                        <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
                        <div className="text-center">
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 mb-2">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {discountPercent}% SAVINGS
                           </div>
                           <div className="text-4xl font-black text-amber-500 tracking-tighter">
                              ${listing.price}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             </>
           )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="p-6 border-t border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
             <button 
               onClick={onClose}
               className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-bold ${styles.buttonSecondary}`}
             >
               Continue Browsing
             </button>
             <button 
               onClick={handleBook}
               className={`w-full sm:w-auto px-12 py-3 rounded-2xl text-sm font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3`}
             >
               <span>Book Bundle Now</span>
               <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

