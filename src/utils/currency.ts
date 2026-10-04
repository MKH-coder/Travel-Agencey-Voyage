export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'ALL' | 'GBP';

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
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rateVsUsd: 0.79,
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
