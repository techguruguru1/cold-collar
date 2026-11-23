import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ExternalLink, Loader2, LogOut, RefreshCw } from "lucide-react";
import { BitcoinSettings } from "@/components/admin/BitcoinSettings";
import { getProduct } from "@/data/products";
import { formatMoney, isCurrency } from "@/lib/currency";
import { adminAuth, adminToken } from "@/lib/admin-auth";
import {
  adminListOrders,
  adminReviewPayment,
  adminSetFulfilment,
  adminSummary,
  adminWhoAmI,
} from "@/lib/admin.functions";
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  orderRef,
  type PaymentStatus,
} from "@/lib/order-status";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Cold Coller" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

type Row = Awaited<ReturnType<typeof adminListOrders>>[number];
type Summary = Awaited<ReturnType<typeof adminSummary>>;
type Tab = PaymentStatus | "all";

const TABS: { id: Tab; label: string }[] = [
  { id: "under_review", label: "To review" },
  { id: "approved", label: "Successful" },
  { id: "awaiting_payment", label: "Awaiting payment" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All orders" },
];

function AdminPage() {
  // Signed-in state lives only in memory: every visit or refresh asks for the login again.
  const [email, setEmail] = useState<string | null>(null);

  if (!email) return <AdminLogin onSignedIn={setEmail} />;
  return (
    <Dashboard
      email={email}
      onSignOut={async () => {
        await adminAuth().auth.signOut();
        setEmail(null);
      }}
    />
  );
}

function AdminLogin({ onSignedIn }: { onSignedIn: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      const { data, error } = await adminAuth().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.session) throw new Error("Wrong email or password.");
      try {
        await adminWhoAmI({ data: { accessToken: data.session.access_token } });
      } catch (err) {
        await adminAuth().auth.signOut();
        throw err;
      }
      setPassword("");
      onSignedIn(data.user.email ?? email.trim());
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="card-surface w-full max-w-sm space-y-5 p-8">
        <div>
          <p className="font-display text-lg tracking-[0.2em] text-brushed">COLD COLLER</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Admin sign-in
          </p>
        </div>
        <div>
          <label
            htmlFor="admin-email"
            className="text-[11px] uppercase tracking-[0.2em] text-silver"
          >
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver"
          />
        </div>
        <div>
          <label
            htmlFor="admin-password"
            className="text-[11px] uppercase tracking-[0.2em] text-silver"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver"
          />
        </div>
        {problem && <p className="text-xs text-red-400">{problem}</p>}
        <button
          type="submit"
          disabled={busy}
          className="btn-silver w-full py-3 text-xs disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const [view, setView] = useState<"orders" | "settings">("orders");
  const [tab, setTab] = useState<Tab>("under_review");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const load = useCallback(async () => {
    try {
      const accessToken = await adminToken();
      const [list, sum] = await Promise.all([
        adminListOrders({ data: { accessToken, paymentStatus: tab } }),
        adminSummary({ data: { accessToken } }),
      ]);
      setRows(list);
      setSummary(sum);
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

  const revenue = summary
    ? Object.entries(summary.revenue)
        .map(([c, v]) => formatMoney(v, isCurrency(c) ? c : "USD"))
        .join(" · ")
    : "";

  const tabCount = (id: Tab) =>
    !summary
      ? undefined
      : id === "all"
        ? summary.total
        : id === "approved"
          ? summary.approved
          : id === "under_review"
            ? summary.underReview
            : id === "awaiting_payment"
              ? summary.awaiting
              : summary.rejected;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <p className="font-display text-sm tracking-[0.2em] text-brushed">
            COLD COLLER <span className="text-muted-foreground">· ADMIN</span>
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{email}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="btn-outline-silver inline-flex items-center gap-2 px-3 py-2 text-[11px]"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="btn-outline-silver inline-flex items-center gap-2 px-3 py-2 text-[11px]"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl">
            {view === "orders" ? "Dashboard" : "Payment settings"}
          </h1>
          <div className="flex gap-2">
            {(["orders", "settings"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-4 py-2 text-[11px] ${view === v ? "btn-silver" : "btn-outline-silver"}`}
              >
                {v === "orders" ? "Orders" : "Payment settings"}
              </button>
            ))}
          </div>
        </div>

        {view === "settings" ? (
          <BitcoinSettings />
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Successful orders"
                value={summary?.approved}
                sub={summary ? `${summary.approvedLast30} in the last 30 days` : ""}
              />
              <StatCard label="Revenue (approved)" value={revenue || (summary ? "—" : undefined)} />
              <StatCard
                label="To review"
                value={summary?.underReview}
                sub={summary ? `${summary.awaiting} awaiting payment` : ""}
                highlight={(summary?.underReview ?? 0) > 0}
              />
              <StatCard
                label="Shipped"
                value={summary?.shipped}
                sub={summary ? `${summary.rejected} rejected · ${summary.total} total` : ""}
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-2 border-b border-border">
              {TABS.map((t) => {
                const n = tabCount(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-3 text-[11px] uppercase tracking-[0.18em] ${
                      tab === t.id
                        ? "border-b-2 border-silver text-silver"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t.label}
                    {n ? ` (${n})` : ""}
                  </button>
                );
              })}
            </div>

            {rows === null ? (
              <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" /> Loading orders…
              </p>
            ) : rows.length === 0 ? (
              <p className="mt-10 text-sm text-muted-foreground">Nothing here yet.</p>
            ) : (
              <ul className="mt-8 space-y-5">
                {rows.map((r) => (
                  <OrderCard key={r.id} row={r} onChanged={() => void load()} />
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number | undefined;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card-surface p-5 ${highlight ? "border-silver" : ""}`}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-brushed">
        {value === undefined ? <Loader2 size={18} className="animate-spin" /> : value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
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

  const act = async (fn: (accessToken: string) => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn(await adminToken());
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
          <span className="text-silver">{PAYMENT_STATUS_LABEL[status]}</span>
          {status === "approved" && ` · ${r.status}`} · {r.paymentMethod ?? "Bitcoin"} · placed{" "}
          {new Date(r.createdAt).toLocaleString()}
          {r.receiptUploadedAt && ` · receipt ${new Date(r.receiptUploadedAt).toLocaleString()}`}
        </p>
        <p>
          <span className="text-silver">{r.name}</span> · {r.email}
          <br />
          {r.address}
        </p>
        {r.payTo && (
          <p className="break-all">
            Pays to: <span className="font-mono text-silver">{r.payTo}</span>
          </p>
        )}
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
                  (accessToken) =>
                    adminReviewPayment({ data: { accessToken, id: r.id, decision: "approve" } }),
                  `Order #${orderRef(r.id)} approved.`,
                )
              }
              className="btn-silver px-5 py-2.5 text-xs disabled:opacity-60"
            >
              Accept Payment
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
                    (accessToken) =>
                      adminReviewPayment({
                        data: {
                          accessToken,
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

        {status === "approved" && r.status !== "Shipped" && (
          <div className="pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void act(
                  (accessToken) =>
                    adminSetFulfilment({ data: { accessToken, id: r.id, status: "Shipped" } }),
                  `Order #${orderRef(r.id)} marked as shipped.`,
                )
              }
              className="btn-outline-silver px-4 py-2 text-xs disabled:opacity-60"
            >
              Mark Shipped
            </button>
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
