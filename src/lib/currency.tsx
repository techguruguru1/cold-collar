import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createServerFn } from "@tanstack/react-start";
import { COUNTRY_CURRENCY, CURRENCIES, DEFAULT_CURRENCY, type Currency } from "@/config/currency";

export type { Currency };

export const CURRENCY_COOKIE = "cc_currency";

export const isCurrency = (v: unknown): v is Currency => typeof v === "string" && v in CURRENCIES;

/** Converts a US-dollar amount into the given currency (rounded to the cent). */
export function convertFromUsd(usd: number, currency: Currency): number {
  return Math.round(usd * CURRENCIES[currency].rate * 100) / 100;
}

/** Formats an amount that is already in `currency`. */
export function formatMoney(amount: number, currency: Currency = DEFAULT_CURRENCY): string {
  const c = CURRENCIES[currency];
  return amount.toLocaleString(c.locale, { style: "currency", currency });
}

/**
 * Picks the visitor's currency on the server: a saved choice (cookie) wins,
 * otherwise their country from Vercel's IP geolocation header.
 */
export const getVisitorCurrency = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie, getRequestHeader } = await import("@tanstack/react-start/server");
  const saved = getCookie(CURRENCY_COOKIE);
  if (isCurrency(saved)) return { currency: saved, country: null as string | null };
  const country = (
    getRequestHeader("x-vercel-ip-country") ||
    getRequestHeader("cf-ipcountry") ||
    ""
  ).toUpperCase();
  const currency: Currency = COUNTRY_CURRENCY[country] ?? DEFAULT_CURRENCY;
  return { currency, country: country || null };
});

type CurrencyCtx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Formats a US-dollar product price in the visitor's currency. */
  price: (usd: number) => string;
  /** Converts a US-dollar amount into the visitor's currency. */
  convert: (usd: number) => number;
};

const CurrencyContext = createContext<CurrencyCtx>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  price: (usd) => formatMoney(usd, DEFAULT_CURRENCY),
  convert: (usd) => usd,
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({
  initial,
  children,
}: {
  initial: Currency;
  children: ReactNode;
}) {
  const [currency, setState] = useState<Currency>(initial);

  const setCurrency = useCallback((c: Currency) => {
    setState(c);
    try {
      document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    } catch {
      // cookies unavailable; choice lasts for this visit only
    }
  }, []);

  const value = useMemo<CurrencyCtx>(
    () => ({
      currency,
      setCurrency,
      convert: (usd) => convertFromUsd(usd, currency),
      price: (usd) => formatMoney(convertFromUsd(usd, currency), currency),
    }),
    [currency, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <select
      aria-label="Currency"
      value={currency}
      onChange={(e) => isCurrency(e.target.value) && setCurrency(e.target.value)}
      className={`border border-border bg-input px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-silver outline-none focus:border-silver ${className}`}
    >
      {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
        <option key={c} value={c}>
          {CURRENCIES[c].label}
        </option>
      ))}
    </select>
  );
}
