import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Image as ImageIcon, Sparkles, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Listing } from '../types.ts';
import { ClientStorageManager } from '../services/clientStorage.ts';
import { AuthAudit } from '../services/authAudit.ts';

interface EditContentModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onListingUpdated: () => void;
}

const PHOTO_SUGGESTIONS = [
  { label: 'Sunset Vista', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Gourmet Table', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cliffside Panorama', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Fine Wine & Terrace', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Zen Garden Path', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Luxury Suite', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80' },
];

export const EditContentModal: React.FC<EditContentModalProps> = ({
  listing,
  isOpen,
  onClose,
  onListingUpdated,
}) => {
  const { styles } = useTheme();
  const { token } = useAuth();

  const [title, setTitle] = useState(listing?.title || '');
  const [price, setPrice] = useState(listing?.price || 0);
  const [location, setLocation] = useState(listing?.location || '');
  const [country, setCountry] = useState(listing?.country || '');
  const [category, setCategory] = useState<'PLACE' | 'HOTEL' | 'FOOD'>(listing?.category || 'PLACE');
  const [description, setDescription] = useState(listing?.description || '');
  const [images, setImages] = useState<string[]>(listing?.images || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync when listing changes
  React.useEffect(() => {
    if (listing) {
      setTitle(listing.title || '');
      setPrice(listing.price || 0);
      setLocation(listing.location || '');
      setCountry(listing.country || '');
      setCategory(listing.category || 'PLACE');
      setDescription(listing.description);
      setImages(listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80']);
      setError('');
      setSuccess('');
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setImages(prev => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleAddPresetPhoto = (url: string) => {
    if (images.includes(url)) return;
    setImages(prev => [...prev, url]);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    if (images.length <= 1) {
      setError('A listing must have at least one photo.');
      return;
    }
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo exceeds 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImages(prev => [...prev, reader.result as string]);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    if (!location.trim()) {
      setError('Location cannot be empty.');
      return;
    }
    if (!country.trim()) {
      setError('Country cannot be empty.');
      return;
    }
    if (price <= 0) {
      setError('Price must be greater than 0.');
      return;
    }
    if (!description.trim()) {
      setError('Description cannot be empty.');
      return;
    }
    if (images.length === 0) {
      setError('Please provide at least one photo.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          price: Number(price),
          location: location.trim(),
          country: country.trim(),
          category,
          description: description.trim(),
          images,
        }),
      });

      if (res.ok) {
        setSuccess('Master catalog experience updated successfully!');
        AuthAudit.showToast({
          title: 'Catalog Updated',
          message: `"${title.trim()}" details successfully saved to the backend database.`,
          type: 'success',
          isAdminAction: true,
          adminActionType: 'update',
          duration: 6000
        });
        onListingUpdated();
        setTimeout(() => {
          onClose();
        }, 1000);
        return;
      }
    } catch {
      // Backend offline / static fallback
    }

    // Static fallback execution
    try {
      const updatedListing: Listing = {
        ...listing,
        title: title.trim(),
        price: Number(price),
        location: location.trim(),
        country: country.trim(),
        category,
        description: description.trim(),
        images,
        timestamps: {
          ...listing.timestamps,
          updatedAt: new Date().toISOString(),
        }
      };
      ClientStorageManager.saveListing(updatedListing);
      setSuccess('Master catalog experience updated successfully (Offline Fallback)!');
      AuthAudit.showToast({
        title: 'Catalog Updated (Offline)',
        message: `"${title.trim()}" saved locally to custom storage fallback.`,
        type: 'success',
        isAdminAction: true,
        adminActionType: 'update',
        duration: 5000
      });
      onListingUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 sm:p-8 relative space-y-5 max-h-[90vh] overflow-y-auto`}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${styles.textPrimary}`}>
              Edit Catalog Destination
            </h3>
            <p className={`text-xs ${styles.textMuted}`}>
              Update listing details, metadata, imagery, and copy for the global inventory.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* --- Core Metadata Fields for Admins --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Experience Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Oia Sunset Villa"
              className={`w-full p-2.5 text-xs rounded-xl outline-none border ${styles.border} ${styles.inputBg}`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Starting Price (USD) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="e.g., 350"
              className={`w-full p-2.5 text-xs rounded-xl outline-none border ${styles.border} ${styles.inputBg}`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Location / Municipality *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Oia, Santorini Island"
              className={`w-full p-2.5 text-xs rounded-xl outline-none border ${styles.border} ${styles.inputBg}`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Country *
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., Greece"
              className={`w-full p-2.5 text-xs rounded-xl outline-none border ${styles.border} ${styles.inputBg}`}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['PLACE', 'HOTEL', 'FOOD'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    category === cat
                      ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-sm'
                      : `border-slate-200 dark:border-slate-800 ${styles.textMuted} hover:bg-slate-100 dark:hover:bg-slate-800`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Photos Manager */}
        <div className="space-y-3">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Listing Photos ({images.length})
          </label>

          {/* Current Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <img src={img} alt={`Listing photo ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-black/75 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Photo URL / File */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2 flex items-center gap-1.5">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Paste new photo URL (https://...)"
                className={`flex-1 p-2 text-xs rounded-xl outline-none ${styles.inputBg}`}
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className={`px-3 py-2 rounded-xl text-xs font-semibold ${styles.buttonPrimary} shrink-0 flex items-center gap-1`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <label className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed ${styles.border} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-500`}>
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Local (&lt;5MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Preset Photo Suggestions */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Preset High-Resolution Inspirations:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PHOTO_SUGGESTIONS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAddPresetPhoto(preset.url)}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description Editor */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Editorial Description & Guest Experience *
            </label>
            <span className="text-[10px] text-slate-400">
              {description.length} characters
            </span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Highlight the architectural aesthetics, sensory impressions, culinary nuances, and curated host privileges..."
            className={`w-full p-3 text-xs rounded-xl outline-none leading-relaxed border ${styles.border} ${styles.inputBg}`}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${styles.buttonPrimary} shadow-md flex items-center gap-1.5`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Catalog Destination'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
