// Prices in src/data/products.ts are in US dollars. Other currencies are converted with these rates.
// Update GBP's rate from time to time so pound prices stay close to the dollar prices.

export const CURRENCIES = {
  USD: { label: "USD $", locale: "en-US", rate: 1 },
  GBP: { label: "GBP £", locale: "en-GB", rate: 0.79 },
} as const;

export type Currency = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: Currency = "USD";

/** Visitors from these countries see pounds (UK plus Crown Dependencies). */
export const GBP_COUNTRIES = ["GB", "UK", "JE", "GG", "IM"];
