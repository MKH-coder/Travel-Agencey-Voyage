import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit3, Layers, ArrowRight, ExternalLink, Calendar, DollarSign, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { Listing } from '../types.ts';

interface PackageBuilderTabProps {
  listings: Listing[];
  onBuildNew: () => void;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  onViewDetails: (listing: Listing) => void;
}

export const PackageBuilderTab: React.FC<PackageBuilderTabProps> = ({
  listings,
  onBuildNew,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const { styles } = useTheme();
  const { formatPrice } = useCurrency();
  const packages = listings.filter(l => l.category === 'PACKAGE');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${styles.textPrimary}`}>Travel Package Builder</h2>
          <p className={`text-xs ${styles.textMuted}`}>Create and manage discounted bundles of multiple travel experiences.</p>
        </div>
        <button
          onClick={onBuildNew}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Build New Package</span>
        </button>
      </div>

      {packages.length === 0 ? (
        <div className={`p-12 text-center border-2 border-dashed ${styles.border} rounded-[2.5rem] bg-slate-50/50 dark:bg-white/5`}>
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${styles.textPrimary}`}>No Bundles Yet</h3>
          <p className={`text-sm ${styles.textMuted} max-w-md mx-auto mb-8`}>
            Increase your conversion rates by bundling popular hotels, restaurants, and tours into attractive, discounted packages.
          </p>
          <button
            onClick={onBuildNew}
            className={`px-8 py-3 rounded-xl font-bold text-sm ${styles.buttonPrimary}`}
          >
            Create Your First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className={`group rounded-[2rem] border ${styles.border} ${styles.cardBg} overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col`}>
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-md bg-amber-500/90 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <Layers className="w-3 h-3" />
                  <span>{pkg.listingIds?.length || 0} Items Bundled</span>
                </div>
                {pkg.duration && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-md bg-black/60 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{pkg.duration}</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className={`text-lg font-bold ${styles.textPrimary} group-hover:text-amber-500 transition-colors`}>{pkg.title}</h4>
                  <p className={`text-xs ${styles.textMuted} mt-1 flex items-center gap-1`}>
                    <Calendar className="w-3.5 h-3.5" />
                    Created {new Date(pkg.timestamps.createdAt).toLocaleDateString()}
                  </p>
                  <p className={`text-sm ${styles.textSecondary} mt-4 line-clamp-2 leading-relaxed`}>{pkg.description}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bundle Price</span>
                      <span className="text-2xl font-black text-amber-500">{formatPrice(pkg.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(pkg)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-sky-500 transition-colors border border-slate-200 dark:border-slate-700"
                        title="Edit Bundle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(pkg.id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 transition-all border border-rose-500/20 hover:text-white"
                        title="Delete Bundle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onViewDetails(pkg)}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${styles.buttonSecondary} hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all`}
                  >
                    <span>View Bundle on Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
