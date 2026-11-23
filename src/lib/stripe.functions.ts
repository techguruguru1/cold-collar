import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CURRENCY_CODES, type Currency } from "@/config/currency";

const toCurrency = (c: string | null | undefined): Currency =>
  (CURRENCY_CODES as string[]).includes((c ?? "").toUpperCase())
    ? ((c ?? "").toUpperCase() as Currency)
    : "USD";

const shippingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  address: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(120),
  postcode: z.string().trim().min(1).max(30),
  country: z.string().trim().min(1).max(80),
  state: z.string().trim().max(80).default(""),
});

const startSchema = z.object({
  lines: z
    .array(z.object({ id: z.string().max(100), qty: z.number().int().min(1).max(99) }))
    .min(1)
    .max(50),
  shipping: shippingSchema,
  currency: z.enum(CURRENCY_CODES).default("USD"),
});

/** Starts a Stripe Checkout session. Prices are looked up on the server, never trusted from the browser. */
export const startCardCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => startSchema.parse(data))
  .handler(async ({ data }) => {
    const { CONTACT_PAYMENT } = await import("@/config/contact-payment");
    const cardEnabled: boolean = CONTACT_PAYMENT.card.enabled;
    if (!cardEnabled) throw new Error("Card payment is currently unavailable.");
    const { blockedMessage, isBlockedDestination } = await import("@/config/shipping-restrictions");
    if (isBlockedDestination(data.shipping.country, data.shipping.state)) {
      throw new Error(blockedMessage(data.shipping.state));
    }
    const [{ createCheckoutSession }, { getProduct }, { getRequestUrl }, { convertFromUsd }] =
      await Promise.all([
        import("./stripe.server"),
        import("@/data/products"),
        import("@tanstack/react-start/server"),
        import("./currency"),
      ]);

    const origin = (process.env["SITE_URL"] || getRequestUrl().origin).replace(/\/$/, "");

    const items = data.lines.map((l) => {
      const p = getProduct(l.id);
      if (!p) throw new Error("An item in your cart is no longer available.");
      // Stripe needs a public https image URL; skip images when running on localhost.
      const imageUrl = /^https?:/.test(p.image)
        ? p.image
        : `${origin}${p.image.startsWith("/") ? "" : "/"}${p.image}`;
      const image = imageUrl.startsWith("https://") ? imageUrl : undefined;
      return {
        name: p.name,
        unitAmountCents: Math.round(convertFromUsd(p.price, data.currency) * 100),
        quantity: l.qty,
        image,
      };
    });

    const s = data.shipping;
    const session = await createCheckoutSession({
      items,
      currency: data.currency,
      email: s.email,
      origin,
      metadata: {
        ship_name: s.name,
        ship_address: s.address,
        ship_city: s.city,
        ship_postcode: s.postcode,
        ship_country: s.country,
        ship_state: s.state,
        items: data.lines
          .map((l) => `${l.id}x${l.qty}`)
          .join(",")
          .slice(0, 490),
      },
    });
    return { url: session.url };
  });

/** Confirms a finished Stripe Checkout session after the customer is sent back to the site. */
export const confirmCardCheckout = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ sessionId: z.string().startsWith("cs_").max(200) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { retrieveCheckoutSession } = await import("./stripe.server");
    const s = await retrieveCheckoutSession(data.sessionId);
    return {
      id: s.id,
      paid: s.payment_status === "paid",
      amountTotal: (s.amount_total ?? 0) / 100,
      email: s.customer_details?.email ?? null,
      currency: toCurrency(s.currency),
    };
  });
