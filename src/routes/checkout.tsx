import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/data/products";
import { useCurrency } from "@/lib/currency";
import { useAuth, useCart } from "@/lib/shop";
import {
  ACTIVE_PAYMENT_METHODS,
  PaymentMethodDetails,
  getPaymentMethod,
  type PaymentMethodId,
} from "@/components/PaymentMethods";
import { startCardCheckout } from "@/lib/stripe.functions";
import { createManualOrder } from "@/lib/orders.functions";
import { rememberOrder } from "@/lib/recent-orders";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

const CARD_ENABLED: boolean = CONTACT_PAYMENT.card.enabled;

import { PENDING_CARD_ORDER_KEY } from "@/lib/pending-order";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { canceled?: boolean | undefined } => ({
    canceled: search["canceled"] === 1 || search["canceled"] === "1" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Cold Coller" },
      {
        name: "description",
        content:
          "Three-step Cold Coller checkout: shipping, payment details and confirmation. Guest checkout available.",
      },
      { property: "og:title", content: "Checkout — Cold Coller" },
      { property: "og:description", content: "Secure, discreet Cold Coller checkout." },
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
  const { currency, price, convert } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [receiptFor, setReceiptFor] = useState<{ id: string; token: string } | null>(null);
  // Nothing is selected until the customer picks a payment method.
  const [payMethod, setPayMethod] = useState<PaymentMethodId | "card" | null>(null);
  const canContinue = payMethod !== null && !(payMethod === "card" && !CARD_ENABLED);
  const { canceled } = Route.useSearch();
  useEffect(() => {
    if (canceled) toast("Payment canceled. Your cart is still here.");
  }, [canceled]);
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
    if (!CARD_ENABLED) return;
    setBusy(true);
    try {
      const { url } = await startCardCheckout({ data: { lines, shipping: ship, currency } });
      // Remember the order so the success page can save it to the customer's history.
      try {
        sessionStorage.setItem(
          PENDING_CARD_ORDER_KEY,
          JSON.stringify({ lines, total: convert(subtotal), shipping: ship, currency }),
        );
      } catch {
        // storage unavailable; order still goes through Stripe
      }
      window.location.assign(url);
    } catch (err) {
      setBusy(false);
      toast(err instanceof Error ? err.message : "Payment couldn't be started. Please try again.");
    }
  };

  // After the receipt pop-up closes (uploaded or not), go to the order page.
  const finishOrder = async () => {
    if (!receiptFor) return;
    const { id, token } = receiptFor;
    clear();
    await navigate({ to: "/order/$orderId", params: { orderId: id }, search: { t: token } });
  };

  const placeOrder = async () => {
    if (payMethod === null || payMethod === "card") return;
    setBusy(true);
    try {
      const order = await createManualOrder({
        data: { lines, shipping: ship, currency, method: payMethod },
      });
      rememberOrder(order.id, order.token);
      setReceiptFor(order);
      setBusy(false);
    } catch (err) {
      setBusy(false);
      toast(err instanceof Error ? err.message : "We couldn't place your order. Please try again.");
    }
  };

  const agreement = (
    <label className="flex cursor-pointer items-start gap-3 border border-border bg-input p-4 text-xs leading-relaxed text-muted-foreground">
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(0_0%_75%)]"
      />
      <span>
        I confirm I am 18 or older and I agree to the{" "}
        <Link to="/terms" target="_blank" className="text-silver underline">
          Terms of Service
        </Link>
        ,{" "}
        <Link to="/returns" target="_blank" className="text-silver underline">
          Returns &amp; Refund Policy
        </Link>{" "}
        and{" "}
        <Link to="/privacy" target="_blank" className="text-silver underline">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );

  // Keep the checkout on screen while the receipt pop-up is open (the cart is cleared afterwards).
  if (lines.length === 0 && !receiptFor) {
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
      {receiptFor && (
        <ReceiptDialog
          open
          onOpenChange={(open) => {
            if (!open) void finishOrder();
          }}
          orderId={receiptFor.id}
          token={receiptFor.token}
          amount={price(subtotal)}
          onDone={() => void finishOrder()}
        />
      )}
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
              <div
                role="radiogroup"
                aria-label="Payment method"
                className="grid gap-2 sm:grid-cols-2"
              >
                {[
                  {
                    id: "card" as const,
                    label: "Card",
                    icon: <CreditCard aria-hidden="true" size={18} />,
                  },
                  ...ACTIVE_PAYMENT_METHODS.map((m) => ({
                    id: m.id,
                    label: m.label,
                    icon: m.icon,
                  })),
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
              {payMethod === "card" && !CARD_ENABLED ? (
                <div
                  role="alert"
                  className="flex flex-col gap-3 border border-border bg-input p-4 text-sm leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="flex gap-3">
                    <AlertCircle
                      aria-hidden="true"
                      size={18}
                      className="mt-0.5 shrink-0 text-silver"
                    />
                    Card payment is currently unavailable. Please use Bitcoin.
                  </p>
                </div>
              ) : payMethod === "card" ? (
                <div className="flex gap-3 border border-border bg-input p-4 text-sm leading-relaxed text-muted-foreground">
                  <Lock aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-silver" />
                  <p>
                    Pay {price(subtotal)} by credit or debit card (and Apple Pay or Google Pay where
                    available). After you review your order you'll enter your card on Stripe's
                    secure payment page. We never see or store your card details.
                  </p>
                </div>
              ) : payMethod ? (
                <>
                  <PaymentMethodDetails
                    method={getPaymentMethod(payMethod)}
                    amount={price(subtotal)}
                  />
                  {agreement}
                  <button
                    type="button"
                    disabled={busy || !agreed}
                    title={agreed ? undefined : "Tick the box above to continue"}
                    onClick={() => void placeOrder()}
                    className="btn-silver w-full py-3.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Please wait…" : "I've Sent the Payment"}
                  </button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Next, upload a screenshot of your payment so we can confirm it.
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Choose how you'd like to pay.</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-outline-silver flex-1 py-3 text-xs"
                >
                  Back
                </button>
                {(payMethod === null || payMethod === "card") && (
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canContinue}
                    className="btn-silver flex-1 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Review Order
                  </button>
                )}
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
                <p>
                  {payMethod === "card"
                    ? "Card (Stripe)"
                    : payMethod
                      ? getPaymentMethod(payMethod).label
                      : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {payMethod === "card"
                  ? "You'll be taken to Stripe's secure page to pay. Your order is confirmed as soon as payment goes through."
                  : "Next you'll see the address and exact amount to send. After you send it, tap \"I've sent the payment\" and upload your receipt."}
              </p>
              {agreement}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-outline-silver flex-1 py-3 text-xs"
                >
                  Back
                </button>
                <button
                  disabled={busy || !agreed}
                  title={agreed ? undefined : "Tick the box above to continue"}
                  onClick={() => void (payMethod === "card" ? payByCard() : placeOrder())}
                  className="btn-silver flex-1 py-3 text-xs disabled:opacity-60"
                >
                  {payMethod === "card"
                    ? busy
                      ? "Opening secure payment…"
                      : `Pay ${price(subtotal)}`
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
                  <span>{price(p.price * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-brushed">{price(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
