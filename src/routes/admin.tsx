import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/shop";
import { getProduct } from "@/data/products";
import { formatMoney, isCurrency } from "@/lib/currency";
import {
  adminListOrders,
  adminReviewPayment,
  adminSetFulfilment,
  checkIsAdmin,
} from "@/lib/orders.functions";
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  orderRef,
  type PaymentStatus,
} from "@/lib/order-status";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Payments — Cold Coller Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

type Row = Awaited<ReturnType<typeof adminListOrders>>[number];

const TAB_LABEL: Record<PaymentStatus, string> = {
  under_review: "To review",
  awaiting_payment: "Awaiting payment",
  approved: "Approved",
  rejected: "Rejected",
};
const TABS: PaymentStatus[] = ["under_review", "awaiting_payment", "approved", "rejected"];

function AdminPage() {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return setAllowed(false);
    checkIsAdmin()
      .then((r) => setAllowed(r.isAdmin))
      .catch(() => setAllowed(false));
  }, [user, loading]);

  if (loading || (user && allowed === null)) {
    return (
      <p className="flex items-center justify-center gap-2 px-4 py-24 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </p>
    );
  }

  if (!user || !allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl">Admins only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {user
            ? "Your account doesn't have admin access."
            : "Sign in with your admin account to review payments."}
        </p>
        {!user && (
          <Link to="/auth" className="btn-silver mt-8 inline-flex px-8 py-3 text-xs">
            Sign In
          </Link>
        )}
      </div>
    );
  }

  return <PaymentsDashboard />;
}

function PaymentsDashboard() {
  const [tab, setTab] = useState<PaymentStatus>("under_review");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [counts, setCounts] = useState<Partial<Record<PaymentStatus, number>>>({});

  const load = useCallback(async () => {
    try {
      const list = await adminListOrders({ data: { paymentStatus: tab } });
      setRows(list);
      setCounts((c) => ({ ...c, [tab]: list.length }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load orders.");
      setRows([]);
    }
  }, [tab]);

  useEffect(() => {
    setRows(null);
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => clearInterval(timer);
  }, [load]);

  // Keep the "To review" count fresh while looking at other tabs.
  useEffect(() => {
    adminListOrders({ data: { paymentStatus: "under_review" } })
      .then((l) => setCounts((c) => ({ ...c, under_review: l.length })))
      .catch(() => {});
  }, [tab]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl md:text-4xl">Payments</h1>
        <button
          type="button"
          onClick={() => void load()}
          className="btn-outline-silver inline-flex items-center gap-2 px-4 py-2 text-xs"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={`px-4 py-3 text-[11px] uppercase tracking-[0.18em] ${
              tab === s ? "border-b-2 border-silver text-silver" : "text-muted-foreground"
            }`}
          >
            {TAB_LABEL[s]}
            {counts[s] ? ` (${counts[s]})` : ""}
          </button>
        ))}
      </div>

      {rows === null ? (
        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Loading orders…
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          Nothing here. {tab === "under_review" && "New receipts show up here automatically."}
        </p>
      ) : (
        <ul className="mt-8 space-y-5">
          {rows.map((r) => (
            <OrderCard key={r.id} row={r} onChanged={() => void load()} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ row: r, onChanged }: { row: Row; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const amount = formatMoney(r.total, isCurrency(r.currency) ? r.currency : "USD");
  const status = (PAYMENT_STATUSES as readonly string[]).includes(r.paymentStatus)
    ? (r.paymentStatus as PaymentStatus)
    : "awaiting_payment";

  const act = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn();
      toast(done);
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="card-surface grid gap-6 p-6 md:grid-cols-[1fr_220px]">
      <div className="space-y-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-base text-foreground">Order #{orderRef(r.id)}</p>
          <p className="font-display text-lg text-brushed">{amount}</p>
        </div>
        <p>
          <span className="text-silver">{PAYMENT_STATUS_LABEL[status]}</span> ·{" "}
          {r.paymentMethod ?? "Bitcoin"} · placed {new Date(r.createdAt).toLocaleString()}
          {r.receiptUploadedAt && ` · receipt ${new Date(r.receiptUploadedAt).toLocaleString()}`}
        </p>
        <p>
          <span className="text-silver">{r.name}</span> · {r.email}
          <br />
          {r.address}
        </p>
        {r.transactionId && (
          <p className="break-all">
            Transaction ID: <span className="text-silver">{r.transactionId}</span>
          </p>
        )}
        <ul className="border-t border-border pt-3">
          {r.items.map((it) => (
            <li key={it.id}>
              {getProduct(it.id)?.name ?? it.id} × {it.qty}
            </li>
          ))}
        </ul>
        {r.reviewNote && <p>Note to customer: {r.reviewNote}</p>}

        {status === "under_review" && !rejecting && (
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void act(
                  () => adminReviewPayment({ data: { id: r.id, decision: "approve" } }),
                  `Order #${orderRef(r.id)} approved.`,
                )
              }
              className="btn-silver px-5 py-2.5 text-xs disabled:opacity-60"
            >
              Approve Payment
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRejecting(true)}
              className="btn-outline-silver px-5 py-2.5 text-xs disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        )}

        {rejecting && (
          <div className="space-y-2 pt-2">
            <label htmlFor={`note-${r.id}`} className="text-[11px] uppercase tracking-[0.2em]">
              Reason (the customer sees this)
            </label>
            <input
              id={`note-${r.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Amount doesn't match, or the payment hasn't arrived"
              className="w-full border border-border bg-input px-3 py-2 text-sm outline-none focus:border-silver"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void act(
                    () =>
                      adminReviewPayment({
                        data: {
                          id: r.id,
                          decision: "reject",
                          ...(note.trim() ? { note: note.trim() } : {}),
                        },
                      }),
                    `Order #${orderRef(r.id)} rejected.`,
                  )
                }
                className="btn-silver px-5 py-2.5 text-xs disabled:opacity-60"
              >
                Confirm Reject
              </button>
              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="btn-outline-silver px-5 py-2.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {status === "approved" && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span>
              Fulfilment: <span className="text-silver">{r.status}</span>
            </span>
            {r.status !== "Shipped" && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void act(
                    () => adminSetFulfilment({ data: { id: r.id, status: "Shipped" } }),
                    `Order #${orderRef(r.id)} marked as shipped.`,
                  )
                }
                className="btn-outline-silver px-4 py-2 text-xs disabled:opacity-60"
              >
                Mark Shipped
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        {r.receiptUrl ? (
          <a
            href={r.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="group block border border-border hover:border-silver"
          >
            {r.receiptIsPdf ? (
              <span className="flex h-40 items-center justify-center gap-2 text-xs text-silver">
                <ExternalLink size={14} /> Open PDF receipt
              </span>
            ) : (
              <img
                src={r.receiptUrl}
                alt="Payment receipt"
                className="max-h-72 w-full object-contain"
              />
            )}
            <span className="block border-t border-border px-3 py-2 text-center text-[11px] text-muted-foreground group-hover:text-silver">
              Open full size
            </span>
          </a>
        ) : (
          <p className="flex h-40 items-center justify-center border border-dashed border-border text-xs text-muted-foreground">
            No receipt yet
          </p>
        )}
      </div>
    </li>
  );
}
