// Server functions for manual-payment orders (Bitcoin): create the order, upload a receipt,
// check its status, and let admins approve or reject payments.
// Server-only modules are imported inside handlers so they never reach the browser bundle.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CURRENCY_CODES } from "@/config/currency";
import {
  FULFILMENT_STATUSES,
  PAYMENT_STATUSES,
  RECEIPT_MAX_BYTES,
  RECEIPT_TYPES,
} from "@/lib/order-status";

const shippingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  address: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(120),
  postcode: z.string().trim().min(1).max(30),
  country: z.string().trim().min(1).max(80),
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
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: await getUserIdFromRequest(),
        email: data.shipping.email,
        items: data.lines,
        total,
        currency: data.currency,
        payment_method: label,
        shipping: { ...data.shipping, payment_method: label, currency: data.currency },
        status: "Order Placed",
        payment_status: "awaiting_payment",
      })
      .select("id, access_token")
      .single();
    if (error || !row) {
      console.error("[orders] create failed", error);
      throw new Error("We couldn't place your order. Please try again.");
    }
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

/** Whether the signed-in user is an admin (used to show the admin page). */
export const checkIsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { getUserIdFromRequest, isAdminUser } = await import("./orders.server");
  return { isAdmin: await isAdminUser(await getUserIdFromRequest()) };
});

/** Admin: list orders by payment status, with temporary links to view receipts. */
export const adminListOrders = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ paymentStatus: z.enum(PAYMENT_STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, { requireAdmin, RECEIPTS_BUCKET }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("./orders.server"),
    ]);
    await requireAdmin();
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, created_at, email, items, total, currency, payment_method, payment_status, status, shipping, receipt_path, transaction_id, receipt_uploaded_at, reviewed_at, review_note",
      )
      .eq("payment_status", data.paymentStatus)
      .order(data.paymentStatus === "under_review" ? "receipt_uploaded_at" : "created_at", {
        ascending: data.paymentStatus === "under_review",
      })
      .limit(200);
    if (error) throw new Error("Couldn't load orders.");

    return Promise.all(
      (rows ?? []).map(async (r) => {
        let receiptUrl: string | null = null;
        if (r.receipt_path) {
          const { data: s } = await supabaseAdmin.storage
            .from(RECEIPTS_BUCKET)
            .createSignedUrl(r.receipt_path, 60 * 60);
          receiptUrl = s?.signedUrl ?? null;
        }
        const ship = (r.shipping ?? {}) as Record<string, string>;
        return {
          id: r.id,
          createdAt: r.created_at,
          email: r.email ?? ship["email"] ?? "",
          name: ship["name"] ?? "",
          address: [ship["address"], ship["city"], ship["postcode"], ship["country"]]
            .filter(Boolean)
            .join(", "),
          items: r.items as { id: string; qty: number }[],
          total: Number(r.total),
          currency: r.currency,
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          status: r.status,
          transactionId: r.transaction_id,
          receiptUploadedAt: r.receipt_uploaded_at,
          reviewedAt: r.reviewed_at,
          reviewNote: r.review_note,
          receiptUrl,
          receiptIsPdf: r.receipt_path?.endsWith(".pdf") ?? false,
        };
      }),
    );
  });

/** Admin: approve or reject a payment. */
export const adminReviewPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approve", "reject"]),
        note: z.string().trim().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, { requireAdmin }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("./orders.server"),
    ]);
    await requireAdmin();
    const approve = data.decision === "approve";
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: approve ? "approved" : "rejected",
        status: approve ? "Processing" : "Order Placed",
        reviewed_at: new Date().toISOString(),
        review_note: approve ? null : data.note || null,
      })
      .eq("id", data.id);
    if (error) throw new Error("Couldn't update the order.");
    return { ok: true };
  });

/** Admin: move an approved order along (Processing -> Shipped). */
export const adminSetFulfilment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(FULFILMENT_STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, { requireAdmin }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("./orders.server"),
    ]);
    await requireAdmin();
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("payment_status", "approved");
    if (error) throw new Error("Couldn't update the order.");
    return { ok: true };
  });
