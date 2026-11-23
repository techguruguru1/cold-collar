// Server-only: customer emails about their orders. Never import from routes or components.
import { EMAIL } from "@/config/email";
import { CONTACT_PAYMENT } from "@/config/contact-payment";
import type { Currency } from "@/config/currency";
import { getProduct } from "@/data/products";
import { formatMoney } from "./currency";
import { orderRef } from "./order-status";
import { sendTemplateEmail, type EmailVariables } from "./send-email.server";

export type OrderEmailDetails = {
  id: string;
  token: string;
  email: string;
  name: string;
  lines: { id: string; qty: number }[];
  total: number;
  currency: Currency;
  paymentMethod: string;
  siteUrl: string;
};

/** Sends one order email. Never throws: a failed email must not affect the order. */
async function sendOrderEmail(
  kind: keyof typeof EMAIL.templates,
  order: OrderEmailDetails,
  extra: EmailVariables = {},
): Promise<void> {
  if (!EMAIL.enabled) return;
  if (!process.env["SMTP_API_KEY"]) {
    console.warn(`[email] SMTP_API_KEY not set; ${kind} email not sent`);
    return;
  }
  try {
    await sendTemplateEmail(EMAIL.templates[kind], order.email, {
      name: order.name,
      order_number: orderRef(order.id),
      order_total: formatMoney(order.total, order.currency),
      payment_method: order.paymentMethod,
      items: order.lines.map((l) => `${getProduct(l.id)?.name ?? l.id} × ${l.qty}`).join(", "),
      order_url: `${order.siteUrl}/order/${order.id}?t=${order.token}`,
      support_email: CONTACT_PAYMENT.business.email,
      ...extra,
    });
  } catch (err) {
    console.error(`[email] ${kind} email failed`, order.id, err);
  }
}

/** Sent when the admin approves the payment. */
export function sendOrderConfirmation(order: OrderEmailDetails) {
  return sendOrderEmail("orderConfirmation", order);
}

/** Sent when the admin rejects the payment. `reason` is the note the admin typed (may be empty). */
export function sendPaymentFailed(order: OrderEmailDetails, reason: string) {
  return sendOrderEmail("paymentFailed", order, {
    reason: reason || "We couldn't confirm your payment.",
  });
}
