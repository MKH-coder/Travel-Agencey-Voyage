import React, { useState, useEffect } from 'react';
import { X, Package, Plus, Trash2, Search, CheckCircle2, AlertTriangle, Layers, MapPin, DollarSign, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Listing } from '../types.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface PackageCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageCreated: () => void;
  initialData?: Listing | null;
}

export const PackageCreatorModal: React.FC<PackageCreatorModalProps> = ({
  isOpen,
  onClose,
  onPackageCreated,
  initialData,
}) => {
  const { styles } = useTheme();
  const { token, user } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  
  const [availableListings, setAvailableListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchListings();
      if (initialData) {
        if (initialData.category === 'PACKAGE') {
          // Editing existing package
          setTitle(initialData.title);
          setPrice(initialData.price);
          setDuration(initialData.duration || '');
          setLocation(initialData.location);
          setCountry(initialData.country);
          setDescription(initialData.description);
          setImages(initialData.images || []);
          setSelectedListingIds(initialData.listingIds || []);
          setStatus(initialData.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
        } else {
          // Creating a package from an existing post / listing
          setTitle(`${initialData.title} Signature Tour Package`);
          setPrice(initialData.price);
          setDuration(initialData.duration || '4 Days / 3 Nights');
          setLocation(initialData.location);
          setCountry(initialData.country);
          setDescription(`Experience the best of ${initialData.location}, ${initialData.country} with our hand-crafted tour package centered around ${initialData.title}. Features curated stays, local activities, and 24/7 dedicated concierge assistance.`);
          setImages(initialData.images || []);
          setSelectedListingIds([initialData.id]);
          setStatus('PUBLISHED');
        }
      } else {
        // Reset for brand new creation
        setTitle('');
        setPrice(0);
        setDuration('');
        setLocation('');
        setCountry('');
        setDescription('');
        setImages([]);
        setSelectedListingIds([]);
        setStatus('PUBLISHED');
      }
    }
  }, [isOpen, initialData]);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/listings?status=PUBLISHED');
      if (res.ok) {
        const data = await res.json();
        // Filter out existing packages to avoid infinite nesting for now
        setAvailableListings(data.filter((l: Listing) => l.category !== 'PACKAGE' || l.id === initialData?.id));
      }
    } catch (err) {
      console.error('Failed to fetch listings for package creator:', err);
    }
  };

  if (!isOpen) return null;

  const toggleListingSelection = (id: string) => {
    setSelectedListingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return setError('Title is required');
    if (selectedListingIds.length < 1) return setError('Please select at least 1 destination or experience listing');
    if (price <= 0) return setError('Price must be greater than 0');
    if (!location.trim()) return setError('Location is required');
    if (!country.trim()) return setError('Country is required');

    setIsSaving(true);
    setError('');

    // Automatically use images from the selected listings if no images are provided
    let finalImages = images;
    if (finalImages.length === 0) {
      const selected = availableListings.filter(l => selectedListingIds.includes(l.id));
      finalImages = selected.map(l => l.images[0]).filter(Boolean);
    }
    if (finalImages.length === 0 && initialData?.images?.length) {
      finalImages = initialData.images;
    }

    try {
      const isEditingExistingPackage = initialData && initialData.category === 'PACKAGE';
      const method = isEditingExistingPackage ? 'PATCH' : 'POST';
      const url = isEditingExistingPackage ? `/api/listings/${initialData.id}` : '/api/listings';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category: 'PACKAGE',
          price: Number(price),
          location: location.trim(),
          country: country.trim(),
          duration: duration.trim() || undefined,
          description: description.trim() || `Curated luxury bundle including ${selectedListingIds.length} premium experiences.`,
          images: finalImages,
          listingIds: selectedListingIds,
          status: status, 
          tags: ['Luxury Bundle', 'Tour Package', 'Curated Journey', 'Verified Agency'],
        }),
      });

      if (res.ok) {
        setSuccess(isEditingExistingPackage ? 'Package updated successfully!' : 'Luxury package created successfully!');
        AuthAudit.showToast({
          title: isEditingExistingPackage ? 'Package Updated' : 'Tour Package Created',
          message: `"${title.trim()}" is now ${status === 'PUBLISHED' ? 'live on the platform' : 'saved as draft'}.`,
          type: 'success',
          isAdminAction: true,
          adminActionType: isEditingExistingPackage ? 'update' : 'create',
        });
        onPackageCreated();
        setTimeout(onClose, 1200);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to process package');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredListings = availableListings.filter(l => {
    if (!searchQuery.trim()) return true;
    const raw = searchQuery.trim().toLowerCase();
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

  const selectedListings = availableListings.filter(l => selectedListingIds.includes(l.id));
  const autoCalculatedPrice = selectedListings.reduce((sum, l) => sum + l.price, 0);
  const discountPercent = autoCalculatedPrice > 0 ? Math.round(((autoCalculatedPrice - price) / autoCalculatedPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className={`w-full max-w-4xl rounded-[2rem] border ${styles.border} ${styles.cardBg} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${styles.textPrimary}`}>Bundle Luxury Package</h3>
              <p className={`text-sm ${styles.textMuted}`}>Select multiple premium listings to create a curated travel bundle.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Package Info */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Package Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Ultimate Amalfi Gastronomy & Stay"
                  className={`w-full p-3 rounded-xl border ${styles.border} ${styles.inputBg} outline-none text-sm focus:ring-2 focus:ring-amber-500/50 transition-all`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bundle Price (USD) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={price} 
                      onChange={e => setPrice(Number(e.target.value))}
                      className={`w-full pl-9 p-3 rounded-xl border ${styles.border} ${styles.inputBg} outline-none text-sm focus:ring-2 focus:ring-amber-500/50 transition-all`}
                    />
                  </div>
                  {autoCalculatedPrice > 0 && (
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 italic">Sum: ${autoCalculatedPrice}</span>
                      {discountPercent > 0 && <span className="text-emerald-500 font-bold">-{discountPercent}% OFF</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Country *</label>
                  <input 
                    type="text" 
                    value={country} 
                    onChange={e => setCountry(e.target.value)}
                    placeholder="e.g., Albania"
                    className={`w-full p-3 rounded-xl border ${styles.border} ${styles.inputBg} outline-none text-sm focus:ring-2 focus:ring-amber-500/50 transition-all`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={duration} 
                      onChange={e => setDuration(e.target.value)}
                      placeholder="e.g., 7 Days / 6 Nights"
                      className={`w-full pl-9 p-3 rounded-xl border ${styles.border} ${styles.inputBg} outline-none text-sm focus:ring-2 focus:ring-amber-500/50 transition-all`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g., Positano"
                      className={`w-full pl-9 p-3 rounded-xl border ${styles.border} ${styles.inputBg} outline-none text-sm focus:ring-2 focus:ring-amber-500/50 transition-all`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bundle Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the unique value of this curated bundle..."
                  className={`w-full p-3 rounded-xl border ${styles.border} ${styles.inputBg} outline-none text-sm focus:ring-2 focus:ring-amber-500/50 transition-all resize-none`}
                />
              </div>
            </div>

            {selectedListingIds.length > 0 && (
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Included in Bundle ({selectedListingIds.length})</label>
                <div className="space-y-2">
                  {selectedListings.map(l => (
                    <div key={l.id} className={`flex items-center gap-3 p-2 rounded-xl border ${styles.border} bg-white/5`}>
                      <img src={l.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{l.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{l.location}, {l.country}</p>
                      </div>
                      <button onClick={() => toggleListingSelection(l.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Listing Selector */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-black/5 dark:bg-black/20">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search live catalog for items..."
                  className={`w-full pl-9 p-2.5 rounded-xl border ${styles.border} ${styles.inputBg} outline-none text-xs`}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredListings.length > 0 ? (
                filteredListings.map(l => {
                  const isSelected = selectedListingIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleListingSelection(l.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5' 
                          : `${styles.border} hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/50`
                      }`}
                    >
                      <img src={l.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                            l.category === 'HOTEL' ? 'bg-sky-500/10 text-sky-500' : 
                            l.category === 'FOOD' ? 'bg-emerald-500/10 text-emerald-500' : 
                            'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {l.category}
                          </span>
                          <span className="text-[10px] font-bold text-amber-500">${l.price}</span>
                        </div>
                        <p className={`text-xs font-bold truncate mt-0.5 ${styles.textPrimary}`}>{l.title}</p>
                        <p className={`text-[10px] truncate ${styles.textMuted}`}>{l.location}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                  <Layers className="w-12 h-12 mb-3" />
                  <p className="text-sm font-medium">No experiences found in catalog</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold animate-in slide-in-from-left-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold animate-in slide-in-from-left-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mr-2">
              <button
                type="button"
                onClick={() => setStatus('PUBLISHED')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${status === 'PUBLISHED' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-400'}`}
              >
                Live
              </button>
              <button
                type="button"
                onClick={() => setStatus('DRAFT')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${status === 'DRAFT' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400'}`}
              >
                Draft
              </button>
            </div>
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold ${styles.buttonSecondary} transition-all`}
            >
              Discard
            </button>
            <button
              disabled={isSaving || selectedListingIds.length < 1}
              onClick={handleSave}
              className={`flex-1 sm:flex-initial px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all ${
                isSaving || selectedListingIds.length < 1 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : status === 'PUBLISHED' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>{status === 'PUBLISHED' ? 'Publish Bundle' : 'Save as Draft'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
