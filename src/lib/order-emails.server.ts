// Server-only: customer emails about their orders. Never import from routes or components.
import { EMAIL } from "@/config/email";
import { CONTACT_PAYMENT } from "@/config/contact-payment";
import type { Currency } from "@/config/currency";
import { getProduct } from "@/data/products";
import { formatMoney } from "./currency";
import { orderRef } from "./order-status";
import { sendTemplateEmail } from "./send-email.server";

/**
 * "We've received your order" email, sent when the order is placed.
 * Never throws: a failed email must not stop the customer's order.
 */
export async function sendOrderConfirmation(order: {
  id: string;
  token: string;
  email: string;
  name: string;
  lines: { id: string; qty: number }[];
  total: number;
  currency: Currency;
  paymentMethod: string;
  siteUrl: string;
}): Promise<void> {
  if (!EMAIL.enabled) return;
  if (!process.env["SMTP_API_KEY"]) {
    console.warn("[email] SMTP_API_KEY not set; order confirmation not sent");
    return;
  }
  try {
    await sendTemplateEmail(EMAIL.templates.orderConfirmation, order.email, {
      name: order.name,
      order_number: orderRef(order.id),
      order_total: formatMoney(order.total, order.currency),
      payment_method: order.paymentMethod,
      items: order.lines.map((l) => `${getProduct(l.id)?.name ?? l.id} × ${l.qty}`).join(", "),
      order_url: `${order.siteUrl}/order/${order.id}?t=${order.token}`,
      support_email: CONTACT_PAYMENT.business.email,
    });
  } catch (err) {
    console.error("[email] order confirmation failed", order.id, err);
  }
}
