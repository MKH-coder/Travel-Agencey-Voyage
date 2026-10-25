export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'ALL' | 'GBP' | 'AED' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'SGD' | 'CNY' | 'TRY' | 'NZD' | 'ZAR' | 'BRL' | 'KRW' | 'MXN' | 'SEK' | 'NOK' | 'THB' | 'IDR' | 'MYR' | 'PHP' | 'VND' | 'HKD' | 'TWD' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS' | 'SAR' | 'QAR';

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
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    flag: '🇳🇿',
    rateVsUsd: 1.65,
    position: 'before',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    flag: '🇿🇦',
    rateVsUsd: 18.4,
    position: 'before',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    flag: '🇧🇷',
    rateVsUsd: 5.05,
    position: 'before',
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    flag: '🇰🇷',
    rateVsUsd: 1375.0,
    position: 'before',
  },
  MXN: {
    code: 'MXN',
    symbol: 'MEX$',
    name: 'Mexican Peso',
    flag: '🇲🇽',
    rateVsUsd: 17.1,
    position: 'before',
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    flag: '🇸🇪',
    rateVsUsd: 10.5,
    position: 'after',
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    flag: '🇳🇴',
    rateVsUsd: 10.8,
    position: 'after',
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    flag: '🇹🇭',
    rateVsUsd: 35.5,
    position: 'before',
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    flag: '🇮🇩',
    rateVsUsd: 15600.0,
    position: 'before',
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    flag: '🇲🇾',
    rateVsUsd: 4.7,
    position: 'before',
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    flag: '🇵🇭',
    rateVsUsd: 56.2,
    position: 'before',
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    flag: '🇻🇳',
    rateVsUsd: 25400.0,
    position: 'after',
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    flag: '🇭🇰',
    rateVsUsd: 7.82,
    position: 'before',
  },
  TWD: {
    code: 'TWD',
    symbol: 'NT$',
    name: 'New Taiwan Dollar',
    flag: '🇹🇼',
    rateVsUsd: 32.3,
    position: 'before',
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    flag: '🇩🇰',
    rateVsUsd: 6.9,
    position: 'after',
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish Zloty',
    flag: '🇵🇱',
    rateVsUsd: 4.0,
    position: 'after',
  },
  CZK: {
    code: 'CZK',
    symbol: 'Kč',
    name: 'Czech Koruna',
    flag: '🇨🇿',
    rateVsUsd: 23.2,
    position: 'after',
  },
  HUF: {
    code: 'HUF',
    symbol: 'Ft',
    name: 'Hungarian Forint',
    flag: '🇭🇺',
    rateVsUsd: 365.0,
    position: 'after',
  },
  ILS: {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli New Shekel',
    flag: '🇮🇱',
    rateVsUsd: 3.65,
    position: 'before',
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    rateVsUsd: 3.75,
    position: 'before',
  },
  QAR: {
    code: 'QAR',
    symbol: 'QAR',
    name: 'Qatari Riyal',
    flag: '🇶🇦',
    rateVsUsd: 3.64,
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
