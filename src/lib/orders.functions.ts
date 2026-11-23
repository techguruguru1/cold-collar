// Server functions for manual-payment orders (Bitcoin): create the order, upload a receipt,
// and check its status. Admin actions live in admin.functions.ts.
// Server-only modules are imported inside handlers so they never reach the browser bundle.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CURRENCY_CODES } from "@/config/currency";
import { RECEIPT_MAX_BYTES, RECEIPT_TYPES } from "@/lib/order-status";
import { blockedMessage, isBlockedDestination } from "@/config/shipping-restrictions";

const shippingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  address: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(120),
  postcode: z.string().trim().min(1).max(30),
  country: z.string().trim().min(1).max(80),
  state: z.string().trim().max(80).default(""),
});

const orderKey = z.object({ id: z.string().uuid(), token: z.string().uuid() });

/** Creates an order that will be paid by Bitcoin (or another manual method). */
export const createManualOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        lines: z
          .array(z.object({ id: z.string().max(100), qty: z.number().int().min(1).max(99) }))
          .min(1)
          .max(50),
        shipping: shippingSchema,
        currency: z.enum(CURRENCY_CODES).default("USD"),
        method: z.enum(["bitcoin", "cashapp", "paypal", "zelle"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, { getUserIdFromRequest }, { getProduct }, { convertFromUsd }, pm] =
      await Promise.all([
        import("@/integrations/supabase/client.server"),
        import("./orders.server"),
        import("@/data/products"),
        import("./currency"),
        import("@/components/PaymentMethods"),
      ]);

    if (isBlockedDestination(data.shipping.country, data.shipping.state)) {
      throw new Error(blockedMessage(data.shipping.state));
    }
    if (!pm.ENABLED_METHODS.includes(data.method)) {
      throw new Error("That payment method isn't available.");
    }

    // Prices come from the catalogue on the server, never from the browser.
    let total = 0;
    for (const l of data.lines) {
      const p = getProduct(l.id);
      if (!p) throw new Error("An item in your cart is no longer available.");
      total += convertFromUsd(p.price, data.currency) * l.qty;
    }
    total = Math.round(total * 100) / 100;

    const label = pm.getPaymentMethod(data.method).label;
    // Remember which Bitcoin address the customer was shown, in case it changes later.
    const payTo =
      data.method === "bitcoin"
        ? (await (await import("./payment-settings")).getPaymentSettings()).bitcoinAddress
        : null;
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: await getUserIdFromRequest(),
        email: data.shipping.email,
        items: data.lines,
        total,
        currency: data.currency,
        payment_method: label,
        shipping: {
          ...data.shipping,
          payment_method: label,
          currency: data.currency,
          ...(payTo ? { pay_to: payTo } : {}),
        },
        status: "Order Placed",
        payment_status: "awaiting_payment",
      })
      .select("id, access_token")
      .single();
    if (error || !row) {
      console.error("[orders] create failed", error);
      throw new Error("We couldn't place your order. Please try again.");
    }

    // Confirmation email to the customer. Failures are logged and never block the order.
    const [{ sendOrderConfirmation }, { getRequestUrl }] = await Promise.all([
      import("./order-emails.server"),
      import("@tanstack/react-start/server"),
    ]);
    await sendOrderConfirmation({
      id: row.id,
      token: row.access_token,
      email: data.shipping.email,
      name: data.shipping.name,
      lines: data.lines,
      total,
      currency: data.currency,
      paymentMethod: label,
      siteUrl: (process.env["SITE_URL"] || getRequestUrl().origin).replace(/\/$/, ""),
    });

    return { id: row.id, token: row.access_token };
  });

/** What the customer's order page shows. */
export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderKey.parse(data))
  .handler(async ({ data }) => {
    const { getOrderWithToken } = await import("./orders.server");
    const o = await getOrderWithToken(data.id, data.token);
    return {
      id: o.id,
      createdAt: o.created_at,
      items: o.items as { id: string; qty: number }[],
      total: Number(o.total),
      currency: o.currency,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      status: o.status,
      reviewNote: o.review_note,
      receiptUploadedAt: o.receipt_uploaded_at,
    };
  });

/** Step 1 of a receipt upload: returns a one-time link to upload the file straight to storage. */
export const startReceiptUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    orderKey
      .extend({
        contentType: z.enum(RECEIPT_TYPES),
        size: z.number().int().min(1).max(RECEIPT_MAX_BYTES),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, { getOrderWithToken, RECEIPTS_BUCKET }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("./orders.server"),
    ]);
    const o = await getOrderWithToken(data.id, data.token);
    if (o.payment_status !== "awaiting_payment" && o.payment_status !== "rejected") {
      throw new Error("A receipt has already been received for this order.");
    }
    const ext = data.contentType === "application/pdf" ? "pdf" : data.contentType.split("/")[1];
    const path = `${o.id}/${Date.now()}.${ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(RECEIPTS_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !signed) {
      console.error("[orders] signed upload failed", error);
      throw new Error("Upload isn't available right now. Please try again.");
    }
    return { path: signed.path, uploadToken: signed.token };
  });

/** Step 2 of a receipt upload: marks the order as "Payment under review". */
export const submitReceipt = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    orderKey
      .extend({
        path: z.string().max(200),
        transactionId: z.string().trim().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, { getOrderWithToken, RECEIPTS_BUCKET }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("./orders.server"),
    ]);
    const o = await getOrderWithToken(data.id, data.token);
    if (o.payment_status !== "awaiting_payment" && o.payment_status !== "rejected") {
      throw new Error("A receipt has already been received for this order.");
    }
    const prefix = `${o.id}/`;
    if (!data.path.startsWith(prefix)) throw new Error("Upload not recognised.");
    const fileName = data.path.slice(prefix.length);
    const { data: files } = await supabaseAdmin.storage
      .from(RECEIPTS_BUCKET)
      .list(o.id, { search: fileName });
    if (!files?.some((f) => f.name === fileName)) {
      throw new Error("We didn't receive your file. Please try uploading again.");
    }
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "under_review",
        receipt_path: data.path,
        transaction_id: data.transactionId || null,
        receipt_uploaded_at: new Date().toISOString(),
        review_note: null,
      })
      .eq("id", o.id);
    if (error) throw new Error("We couldn't save your receipt. Please try again.");
    return { ok: true };
  });
