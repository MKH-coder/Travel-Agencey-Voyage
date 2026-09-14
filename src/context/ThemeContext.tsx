import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode } from '../types.ts';

interface ThemeStyles {
  bg: string;
  cardBg: string;
  headerBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentBadge: string;
  inputBg: string;
  buttonPrimary: string;
  buttonSecondary: string;
  glowEffect: string;
}

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  styles: ThemeStyles;
}

const themeTokens: Record<ThemeMode, ThemeStyles> = {
  'cyan-light': {
    bg: 'bg-slate-50',
    cardBg: 'bg-white',
    headerBg: 'bg-white/90 backdrop-blur-md border-b border-cyan-100/80',
    border: 'border-cyan-100',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accent: 'bg-cyan-500',
    accentHover: 'hover:bg-cyan-600',
    accentText: 'text-cyan-600',
    accentBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    inputBg: 'bg-white border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20',
    buttonPrimary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm shadow-cyan-500/20',
    buttonSecondary: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200/60',
    glowEffect: 'shadow-cyan-100/50',
  },
  'dark-slate': {
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    headerBg: 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800',
    border: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    accent: 'bg-sky-500',
    accentHover: 'hover:bg-sky-400',
    accentText: 'text-sky-400',
    accentBadge: 'bg-sky-950/60 text-sky-300 border-sky-800/80',
    inputBg: 'bg-slate-800/80 border-slate-700 text-white focus:border-sky-400 focus:ring-sky-400/20',
    buttonPrimary: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-md shadow-sky-950/50',
    buttonSecondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    glowEffect: 'shadow-slate-950/80',
  },
  'crimson-black': {
    bg: 'bg-black',
    cardBg: 'bg-zinc-950',
    headerBg: 'bg-black/90 backdrop-blur-md border-b border-zinc-900',
    border: 'border-zinc-800',
    textPrimary: 'text-zinc-50',
    textSecondary: 'text-zinc-300',
    textMuted: 'text-zinc-400',
    accent: 'bg-rose-600',
    accentHover: 'hover:bg-rose-500',
    accentText: 'text-rose-500',
    accentBadge: 'bg-rose-950/50 text-rose-300 border-rose-900/70',
    inputBg: 'bg-zinc-900 border-zinc-800 text-white focus:border-rose-500 focus:ring-rose-500/20',
    buttonPrimary: 'bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-900/40',
    buttonSecondary: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800',
    glowEffect: 'shadow-rose-950/60',
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('travel_theme') as ThemeMode;
    return saved && themeTokens[saved] ? saved : 'cyan-light';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('travel_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark-slate' || theme === 'crimson-black') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, styles: themeTokens[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
