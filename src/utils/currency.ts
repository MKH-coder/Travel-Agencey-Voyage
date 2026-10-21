export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'ALL' | 'GBP' | 'AED' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'SGD' | 'CNY' | 'TRY';

export interface CurrencyDetails {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateVsUsd: number; // 1 USD = rateVsUsd in local currency
  position: 'before' | 'after';
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDetails> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateVsUsd: 1.0,
    position: 'before',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rateVsUsd: 0.92,
    position: 'before',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rateVsUsd: 0.79,
    position: 'before',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rateVsUsd: 83.2,
    position: 'before',
  },
  ALL: {
    code: 'ALL',
    symbol: 'Lek',
    name: 'Albanian Lek',
    flag: '🇦🇱',
    rateVsUsd: 93.5,
    position: 'after',
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    rateVsUsd: 3.67,
    position: 'after',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rateVsUsd: 154.5,
    position: 'before',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rateVsUsd: 1.36,
    position: 'before',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rateVsUsd: 1.52,
    position: 'before',
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    rateVsUsd: 0.90,
    position: 'before',
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    rateVsUsd: 1.35,
    position: 'before',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳',
    rateVsUsd: 7.23,
    position: 'before',
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    flag: '🇹🇷',
    rateVsUsd: 32.2,
    position: 'before',
  },
};

export function convertPrice(usdAmount: number, targetCurrency: CurrencyCode): number {
  const details = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  return Math.round(usdAmount * details.rateVsUsd);
}

export function formatPrice(usdAmount: number, targetCurrency: CurrencyCode = 'USD'): string {
  const details = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  const converted = convertPrice(usdAmount, targetCurrency);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(converted);

  if (details.position === 'after') {
    return `${formattedNumber} ${details.symbol}`;
  }
  return `${details.symbol}${formattedNumber}`;
}
