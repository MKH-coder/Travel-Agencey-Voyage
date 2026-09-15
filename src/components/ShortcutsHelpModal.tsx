import React from 'react';
import { X, Command, Search, Sparkles, BookMarked, Sliders, Moon, Layers, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ isOpen, onClose }) => {
  const { styles } = useTheme();

  if (!isOpen) return null;

  const shortcutsList = [
    {
      keys: ['/', 'Cmd/Ctrl + K'],
      description: 'Focus search input from anywhere',
      category: 'Navigation',
      icon: <Search className="w-4 h-4 text-sky-500" />,
    },
    {
      keys: ['Esc'],
      description: 'Close any open modal or dismiss focused input',
      category: 'Navigation',
      icon: <X className="w-4 h-4 text-rose-500" />,
    },
    {
      keys: ['B', 'Cmd/Ctrl + B'],
      description: 'Open Saved Trips & Itinerary Bookmarks',
      category: 'Actions',
      icon: <BookMarked className="w-4 h-4 text-teal-500" />,
    },
    {
      keys: ['T'],
      description: 'Cycle through visual themes',
      category: 'Customization',
      icon: <Moon className="w-4 h-4 text-amber-500" />,
    },
    {
      keys: ['1', '2', '3'],
      description: 'Switch layout: Split (1), Grid (2), Map (3)',
      category: 'Views',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
    },
    {
      keys: ['?'],
      description: 'Toggle this Keyboard Shortcuts cheat sheet',
      category: 'Help',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border ${styles.border} ${styles.cardBg} shadow-2xl p-6 sm:p-7 overflow-hidden space-y-5`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${styles.accent} text-white shadow-md flex items-center justify-center`}>
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${styles.textPrimary} flex items-center gap-2`}>
                <span>Keyboard Shortcuts</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold">
                  Power User
                </span>
              </h3>
              <p className={`text-xs ${styles.textMuted}`}>
                Navigate Voyage at light speed with global hotkeys
              </p>
            </div>
          </div>

          <button
            id="close-shortcuts-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutsList.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${styles.border} ${styles.inputBg} flex items-center justify-between gap-4 transition-all hover:border-sky-500/30`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/80 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className={`text-xs font-bold ${styles.textPrimary}`}>{item.description}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {item.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold tracking-wide rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Esc
            </kbd>
            <span>at any time to dismiss</span>
          </div>
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${styles.buttonSecondary}`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
