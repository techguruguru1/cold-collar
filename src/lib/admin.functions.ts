// Server functions for the admin dashboard. Every call carries the admin's access token
// from the dashboard's own sign-in, and the server checks it belongs to an admin.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FULFILMENT_STATUSES, PAYMENT_STATUSES } from "@/lib/order-status";

const auth = z.object({ accessToken: z.string().min(20).max(4000) });

async function deps() {
  const [{ supabaseAdmin }, server] = await Promise.all([
    import("@/integrations/supabase/client.server"),
    import("./orders.server"),
  ]);
  return { supabaseAdmin, ...server };
}

/** Confirms the signed-in account is an admin (called right after the admin logs in). */
export const adminWhoAmI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => auth.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await deps();
    await requireAdmin(data.accessToken);
    return { ok: true };
  });

/** Totals for the dashboard cards. */
export const adminSummary = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => auth.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin, requireAdmin } = await deps();
    await requireAdmin(data.accessToken);
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("payment_status, status, total, currency, created_at");
    if (error) throw new Error("Couldn't load the dashboard.");

    const counts: Record<string, number> = {};
    const revenue: Record<string, number> = {};
    let shipped = 0;
    let approvedLast30 = 0;
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const r of rows ?? []) {
      counts[r.payment_status] = (counts[r.payment_status] ?? 0) + 1;
      if (r.payment_status === "approved") {
        revenue[r.currency] =
          Math.round(((revenue[r.currency] ?? 0) + Number(r.total)) * 100) / 100;
        if (r.status === "Shipped") shipped += 1;
        if (new Date(r.created_at).getTime() >= since) approvedLast30 += 1;
      }
    }
    return {
      total: rows?.length ?? 0,
      approved: counts["approved"] ?? 0,
      underReview: counts["under_review"] ?? 0,
      awaiting: counts["awaiting_payment"] ?? 0,
      rejected: counts["rejected"] ?? 0,
      shipped,
      approvedLast30,
      revenue,
    };
  });

/** Orders for one tab ("all" or a payment status), with temporary links to view receipts. */
export const adminListOrders = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    auth.extend({ paymentStatus: z.enum([...PAYMENT_STATUSES, "all"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, requireAdmin, RECEIPTS_BUCKET } = await deps();
    await requireAdmin(data.accessToken);
    let q = supabaseAdmin
      .from("orders")
      .select(
        "id, created_at, email, items, total, currency, payment_method, payment_status, status, shipping, receipt_path, transaction_id, receipt_uploaded_at, reviewed_at, review_note",
      );
    if (data.paymentStatus !== "all") q = q.eq("payment_status", data.paymentStatus);
    const review = data.paymentStatus === "under_review";
    const { data: rows, error } = await q
      .order(review ? "receipt_uploaded_at" : "created_at", { ascending: review })
      .limit(300);
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

/** Approve or reject a payment. */
export const adminReviewPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    auth
      .extend({
        id: z.string().uuid(),
        decision: z.enum(["approve", "reject"]),
        note: z.string().trim().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, requireAdmin } = await deps();
    await requireAdmin(data.accessToken);
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

/** Move an approved order along (Processing -> Shipped). */
export const adminSetFulfilment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    auth.extend({ id: z.string().uuid(), status: z.enum(FULFILMENT_STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, requireAdmin } = await deps();
    await requireAdmin(data.accessToken);
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("payment_status", "approved");
    if (error) throw new Error("Couldn't update the order.");
    return { ok: true };
  });
