import React, { useState, useEffect } from 'react';
import { Check, Square, Package, BookOpen, Shirt, Laptop, Briefcase, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface PackingChecklistProps {
  listingId: string;
  listingTitle: string;
}

interface PackingItem {
  id: string;
  label: string;
  category: 'Essentials' | 'Clothing' | 'Electronics' | 'Toiletries';
}

const ITEMS: PackingItem[] = [
  { id: 'doc-1', label: 'Passport & Visas', category: 'Essentials' },
  { id: 'doc-2', label: 'Travel Insurance Documents', category: 'Essentials' },
  { id: 'doc-3', label: 'Flight Tickets & Booking Vouchers', category: 'Essentials' },
  { id: 'doc-4', label: 'Local Currency (Lek)', category: 'Essentials' },
  { id: 'cloth-1', label: 'Modest Attire (Mosque/Church)', category: 'Clothing' },
  { id: 'cloth-2', label: 'Comfortable Walking Shoes', category: 'Clothing' },
  { id: 'cloth-3', label: 'Lightweight Clothing', category: 'Clothing' },
  { id: 'cloth-4', label: 'Jacket for Evenings', category: 'Clothing' },
  { id: 'elec-1', label: 'Phone Charger & Cable', category: 'Electronics' },
  { id: 'elec-2', label: 'Power Bank', category: 'Electronics' },
  { id: 'elec-3', label: 'Universal Adapter (Type C/F)', category: 'Electronics' },
  { id: 'toil-1', label: 'Sunscreen & Sunglasses', category: 'Toiletries' },
  { id: 'toil-2', label: 'Basic First Aid Kit', category: 'Toiletries' },
  { id: 'toil-3', label: 'Toiletries & Personal Care', category: 'Toiletries' },
];

export const PackingChecklist: React.FC<PackingChecklistProps> = ({ listingId, listingTitle }) => {
  const { styles } = useTheme();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`voyage_packing_${listingId}`);
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, [listingId]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      localStorage.setItem(`voyage_packing_${listingId}`, JSON.stringify(next));
      return next;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Essentials': return <BookOpen className="w-4 h-4 text-sky-500" />;
      case 'Clothing': return <Shirt className="w-4 h-4 text-emerald-500" />;
      case 'Electronics': return <Laptop className="w-4 h-4 text-amber-500" />;
      default: return <Briefcase className="w-4 h-4 text-rose-500" />;
    }
  };

  const progress = (Object.values(checkedItems).filter(Boolean).length / ITEMS.length) * 100;

  return (
    <div className={`p-5 rounded-2xl border ${styles.border} ${styles.cardBg} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-black ${styles.textPrimary} flex items-center gap-2`}>
          <Package className="w-5 h-5" />
          Packing Checklist
        </h3>
        <span className="text-xs font-bold text-slate-500">
          {Math.round(progress)}% Packed
        </span>
      </div>

      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-6">
        {['Essentials', 'Clothing', 'Electronics', 'Toiletries'].map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {getCategoryIcon(cat)}
              {cat}
            </div>
            <div className="space-y-2">
              {ITEMS.filter(i => i.category === cat).map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-3 w-full text-left group cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${checkedItems[item.id] ? 'bg-sky-500 text-white' : 'border border-slate-300 dark:border-slate-700'}`}>
                    {checkedItems[item.id] ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />}
                  </div>
                  <span className={`text-sm ${checkedItems[item.id] ? 'text-slate-500 line-through' : styles.textPrimary}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
