import type { CartLine } from "@/lib/shop";

/** Card orders are kept here while the customer is on Stripe's payment page. */
export const PENDING_CARD_ORDER_KEY = "cc_pending_card_order";

export type PendingCardOrder = {
  lines: CartLine[];
  total: number;
  shipping: Record<string, string>;
  currency?: "USD" | "GBP" | undefined;
};
