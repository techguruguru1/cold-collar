// Server-only helpers for orders. Never import this from route or component files.
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const RECEIPTS_BUCKET = "receipts";

/** The signed-in user's id from the request's bearer token, or null for guests. */
export async function getUserIdFromRequest(): Promise<string | null> {
  const header = getRequestHeader("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(header.slice(7));
  if (error) return null;
  return data.user?.id ?? null;
}

export async function isAdminUser(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabaseAdmin
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

/** Throws unless the request comes from a signed-in admin. */
export async function requireAdmin(): Promise<string> {
  const userId = await getUserIdFromRequest();
  if (!userId) throw new Error("Please sign in.");
  if (!(await isAdminUser(userId))) throw new Error("You don't have access to this page.");
  return userId;
}

/** Loads an order by id and its secret link token (works for guests and signed-in customers). */
export async function getOrderWithToken(id: string, token: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("access_token", token)
    .maybeSingle();
  if (error) throw new Error("Couldn't load your order. Please try again.");
  if (!data) throw new Error("Order not found. Check the link and try again.");
  return data;
}
