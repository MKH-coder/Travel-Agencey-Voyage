import React from 'react';
import { CheckCircle2, Clock, MapPin, PlaneTakeoff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { CustomTripRequest } from '../types.ts';

interface TripProgressBarProps {
  status: CustomTripRequest['status'];
}

export const TripProgressBar: React.FC<TripProgressBarProps> = ({ status }) => {
  const { styles } = useTheme();

  // Mapping current status to 3 stages
  // Stage 1: Booking Confirmed (Request Submitted/Review)
  // Stage 2: Documents Ready (Quoted)
  // Stage 3: Departure (Confirmed)
  const getStage = () => {
    if (status === 'CONFIRMED') return 3;
    if (status === 'QUOTED') return 2;
    return 1; // SUBMITTED or UNDER_REVIEW
  };

  const stage = getStage();
  const stages = [
    { id: 1, label: 'Booking Request', icon: <Clock className="w-4 h-4" /> },
    { id: 2, label: 'Documents Ready', icon: <MapPin className="w-4 h-4" /> },
    { id: 3, label: 'Departure', icon: <PlaneTakeoff className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-sky-500 transition-all duration-500"
          style={{ width: `${((stage - 1) / (stages.length - 1)) * 100}%` }}
        />

        {stages.map((s, index) => {
          const isActive = stage >= s.id;
          const isCurrent = stage === s.id;
          return (
            <div key={s.id} className="relative flex flex-col items-center gap-2 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {s.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
