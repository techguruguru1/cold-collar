import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, getProduct } from "@/data/products";
import { useAuth, useCart } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import {
  ACTIVE_PAYMENT_METHODS,
  PaymentMethodDetails,
  getPaymentMethod,
  type PaymentMethodId,
} from "@/components/PaymentMethods";
import { ContactButtons } from "@/components/ContactButtons";
import { startCardCheckout } from "@/lib/stripe.functions";

import { PENDING_CARD_ORDER_KEY } from "@/lib/pending-order";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { canceled?: boolean | undefined } => ({
    canceled: search["canceled"] === 1 || search["canceled"] === "1" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Cold Collar" },
      {
        name: "description",
        content: "Three-step Cold Collar checkout: shipping, payment details and confirmation. Guest checkout available.",
      },
      { property: "og:title", content: "Checkout — Cold Collar" },
      { property: "og:description", content: "Secure, discreet Cold Collar checkout." },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

type Shipping = {
  name: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
};

function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [placed, setPlaced] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethodId | "card">("card");
  const { canceled } = Route.useSearch();
  useEffect(() => {
    if (canceled) toast("Payment canceled. Your cart is still here.");
  }, [canceled]);
  const [placedTotal, setPlacedTotal] = useState(0);
  const [ship, setShip] = useState<Shipping>({
    name: "",
    email: "",
    address: "",
    city: "",
    postcode: "",
    country: "",
  });

  const field = (key: keyof Shipping, label: string) => (
    <div>
      <label htmlFor={key} className="text-[11px] uppercase tracking-[0.2em] text-silver">
        {label}
      </label>
      <input
        id={key}
        required
        value={ship[key]}
        onChange={(e) => setShip({ ...ship, [key]: e.target.value })}
        className="mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver"
      />
    </div>
  );

  const payByCard = async () => {
    setBusy(true);
    try {
      const { url } = await startCardCheckout({ data: { lines, shipping: ship } });
      // Remember the order so the success page can save it to the customer's history.
      try {
        sessionStorage.setItem(PENDING_CARD_ORDER_KEY, JSON.stringify({ lines, total: subtotal, shipping: ship }));
      } catch {
        // storage unavailable; order still goes through Stripe
      }
      window.location.assign(url);
    } catch (err) {
      setBusy(false);
      toast(err instanceof Error ? err.message : "Payment couldn't be started. Please try again.");
    }
  };

  const placeOrder = async () => {
    if (payMethod === "card") return;
    setBusy(true);
    const orderRef = crypto.randomUUID();
    setPlacedTotal(subtotal);
    if (user) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: lines,
          total: subtotal,
          shipping: { ...ship, payment_method: getPaymentMethod(payMethod).label },
          status: "Order Placed",
        })
        .select("id")
        .single();
      setBusy(false);
      if (error) {
        toast(error.message);
        return;
      }
      setPlaced(data.id);
    } else {
      setBusy(false);
      setPlaced(orderRef);
    }
    clear();
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Check size={32} className="mx-auto text-silver" />
        <h1 className="mt-6 font-display text-3xl">Order Placed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Reference #{placed.slice(0, 8).toUpperCase()}. Your order moves to Processing shortly, then
          Shipped.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Shipped in unmarked packaging. Billed as CC Lifestyle.
        </p>
        <div className="card-surface mt-8 p-6 text-left">
          <h2 className="font-display text-lg">Complete payment · {getPaymentMethod(payMethod === "card" ? "bitcoin" : payMethod).label}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Include reference #{placed.slice(0, 8).toUpperCase()} when you message us.
          </p>
          <div className="mt-5">
            <PaymentMethodDetails method={getPaymentMethod(payMethod === "card" ? "bitcoin" : payMethod)} amount={formatPrice(placedTotal)} />
          </div>
          <div className="mt-6 border-t border-border pt-6">
            <ContactButtons />
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <Link to="/account" className="btn-silver px-7 py-3 text-xs">
              View Order History
            </Link>
          ) : (
            <Link to="/auth" className="btn-silver px-7 py-3 text-xs">
              Create Account to Track
            </Link>
          )}
          <Link to="/shop" className="btn-outline-silver px-7 py-3 text-xs">
            Keep Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl">Your cart is empty</h1>
        <Link to="/shop" className="btn-silver mt-8 inline-flex px-8 py-3 text-xs">
          Browse the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">Checkout</h1>

      <div className="mt-8 flex gap-2">
        {["Shipping", "Payment", "Confirm"].map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-0.5 ${step >= i + 1 ? "bg-silver" : "bg-border"}`} />
            <p
              className={`mt-2 text-[10px] uppercase tracking-[0.16em] ${
                step >= i + 1 ? "text-silver" : "text-muted-foreground"
              }`}
            >
              {i + 1}. {s}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="card-surface space-y-4 p-6"
            >
              <h2 className="font-display text-lg">Shipping Details</h2>
              {!user && (
                <p className="text-xs text-muted-foreground">
                  Checking out as a guest.{" "}
                  <Link to="/auth" className="text-silver hover:underline">
                    Sign in
                  </Link>{" "}
                  to keep this order in your history.
                </p>
              )}
              {field("name", "Full name")}
              {field("email", "Email")}
              {field("address", "Address")}
              <div className="grid gap-4 sm:grid-cols-2">
                {field("city", "City")}
                {field("postcode", "Postcode")}
              </div>
              {field("country", "Country")}
              <button type="submit" className="btn-silver w-full py-3 text-xs">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="card-surface space-y-4 p-6">
              <h2 className="font-display text-xl">Payment</h2>
              <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: "card" as const, label: "Card", icon: <CreditCard aria-hidden="true" size={18} /> },
                  ...ACTIVE_PAYMENT_METHODS.map((m) => ({ id: m.id, label: m.label, icon: m.icon })),
                ].map((m) => {
                  const active = payMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex min-h-12 items-center justify-center gap-2 border px-3 py-3 text-xs uppercase tracking-[0.14em] transition-colors ${
                        active
                          ? "border-silver bg-input text-foreground"
                          : "border-border text-muted-foreground hover:border-silver/60 hover:text-foreground"
                      }`}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  );
                })}
              </div>
              {payMethod === "card" ? (
                <div className="flex gap-3 border border-border bg-input p-4 text-sm leading-relaxed text-muted-foreground">
                  <Lock aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-silver" />
                  <p>
                    Pay {formatPrice(subtotal)} by credit or debit card (and Apple Pay or Google Pay where
                    available). After you review your order you'll enter your card on Stripe's secure payment
                    page. We never see or store your card details.
                  </p>
                </div>
              ) : (
                <PaymentMethodDetails method={getPaymentMethod(payMethod)} amount={formatPrice(subtotal)} />
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline-silver flex-1 py-3 text-xs">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn-silver flex-1 py-3 text-xs">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card-surface space-y-4 p-6">
              <h2 className="font-display text-lg">Confirm</h2>
              <div className="text-xs leading-relaxed text-muted-foreground">
                <p className="text-silver">Shipping to</p>
                <p>{ship.name}</p>
                <p>{ship.address}</p>
                <p>
                  {ship.city} {ship.postcode}
                </p>
                <p>{ship.country}</p>
                <p className="mt-2">{ship.email}</p>
                <p className="mt-4 text-silver">Payment</p>
                <p>{payMethod === "card" ? "Card (Stripe)" : getPaymentMethod(payMethod).label}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {payMethod === "card"
                  ? "You'll be taken to Stripe's secure page to pay. Your order is confirmed as soon as payment goes through."
                  : "Your order will be recorded as Order Placed while payment confirmation is pending."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline-silver flex-1 py-3 text-xs">
                  Back
                </button>
                <button
                  disabled={busy}
                  onClick={() => void (payMethod === "card" ? payByCard() : placeOrder())}
                  className="btn-silver flex-1 py-3 text-xs disabled:opacity-60"
                >
                  {payMethod === "card"
                    ? busy
                      ? "Opening secure payment…"
                      : `Pay ${formatPrice(subtotal)}`
                    : busy
                      ? "Placing…"
                      : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="card-surface h-fit p-6">
          <h2 className="font-display text-sm uppercase tracking-[0.18em] text-silver">Summary</h2>
          <ul className="mt-4 space-y-3 text-xs">
            {lines.map((l) => {
              const p = getProduct(l.id);
              if (!p) return null;
              return (
                <li key={l.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {p.name} × {l.qty}
                  </span>
                  <span>{formatPrice(p.price * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-brushed">{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
