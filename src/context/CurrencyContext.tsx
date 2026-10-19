import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, CurrencyDetails, CURRENCIES, formatPrice as formatPriceUtil, convertPrice as convertPriceUtil } from '../utils/currency.ts';

const CURRENCY_STORAGE_KEY = 'voyage_platform_currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
  currentCurrency: CurrencyDetails;
  availableCurrencies: CurrencyDetails[];
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && (saved in CURRENCIES)) {
        return saved as CurrencyCode;
      }
    } catch {
      // Fallback
    }
    return 'USD';
  });

  const [rates, setRates] = useState<Partial<Record<CurrencyCode, number>>>({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/exchange-rates');
        const data = await res.json();
        setRates(data);
      } catch (err) {
        console.error('Failed to fetch rates:', err);
      }
    };
    fetchRates();
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {
      // Fallback
    }
  };

  const getRate = (code: CurrencyCode) => rates[code] || CURRENCIES[code].rateVsUsd;

  const convertPrice = (usdAmount: number) => Math.round(usdAmount * getRate(currency));

  const formatPrice = (usdAmount: number) => {
    const details = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = convertPrice(usdAmount);
    const formattedNumber = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(converted);

    if (details.position === 'after') {
      return `${formattedNumber} ${details.symbol}`;
    }
    return `${details.symbol}${formattedNumber}`;
  };

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.USD;
  const availableCurrencies = Object.values(CURRENCIES).map(c => ({
    ...c,
    rateVsUsd: getRate(c.code)
  }));

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currentCurrency,
        availableCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextValue => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
