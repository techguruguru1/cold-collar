import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { derivedStatus, useAuth } from "@/lib/shop";
import { getProduct } from "@/data/products";
import { formatMoney, isCurrency } from "@/lib/currency";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — Cold Coller" },
      {
        name: "description",
        content: "View your Cold Coller order history, track order status and manage your account.",
      },
      { property: "og:title", content: "Your Account — Cold Coller" },
      { property: "og:description", content: "Cold Coller order history and account details." },
    ],
  }),
  component: AccountPage,
});

type OrderRow = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  items: { id: string; qty: number }[];
  shipping: { currency?: string } | null;
};

const STEPS = ["Order Placed", "Processing", "Shipped"] as const;

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<"orders" | "details">("orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) {
      setBusy(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, total, status, items, shipping")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      const rows = (data ?? []) as unknown as OrderRow[];
      setOrders(rows);
      setBusy(false);
      // keep stored status in step with the fulfilment timeline
      for (const o of rows) {
        const next = derivedStatus(o.created_at);
        if (next !== o.status) {
          await supabase.from("orders").update({ status: next }).eq("id", o.id);
        }
      }
    };
    void load();
    const t = setInterval(() => void load(), 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user]);

  if (loading)
    return <p className="px-4 py-24 text-center text-sm text-muted-foreground">Loading…</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl">Members only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to view your order history and saved pieces.
        </p>
        <Link to="/auth" className="btn-silver mt-8 inline-flex px-8 py-3 text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl md:text-4xl">Account</h1>
        <button onClick={() => void signOut()} className="btn-outline-silver px-5 py-2.5 text-xs">
          Sign Out
        </button>
      </div>

      <div className="mt-8 flex gap-2 border-b border-border">
        {(["orders", "details"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-[11px] uppercase tracking-[0.18em] ${
              tab === t ? "border-b-2 border-silver text-silver" : "text-muted-foreground"
            }`}
          >
            {t === "orders" ? "Order History" : "Details"}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <div className="card-surface mt-8 space-y-3 p-6 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-silver">Email</p>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="pt-4 text-xs leading-relaxed text-muted-foreground">
            We never sell your data, and your purchase history is never shared. Charges appear as
            “CC Lifestyle”.
          </p>
        </div>
      ) : busy ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No orders yet.{" "}
          <Link to="/shop" className="text-silver hover:underline">
            Start with the collection
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-10 space-y-5">
          {orders.map((o) => {
            const status = derivedStatus(o.created_at);
            return (
              <li key={o.id} className="card-surface p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-sm">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-display text-brushed">
                    {formatMoney(
                      Number(o.total),
                      isCurrency(o.shipping?.currency) ? o.shipping.currency : "USD",
                    )}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {STEPS.map((s) => {
                    const done =
                      STEPS.indexOf(s) <= STEPS.indexOf(status as (typeof STEPS)[number]);
                    return (
                      <div key={s} className="flex-1">
                        <div className={`h-0.5 ${done ? "bg-silver" : "bg-border"}`} />
                        <p
                          className={`mt-2 text-[10px] uppercase tracking-[0.14em] ${done ? "text-silver" : "text-muted-foreground"}`}
                        >
                          {s}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <ul className="mt-5 space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {getProduct(it.id)?.name ?? it.id} × {it.qty}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
