import React, { useState } from 'react';
import {
  X,
  Compass,
  Calendar,
  Clock,
  MapPin,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Sparkles,
  Luggage,
  Hotel,
  UtensilsCrossed,
  Share2
} from 'lucide-react';
import { Listing } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface SavedTripTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle?: string;
  initialItems: Listing[];
  onSaveTimeline?: (updatedItems: Listing[]) => void;
}

export const SavedTripTimelineModal: React.FC<SavedTripTimelineModalProps> = ({
  isOpen,
  onClose,
  tripTitle = 'Curated Expedition Itinerary',
  initialItems,
  onSaveTimeline,
}) => {
  const { styles } = useTheme();
  const [items, setItems] = useState<Listing[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...items];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, movedItem);

    setItems(updated);
    setDraggedIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setItems(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleSaveOrder = () => {
    if (onSaveTimeline) {
      onSaveTimeline(items);
    }
    setSuccessMessage('Itinerary timeline order successfully saved!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[800px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Interactive Trip Timeline</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                  Drag & Drop Reorder
                </span>
              </h2>
              <p className="text-xs text-slate-400">{tripTitle} ({items.length} Stops)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveOrder}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Itinerary</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-6 py-2.5 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-xs text-slate-400 mb-2">
            Tip: Drag items by the handle (<GripVertical className="w-3.5 h-3.5 inline" />) or use the arrow buttons to reorder your daily sequence.
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-spin-slow" />
              <div className="text-sm font-bold text-slate-300">No stops in this itinerary</div>
              <p className="text-xs text-slate-500 mt-1">Add destinations or packages to start building your timeline.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {items.map((item, index) => {
                const dayNumber = Math.floor(index / 2) + 1;
                const timeSlot = index % 2 === 0 ? '09:30 AM · Morning Exploration' : '03:00 PM · Afternoon Activity';

                return (
                  <div
                    key={item.id + index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className="relative group bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-4 transition-all shadow-md flex items-center gap-4 cursor-grab active:cursor-grabbing"
                  >
                    {/* Timeline Node Badge */}
                    <div className="absolute -left-6 w-6 h-6 rounded-full bg-slate-950 border-2 border-sky-500 flex items-center justify-center text-[10px] font-black text-sky-400 shadow-sm">
                      {index + 1}
                    </div>

                    {/* Drag Handle */}
                    <div className="text-slate-600 group-hover:text-slate-300 cursor-grab shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                      <img src={item.images[0] || ''} alt={item.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold uppercase tracking-wider">
                          Day {dayNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeSlot}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white truncate">{item.title}</h4>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                        <span className="truncate">{item.location}, {item.country}</span>
                      </div>
                    </div>

                    {/* Reorder and Remove Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === items.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer ml-2"
                        title="Remove from Timeline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div>Total Stops: <strong className="text-white">{items.length}</strong></div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOrder}
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-colors cursor-pointer shadow-md"
            >
              Apply Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
