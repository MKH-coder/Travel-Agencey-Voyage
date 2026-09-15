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
  'emerald-warm': {
    bg: 'bg-[#faf8f5]',
    cardBg: 'bg-white',
    headerBg: 'bg-white/95 backdrop-blur-md border-b border-emerald-100/80',
    border: 'border-emerald-100',
    textPrimary: 'text-emerald-950',
    textSecondary: 'text-emerald-900/80',
    textMuted: 'text-emerald-800/60',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentText: 'text-emerald-700',
    accentBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    inputBg: 'bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20',
    buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20',
    buttonSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60',
    glowEffect: 'shadow-emerald-100/50',
  },
  'royal-gold': {
    bg: 'bg-[#0c0f1d]',
    cardBg: 'bg-[#12162a]',
    headerBg: 'bg-[#12162a]/95 backdrop-blur-md border-b border-amber-500/20',
    border: 'border-amber-500/10',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    accent: 'bg-amber-500',
    accentHover: 'hover:bg-amber-400',
    accentText: 'text-amber-400',
    accentBadge: 'bg-amber-950/40 text-amber-300 border-amber-800/50',
    inputBg: 'bg-[#0c0f1d] border-amber-500/20 text-white focus:border-amber-400 focus:ring-amber-400/20',
    buttonPrimary: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-500/10',
    buttonSecondary: 'bg-[#1a1f3b] hover:bg-[#21274a] text-amber-400 border border-amber-500/25',
    glowEffect: 'shadow-amber-500/5',
  },
  'violet-glass': {
    bg: 'bg-[#080212]',
    cardBg: 'bg-[#110624]',
    headerBg: 'bg-[#110624]/90 backdrop-blur-md border-b border-violet-900/40',
    border: 'border-violet-900/30',
    textPrimary: 'text-violet-50',
    textSecondary: 'text-violet-200',
    textMuted: 'text-violet-400/80',
    accent: 'bg-fuchsia-600',
    accentHover: 'hover:bg-fuchsia-500',
    accentText: 'text-fuchsia-400',
    accentBadge: 'bg-fuchsia-950/50 text-fuchsia-300 border-fuchsia-900/60',
    inputBg: 'bg-[#080212] border-violet-800/40 text-white focus:border-fuchsia-500 focus:ring-fuchsia-500/20',
    buttonPrimary: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-medium shadow-md shadow-fuchsia-900/40',
    buttonSecondary: 'bg-violet-950/60 hover:bg-violet-900/60 text-violet-200 border border-violet-800/50',
    glowEffect: 'shadow-fuchsia-950/50',
  },
  'emerald-black': {
    bg: 'bg-[#030705]',
    cardBg: 'bg-[#0a0f0c]',
    headerBg: 'bg-[#0a0f0c]/90 backdrop-blur-md border-b border-emerald-950/80',
    border: 'border-emerald-950/50',
    textPrimary: 'text-emerald-50',
    textSecondary: 'text-emerald-100/90',
    textMuted: 'text-emerald-400/60',
    accent: 'bg-emerald-500',
    accentHover: 'hover:bg-emerald-400',
    accentText: 'text-emerald-400',
    accentBadge: 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50',
    inputBg: 'bg-[#030705] border-emerald-900/40 text-emerald-50 focus:border-emerald-400 focus:ring-emerald-400/20',
    buttonPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/25',
    buttonSecondary: 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/50',
    glowEffect: 'shadow-emerald-900/50',
  },
  'rose-gold': {
    bg: 'bg-[#120e11]',
    cardBg: 'bg-[#1c151b]',
    headerBg: 'bg-[#1c151b]/95 backdrop-blur-md border-b border-rose-900/30',
    border: 'border-rose-950/40',
    textPrimary: 'text-rose-50',
    textSecondary: 'text-rose-200/90',
    textMuted: 'text-rose-400/60',
    accent: 'bg-rose-400',
    accentHover: 'hover:bg-rose-300',
    accentText: 'text-rose-300',
    accentBadge: 'bg-rose-950/50 text-rose-300 border-rose-900/40',
    inputBg: 'bg-[#120e11] border-rose-900/30 text-rose-50 focus:border-rose-400 focus:ring-rose-400/20',
    buttonPrimary: 'bg-rose-400 hover:bg-rose-300 text-slate-950 font-semibold shadow-md shadow-rose-400/10',
    buttonSecondary: 'bg-[#251b23] hover:bg-[#2d212b] text-rose-300 border border-rose-900/40',
    glowEffect: 'shadow-rose-950/40',
  },
  'nordic-frost': {
    bg: 'bg-[#f4f7f9]',
    cardBg: 'bg-white',
    headerBg: 'bg-white/95 backdrop-blur-md border-b border-sky-100',
    border: 'border-sky-100/80',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    accent: 'bg-sky-500',
    accentHover: 'hover:bg-sky-600',
    accentText: 'text-sky-600',
    accentBadge: 'bg-sky-50 text-sky-700 border-sky-200/60',
    inputBg: 'bg-white border-sky-200 text-slate-900 focus:border-sky-500 focus:ring-sky-500/20',
    buttonPrimary: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/10',
    buttonSecondary: 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/50',
    glowEffect: 'shadow-sky-100/50',
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
    const darkThemes: ThemeMode[] = ['dark-slate', 'crimson-black', 'royal-gold', 'violet-glass', 'emerald-black', 'rose-gold'];
    if (darkThemes.includes(theme)) {
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
