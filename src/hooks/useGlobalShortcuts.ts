import { useEffect } from 'react';

export interface ShortcutItem {
  key: string;
  description: string;
  action: () => void;
  /** If true, won't fire when user is typing in an input, textarea, select, or contenteditable */
  ignoreInputs?: boolean;
  /** Require Meta (Cmd on Mac) or Ctrl */
  ctrlOrCmd?: boolean;
  /** Require Alt/Option key */
  alt?: boolean;
  /** Require Shift key */
  shift?: boolean;
}

interface UseGlobalShortcutsOptions {
  onFocusSearch?: () => void;
  onCloseModals?: () => void;
  onToggleSavedTrips?: () => void;
  onToggleHelp?: () => void;
  onToggleTheme?: () => void;
  onSwitchView?: () => void;
  extraShortcuts?: ShortcutItem[];
}

/**
 * useGlobalShortcuts
 * Centralized keyboard shortcut listener for power users.
 * Supports:
 * - '/' or 'Cmd/Ctrl + K' -> Focus global search input
 * - 'Escape' -> Close any open modal or dismiss focused inputs
 * - '?' or 'Shift + /' -> Toggle Keyboard Shortcuts Cheat Sheet modal
 * - 'Cmd/Ctrl + B' -> Toggle Saved Trips / Bookmarks modal
 * - 'Cmd/Ctrl + J' or 'Cmd/Ctrl + D' -> Toggle Theme or View
 */
export function useGlobalShortcuts({
  onFocusSearch,
  onCloseModals,
  onToggleSavedTrips,
  onToggleHelp,
  onToggleTheme,
  onSwitchView,
  extraShortcuts = [],
}: UseGlobalShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      const isModifierPressed = e.metaKey || e.ctrlKey;

      // 1. ESCAPE key: Close modals or blur active input
      if (e.key === 'Escape') {
        if (isInput) {
          (activeElement as HTMLElement).blur();
        }
        if (onCloseModals) {
          onCloseModals();
        }
        return;
      }

      // 2. SEARCH FOCUS: '/' (when not already typing in an input) OR 'Cmd/Ctrl + K'
      if (
        (!isInput && e.key === '/' && !e.shiftKey && !isModifierPressed && !e.altKey) ||
        (isModifierPressed && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        if (onFocusSearch) {
          onFocusSearch();
        } else {
          // Fallback: try finding hero search or header search
          const heroInput = document.getElementById('hero-search-input') as HTMLInputElement | null;
          const headerInput = document.getElementById('header-search-input') as HTMLInputElement | null;
          if (heroInput) {
            heroInput.focus();
            heroInput.select();
          } else if (headerInput) {
            headerInput.focus();
            headerInput.select();
          }
        }
        return;
      }

      // 3. KEYBOARD SHORTCUTS HELP: '?' (Shift + /) when not inside an input
      if (!isInput && e.key === '?' && onToggleHelp) {
        e.preventDefault();
        onToggleHelp();
        return;
      }

      // 4. TOGGLE SAVED TRIPS / BOOKMARKS: 'Cmd/Ctrl + B' or 'b' (when not in input)
      if (
        (isModifierPressed && e.key.toLowerCase() === 'b') ||
        (!isInput && !isModifierPressed && !e.altKey && e.key.toLowerCase() === 'b')
      ) {
        if (onToggleSavedTrips) {
          e.preventDefault();
          onToggleSavedTrips();
          return;
        }
      }

      // 5. TOGGLE THEME: 'Cmd/Ctrl + Shift + T' or 't' (when not in input)
      if (!isInput && !isModifierPressed && !e.altKey && e.key.toLowerCase() === 't' && onToggleTheme) {
        e.preventDefault();
        onToggleTheme();
        return;
      }

      // 6. TOGGLE EXPLORE / ADMIN VIEW: 'Cmd/Ctrl + Shift + A'
      if (isModifierPressed && e.shiftKey && e.key.toLowerCase() === 'a' && onSwitchView) {
        e.preventDefault();
        onSwitchView();
        return;
      }

      // 7. Extra custom shortcuts
      for (const shortcut of extraShortcuts) {
        if (shortcut.ignoreInputs && isInput) continue;
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrlCmd = shortcut.ctrlOrCmd ? isModifierPressed : !isModifierPressed;
        const matchesAlt = shortcut.alt ? e.altKey : !e.altKey;
        const matchesShift = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (matchesKey && matchesCtrlCmd && matchesAlt && matchesShift) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onFocusSearch,
    onCloseModals,
    onToggleSavedTrips,
    onToggleHelp,
    onToggleTheme,
    onSwitchView,
    extraShortcuts,
  ]);
}
