// Special order requests: customers can attach photos (optional), and the admin dashboard lists them.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const SPECIAL_ORDER_BUCKET = "special-order-images";
export const SPECIAL_ORDER_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;
export const SPECIAL_ORDER_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const SPECIAL_ORDER_MAX_IMAGES = 4;
export const SPECIAL_ORDER_STATUSES = ["new", "handled"] as const;

// Paths the upload step hands out: uploads/<uuid>.<ext>
const imagePath = z
  .string()
  .regex(/^uploads\/[0-9a-f-]{36}\.(png|jpeg|webp|heic|heif)$/, "Invalid image.");

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Step 1 of a photo upload: a one-time link to upload one photo to private storage. */
export const startSpecialOrderUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        contentType: z.enum(SPECIAL_ORDER_IMAGE_TYPES),
        size: z.number().int().min(1).max(SPECIAL_ORDER_IMAGE_MAX_BYTES),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = await admin();
    const path = `uploads/${crypto.randomUUID()}.${data.contentType.split("/")[1]}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(SPECIAL_ORDER_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !signed) {
      console.error("[special-order] upload link failed", error);
      throw new Error("Photo upload isn't available right now. Please try again.");
    }
    return { path: signed.path, uploadToken: signed.token };
  });

/** Saves a special order request so it shows on the admin dashboard. */
export const createSpecialOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(254),
        phone: z.string().trim().max(40).optional(),
        item: z.string().trim().min(1).max(200),
        details: z.string().trim().min(1).max(5000),
        size: z.string().trim().max(200).optional(),
        quantity: z.number().int().min(1).max(999),
        budget: z.string().trim().max(60).optional(),
        neededBy: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        product: z.string().trim().max(200).optional(),
        imagePaths: z.array(imagePath).max(SPECIAL_ORDER_MAX_IMAGES),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabaseAdmin = await admin();
    const { data: row, error } = await supabaseAdmin
      .from("special_orders")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        item: data.item,
        details: data.details,
        size: data.size || null,
        quantity: data.quantity,
        budget: data.budget || null,
        needed_by: data.neededBy || null,
        product: data.product || null,
        image_paths: data.imagePaths,
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error("[special-order] save failed", error);
      throw new Error("We couldn't send your request. Please try again.");
    }
    return { id: row.id };
  });

const auth = z.object({ accessToken: z.string().min(20).max(4000) });

/** Admin: special order requests, newest first, with temporary links to the photos. */
export const adminListSpecialOrders = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    auth.extend({ status: z.enum([...SPECIAL_ORDER_STATUSES, "all"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const [supabaseAdmin, { requireAdmin }] = await Promise.all([
      admin(),
      import("./orders.server"),
    ]);
    await requireAdmin(data.accessToken);
    let q = supabaseAdmin.from("special_orders").select("*");
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q.order("created_at", { ascending: false }).limit(300);
    if (error) {
      console.error("[special-order] list failed", error);
      throw new Error(
        "Couldn't load special orders. Make sure the special orders database update has been run.",
      );
    }
    const { count: newCount } = await supabaseAdmin
      .from("special_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    const items = await Promise.all(
      (rows ?? []).map(async (r) => {
        let images: string[] = [];
        if (r.image_paths.length) {
          const { data: signed } = await supabaseAdmin.storage
            .from(SPECIAL_ORDER_BUCKET)
            .createSignedUrls(r.image_paths, 60 * 60);
          images = (signed ?? []).flatMap((s) => (s.signedUrl ? [s.signedUrl] : []));
        }
        return {
          id: r.id,
          createdAt: r.created_at,
          name: r.name,
          email: r.email,
          phone: r.phone,
          item: r.item,
          details: r.details,
          size: r.size,
          quantity: r.quantity,
          budget: r.budget,
          neededBy: r.needed_by,
          product: r.product,
          status: r.status,
          images,
        };
      }),
    );
    return { items, newCount: newCount ?? 0 };
  });

/** Admin: mark a request as handled (or back to new). */
export const adminSetSpecialOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    auth.extend({ id: z.string().uuid(), status: z.enum(SPECIAL_ORDER_STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    const [supabaseAdmin, { requireAdmin }] = await Promise.all([
      admin(),
      import("./orders.server"),
    ]);
    await requireAdmin(data.accessToken);
    const { error } = await supabaseAdmin
      .from("special_orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("Couldn't update the request.");
    return { ok: true };
  });
