// Server-only Stripe helpers. Talks to the Stripe REST API directly (no SDK needed).
// Requires STRIPE_SECRET_KEY in the environment (sk_test_... while testing, sk_live_... in production).

const STRIPE_API = "https://api.stripe.com/v1";

function secretKey() {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Card payments aren't set up yet. Please choose Bitcoin or contact us.");
  return key;
}

/** Flattens nested objects/arrays into Stripe's form encoding: a[b][0][c]=v */
function encode(obj: Record<string, unknown>, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") encode(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe<T>(method: "GET" | "POST", path: string, params?: Record<string, unknown>): Promise<T> {
  const url = method === "GET" && params ? `${STRIPE_API}${path}?${encode(params)}` : `${STRIPE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(method === "POST" && params ? { body: encode(params).toString() } : {}),
  });
  const data = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    console.error("[stripe]", res.status, data.error?.message);
    throw new Error("Payment couldn't be started. Please try again.");
  }
  return data;
}

export type StripeLineItem = { name: string; unitAmountCents: number; quantity: number; image?: string | undefined };

export async function createCheckoutSession(opts: {
  items: StripeLineItem[];
  email: string;
  origin: string;
  metadata: Record<string, string>;
}) {
  const session = await stripe<{ id: string; url: string }>("POST", "/checkout/sessions", {
    mode: "payment",
    customer_email: opts.email,
    line_items: opts.items.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "usd",
        unit_amount: i.unitAmountCents,
        product_data: { name: i.name, ...(i.image ? { images: [i.image] } : {}) },
      },
    })),
    // Shown on the customer's card statement.
    payment_intent_data: { statement_descriptor_suffix: "CC LIFESTYLE" },
    metadata: opts.metadata,
    success_url: `${opts.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/checkout?canceled=1`,
  });
  return session;
}

export async function retrieveCheckoutSession(id: string) {
  return stripe<{
    id: string;
    payment_status: "paid" | "unpaid" | "no_payment_required";
    amount_total: number | null;
    customer_details: { email: string | null; name: string | null } | null;
    metadata: Record<string, string>;
  }>("GET", `/checkout/sessions/${encodeURIComponent(id)}`);
}
