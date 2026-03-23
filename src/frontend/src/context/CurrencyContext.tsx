import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export interface Currency {
  code: string;
  symbol: string;
  label: string;
  locale: string;
  notation: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: "INR",
    symbol: "₹",
    label: "Indian Rupee",
    locale: "en-IN",
    notation: "Lakh/Crore",
  },
  {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    locale: "en-US",
    notation: "K/M",
  },
  { code: "EUR", symbol: "€", label: "Euro", locale: "de-DE", notation: "K/M" },
  {
    code: "GBP",
    symbol: "£",
    label: "British Pound",
    locale: "en-GB",
    notation: "K/M",
  },
  {
    code: "JPY",
    symbol: "¥",
    label: "Japanese Yen",
    locale: "ja-JP",
    notation: "K/M",
  },
  {
    code: "AED",
    symbol: "د.إ",
    label: "UAE Dirham",
    locale: "ar-AE",
    notation: "K/M",
  },
  {
    code: "SGD",
    symbol: "S$",
    label: "Singapore Dollar",
    locale: "en-SG",
    notation: "K/M",
  },
  {
    code: "AUD",
    symbol: "A$",
    label: "Australian Dollar",
    locale: "en-AU",
    notation: "K/M",
  },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrencyCode: (code: string) => void;
  formatAmount: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrencyCode: () => {},
  formatAmount: (v) => `₹${v.toFixed(2)}`,
});

const STORAGE_KEY = "banksegment_currency";

function formatINR(value: number, symbol: string): string {
  if (value >= 10_000_000)
    return `${symbol}${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000) return `${symbol}${(value / 100_000).toFixed(2)}L`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value.toFixed(2)}`;
}

function formatGeneric(value: number, symbol: string): string {
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value.toFixed(2)}`;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<string>("INR");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CURRENCIES.find((c) => c.code === stored)) {
      setCurrencyCodeState(stored);
    }
  }, []);

  const setCurrencyCode = (code: string) => {
    setCurrencyCodeState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const currency =
    CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  const formatAmount = (value: number): string => {
    if (currency.code === "INR") return formatINR(value, currency.symbol);
    return formatGeneric(value, currency.symbol);
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrencyCode, formatAmount }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
