import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, TriangleAlert } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/currency";
import { useAuth, useCart } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { confirmCardCheckout } from "@/lib/stripe.functions";
import { PENDING_CARD_ORDER_KEY, type PendingCardOrder } from "@/lib/pending-order";

export const Route = createFileRoute("/checkout_/success")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  head: () => ({
    meta: [{ title: "Payment Received — Cold Coller" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutSuccess,
});

type State =
  | { status: "loading" }
  | { status: "paid"; ref: string; amount: number; currency: Currency; email: string | null }
  | { status: "unpaid" }
  | { status: "error"; message: string };

function CheckoutSuccess() {
  const { session_id } = Route.useSearch();
  const { clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });
  const done = useRef(false);

  useEffect(() => {
    if (done.current || authLoading) return;
    if (!session_id) {
      setState({ status: "error", message: "Missing payment reference." });
      return;
    }
    done.current = true;

    void (async () => {
      try {
        const s = await confirmCardCheckout({ data: { sessionId: session_id } });
        if (!s.paid) {
          setState({ status: "unpaid" });
          return;
        }
        clear();

        // Save to the signed-in customer's order history (once per payment).
        const savedKey = `cc_saved_${s.id}`;
        let pending: PendingCardOrder | null = null;
        try {
          if (!sessionStorage.getItem(savedKey)) {
            const raw = sessionStorage.getItem(PENDING_CARD_ORDER_KEY);
            pending = raw ? (JSON.parse(raw) as PendingCardOrder) : null;
          }
        } catch {
          pending = null;
        }
        if (user && pending) {
          const { error } = await supabase.from("orders").insert({
            user_id: user.id,
            items: pending.lines,
            total: s.amountTotal,
            shipping: {
              ...pending.shipping,
              payment_method: "Card (Stripe)",
              stripe_session: s.id,
              currency: s.currency,
            },
            status: "Paid",
          });
          if (error) console.error("[checkout] couldn't save order history:", error.message);
        }
        try {
          sessionStorage.setItem(savedKey, "1");
          sessionStorage.removeItem(PENDING_CARD_ORDER_KEY);
        } catch {
          // ignore
        }

        setState({
          status: "paid",
          ref: s.id.slice(-8).toUpperCase(),
          amount: s.amountTotal,
          currency: s.currency,
          email: s.email,
        });
      } catch (err) {
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "We couldn't confirm your payment.",
        });
      }
    })();
  }, [session_id, authLoading, user, clear]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      {state.status === "loading" && (
        <p className="text-sm text-muted-foreground">Confirming your payment…</p>
      )}

      {state.status === "paid" && (
        <>
          <Check size={32} className="mx-auto text-silver" />
          <h1 className="mt-6 font-display text-3xl">Payment Received</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Thank you. {formatMoney(state.amount, state.currency)} was paid and your order is
            confirmed. Reference #{state.ref}.
          </p>
          {state.email && (
            <p className="mt-2 text-xs text-muted-foreground">
              A receipt is on its way to {state.email}.
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Shipped in unmarked packaging. Billed as CC Lifestyle.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {user ? (
              <Link to="/account" className="btn-silver px-7 py-3 text-xs">
                View Order History
              </Link>
            ) : null}
            <Link to="/shop" className="btn-outline-silver px-7 py-3 text-xs">
              Keep Shopping
            </Link>
          </div>
        </>
      )}

      {(state.status === "unpaid" || state.status === "error") && (
        <>
          <TriangleAlert size={32} className="mx-auto text-destructive" />
          <h1 className="mt-6 font-display text-2xl">Payment not completed</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {state.status === "error"
              ? state.message
              : "Your payment didn't go through. Nothing was charged and your cart is still saved."}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/checkout" className="btn-silver px-7 py-3 text-xs">
              Back to Checkout
            </Link>
            <Link to="/contact" className="btn-outline-silver px-7 py-3 text-xs">
              Contact Us
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
