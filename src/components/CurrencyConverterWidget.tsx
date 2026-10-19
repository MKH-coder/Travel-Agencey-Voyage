import React from 'react';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { ChevronDown } from 'lucide-react';

export const CurrencyConverterWidget: React.FC = () => {
  const { currency, setCurrency, availableCurrencies, currentCurrency } = useCurrency();
  const { styles } = useTheme();

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <span className="text-base">{currentCurrency.flag}</span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as any)}
          className={`bg-transparent text-xs font-bold ${styles.textPrimary} focus:outline-none cursor-pointer appearance-none pr-5`}
        >
          {availableCurrencies.map(c => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
      </div>
    </div>
  );
};
