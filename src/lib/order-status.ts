// Shared by the checkout, order page, account page and admin page.

export const PAYMENT_STATUSES = [
  "awaiting_payment",
  "under_review",
  "approved",
  "rejected",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  awaiting_payment: "Awaiting payment",
  under_review: "Payment under review",
  approved: "Payment approved",
  rejected: "Payment not confirmed",
};

export const FULFILMENT_STATUSES = ["Order Placed", "Processing", "Shipped"] as const;
export type FulfilmentStatus = (typeof FULFILMENT_STATUSES)[number];

export const isPaymentStatus = (s: unknown): s is PaymentStatus =>
  typeof s === "string" && (PAYMENT_STATUSES as readonly string[]).includes(s);

/** Receipt files customers may upload. */
export const RECEIPT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;
export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;

export const orderRef = (id: string) => id.slice(0, 8).toUpperCase();
