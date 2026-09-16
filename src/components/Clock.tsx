import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface ClockProps {
  className?: string;
}

export const Clock: React.FC<ClockProps> = ({ className = '' }) => {
  const { styles } = useTheme();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Avoid SSR hydration mismatch by setting time in useEffect
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div 
        id="clock-skeleton"
        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} text-xs font-medium shadow-sm transition-all h-[34px] w-[180px] animate-pulse`}
      />
    );
  }

  const formattedDate = format(time, 'iii, MMM d');
  const formattedTime = format(time, 'hh:mm:ss a');

  return (
    <div 
      id="travel-platform-clock"
      className={`hidden md:flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border ${styles.border} ${styles.cardBg} ${styles.textPrimary} text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      title={`Local Time: ${format(time, 'PPPP p')}`}
    >
      <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
      <span className="opacity-90 shrink-0 select-none">
        {formattedDate}
      </span>
      <span className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700 mx-0.5 shrink-0" />
      <span className="font-mono font-bold tracking-tight text-sky-500 dark:text-sky-400 shrink-0 select-none text-center">
        {formattedTime}
      </span>
    </div>
  );
};
