import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "UZS" | "USD";

// Central Bank of the Republic of Uzbekistan (CBU / MB) Official Rate
export const CBU_EXCHANGE_RATE = 12850; // 1 USD = 12,850 UZS

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchangeRate: number;
  formatPrice: (amountInUzs: number | null | undefined, baseCurrency?: string) => string;
  convertPrice: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem("sovga_currency") as CurrencyCode;
        if (saved === "UZS" || saved === "USD") return saved;
      }
    } catch {}
    return "UZS";
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("sovga_currency", c);
      }
    } catch {}
  };

  const convertPrice = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    if (from === to) return amount;
    if (from === "UZS" && to === "USD") return Math.round((amount / CBU_EXCHANGE_RATE) * 100) / 100;
    if (from === "USD" && to === "UZS") return Math.round(amount * CBU_EXCHANGE_RATE);
    return amount;
  };

  const formatPrice = (amountInUzs: number | null | undefined, baseCurrency = "UZS"): string => {
    if (amountInUzs === null || amountInUzs === undefined) return "Narx ko'rsatilmagan";

    let uzsValue = amountInUzs;
    if (baseCurrency === "USD") {
      uzsValue = amountInUzs * CBU_EXCHANGE_RATE;
    }

    if (currency === "USD") {
      const usdValue = uzsValue / CBU_EXCHANGE_RATE;
      return `$${usdValue >= 100 ? Math.round(usdValue).toLocaleString("en-US") : usdValue.toFixed(2)}`;
    }

    // Default UZS format
    return `${Math.round(uzsValue).toLocaleString("en-US")} UZS`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate: CBU_EXCHANGE_RATE,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      currency: "UZS" as CurrencyCode,
      setCurrency: () => {},
      exchangeRate: CBU_EXCHANGE_RATE,
      formatPrice: (amt: number | null | undefined) =>
        amt ? `${amt.toLocaleString("en-US")} UZS` : "Narx yo'q",
      convertPrice: (amt: number) => amt,
    };
  }
  return ctx;
}
