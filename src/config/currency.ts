// Prices in src/data/products.ts are in US dollars. Other currencies are converted with these rates.
// Update the GBP and EUR rates from time to time so prices stay close to the dollar prices.

export const CURRENCIES = {
  USD: { label: "USD $", locale: "en-US", rate: 1 },
  GBP: { label: "GBP £", locale: "en-GB", rate: 0.79 },
  EUR: { label: "EUR €", locale: "en-IE", rate: 0.92 },
} as const;

export type Currency = keyof typeof CURRENCIES;

export const CURRENCY_CODES = Object.keys(CURRENCIES) as [Currency, ...Currency[]];

export const DEFAULT_CURRENCY: Currency = "USD";

/** Which currency visitors from each country see (two-letter country codes). Everyone else sees USD. */
// prettier-ignore
export const COUNTRY_CURRENCY: Record<string, Currency> = {
  // UK and Crown Dependencies
  GB: "GBP", UK: "GBP", JE: "GBP", GG: "GBP", IM: "GBP",
  // Eurozone
  AT: "EUR", BE: "EUR", BG: "EUR", HR: "EUR", CY: "EUR", EE: "EUR", FI: "EUR",
  FR: "EUR", DE: "EUR", GR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR", LT: "EUR",
  LU: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR", SI: "EUR", ES: "EUR",
  // Other places that use the euro
  AD: "EUR", MC: "EUR", SM: "EUR", VA: "EUR", ME: "EUR", XK: "EUR",
};
