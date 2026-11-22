import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import {
  ACTIVE_PAYMENT_METHODS,
  PAYMENT_METHODS,
  PaymentMethodDetails,
} from "@/components/PaymentMethods";
import { ContactButtons } from "@/components/ContactButtons";
import { getProduct } from "@/data/products";
import { formatMoney, isCurrency } from "@/lib/currency";
import { getOrderStatus } from "@/lib/orders.functions";
import { PAYMENT_STATUS_LABEL, isPaymentStatus, orderRef } from "@/lib/order-status";
import { rememberOrder } from "@/lib/recent-orders";

export const Route = createFileRoute("/order/$orderId")({
  validateSearch: z.object({ t: z.string().uuid().optional() }),
  head: () => ({
    meta: [{ title: "Your Order — Cold Coller" }, { name: "robots", content: "noindex" }],
  }),
  component: OrderPage,
});

type Order = Awaited<ReturnType<typeof getOrderStatus>>;

function OrderPage() {
  const { orderId } = Route.useParams();
  const { t } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    if (!t) {
      setError("This order link is incomplete. Use the link from your checkout or account page.");
      return;
    }
    try {
      setOrder(await getOrderStatus({ data: { id: orderId, token: t } }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your order.");
    }
  }, [orderId, t]);

  useEffect(() => {
    if (t) rememberOrder(orderId, t);
    void load();
    // Check for the admin's decision every 30 seconds while the page is open.
    const timer = setInterval(() => void load(), 30000);
    return () => clearInterval(timer);
  }, [load, orderId, t]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl">Order not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error}</p>
        <Link to="/shop" className="btn-silver mt-8 inline-flex px-8 py-3 text-xs">
          Back to the Shop
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <p className="flex items-center justify-center gap-2 px-4 py-24 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Loading your order…
      </p>
    );
  }

  const currency = isCurrency(order.currency) ? order.currency : "USD";
  const amount = formatMoney(order.total, currency);
  const status = isPaymentStatus(order.paymentStatus) ? order.paymentStatus : "awaiting_payment";
  const method =
    PAYMENT_METHODS.find((m) => m.label === order.paymentMethod) ?? ACTIVE_PAYMENT_METHODS[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Order #{orderRef(order.id)}
      </p>
      <h1 className="mt-2 font-display text-3xl md:text-4xl">{PAYMENT_STATUS_LABEL[status]}</h1>

      {status === "awaiting_payment" && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your order is reserved. Send <span className="text-silver">{amount}</span> using the
            details below, then tap <span className="text-silver">I've sent the payment</span>.
          </p>
          {method && (
            <div className="card-surface mt-8 p-6">
              <PaymentMethodDetails method={method} amount={amount} />
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="btn-silver mt-6 w-full py-3.5 text-xs"
              >
                I've Sent the Payment
              </button>
            </div>
          )}
        </>
      )}

      {status === "under_review" && (
        <StatusCard icon={<Clock size={28} className="text-silver" />}>
          <p>
            Thanks, we've received your receipt. We're checking your payment of{" "}
            <span className="text-silver">{amount}</span>. This usually takes a few hours, and once
            it's confirmed your order moves to Processing.
          </p>
          <p className="mt-3">
            This page updates on its own. Keep this link to check back:{" "}
            <span className="break-all text-silver">{currentUrl()}</span>
          </p>
        </StatusCard>
      )}

      {status === "approved" && (
        <StatusCard icon={<CheckCircle2 size={28} className="text-silver" />}>
          <p>
            Your payment of <span className="text-silver">{amount}</span> is confirmed. Order
            status: <span className="text-silver">{order.status}</span>. It ships in plain, unmarked
            packaging.
          </p>
        </StatusCard>
      )}

      {status === "rejected" && (
        <StatusCard icon={<XCircle size={28} className="text-silver" />}>
          <p>
            We couldn't confirm your payment from the receipt you sent.
            {order.reviewNote ? (
              <>
                {" "}
                Reason: <span className="text-silver">{order.reviewNote}</span>
              </>
            ) : null}
          </p>
          <p className="mt-3">Please upload a clearer receipt, or contact us below.</p>
          {method && (
            <div className="mt-6 border-t border-border pt-6 text-left">
              <PaymentMethodDetails method={method} amount={amount} />
            </div>
          )}
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="btn-silver mt-6 w-full py-3.5 text-xs"
          >
            Upload Receipt Again
          </button>
        </StatusCard>
      )}

      <div className="card-surface mt-8 p-6">
        <h2 className="font-display text-sm uppercase tracking-[0.18em] text-silver">
          Order Summary
        </h2>
        <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
          {order.items.map((l) => {
            const p = getProduct(l.id);
            return (
              <li key={l.id} className="flex justify-between gap-4">
                <span>
                  {p?.name ?? l.id} × {l.qty}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm">
          <span>Total</span>
          <span className="font-display text-brushed">{amount}</span>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs text-muted-foreground">
          Questions? Include order #{orderRef(order.id)} when you message us.
        </p>
        <ContactButtons />
      </div>

      {uploadOpen && t && (
        <ReceiptDialog
          open
          onOpenChange={setUploadOpen}
          orderId={order.id}
          token={t}
          amount={amount}
          onDone={() => {
            setUploadOpen(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

function currentUrl() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function StatusCard({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-surface mt-8 p-6 text-sm leading-relaxed text-muted-foreground">
      <div className="mb-4">{icon}</div>
      {children}
    </div>
  );
}
