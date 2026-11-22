// Separate sign-in for the admin dashboard. The session lives only in memory, so the
// admin page asks for the email and password every time it is opened or refreshed,
// and it never shares the shop's customer sign-in.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function createAdminAuthClient(): SupabaseClient {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
  if (!url || !key) throw new Error("Supabase settings are missing.");
  const isNewKey = key.startsWith("sb_publishable_");
  return createClient(url, key, {
    global: {
      // New Supabase publishable keys are not bearer tokens (same handling as the shop client).
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isNewKey && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "cc-admin-auth",
    },
  });
}

let client: SupabaseClient | undefined;
export function adminAuth(): SupabaseClient {
  if (!client) client = createAdminAuthClient();
  return client;
}

/** The current admin access token (refreshed automatically while the page is open). */
export async function adminToken(): Promise<string> {
  const { data } = await adminAuth().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your admin session has ended. Please sign in again.");
  return token;
}
