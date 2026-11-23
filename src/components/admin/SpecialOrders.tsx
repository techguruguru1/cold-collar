import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { adminToken } from "@/lib/admin-auth";
import { adminListSpecialOrders, adminSetSpecialOrderStatus } from "@/lib/special-orders.functions";

type Filter = "new" | "handled" | "all";
type Item = Awaited<ReturnType<typeof adminListSpecialOrders>>["items"][number];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "new", label: "New" },
  { id: "handled", label: "Handled" },
  { id: "all", label: "All" },
];

/** Admin: special order requests from the Special Order page, with any photos attached. */
export function SpecialOrders({ onNewCount }: { onNewCount?: (n: number) => void }) {
  const [filter, setFilter] = useState<Filter>("new");
  const [items, setItems] = useState<Item[] | null>(null);
  const [newCount, setNewCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const accessToken = await adminToken();
      const res = await adminListSpecialOrders({ data: { accessToken, status: filter } });
      setItems(res.items);
      setNewCount(res.newCount);
      onNewCount?.(res.newCount);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't load special orders.");
      setItems([]);
    }
  }, [filter, onNewCount]);

  useEffect(() => {
    setItems(null);
    void load();
    const timer = setInterval(() => void load(), 60000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-3 text-[11px] uppercase tracking-[0.18em] ${
              filter === f.id ? "border-b-2 border-silver text-silver" : "text-muted-foreground"
            }`}
          >
            {f.label}
            {f.id === "new" && newCount ? ` (${newCount})` : ""}
          </button>
        ))}
      </div>

      {items === null ? (
        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Loading special orders…
        </p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {items.map((it) => (
            <SpecialOrderCard key={it.id} item={it} onChanged={() => void load()} />
          ))}
        </ul>
      )}
    </>
  );
}

function SpecialOrderCard({ item: it, onChanged }: { item: Item; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const handled = it.status === "handled";

  const toggle = async () => {
    setBusy(true);
    try {
      const accessToken = await adminToken();
      await adminSetSpecialOrderStatus({
        data: { accessToken, id: it.id, status: handled ? "new" : "handled" },
      });
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't update the request.");
    } finally {
      setBusy(false);
    }
  };

  const facts: [string, string | number | null][] = [
    ["Product", it.product],
    ["Size / measurements", it.size],
    ["Quantity", it.quantity],
    ["Budget", it.budget],
    ["Needed by", it.neededBy],
    ["Phone", it.phone],
  ];

  return (
    <li className={`card-surface p-5 md:p-6 ${handled ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg break-words">{it.item}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(it.createdAt).toLocaleString()} · {it.name} ·{" "}
            <a href={`mailto:${it.email}`} className="underline hover:text-silver">
              {it.email}
            </a>
          </p>
        </div>
        <span
          className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
            handled ? "border-border text-muted-foreground" : "border-silver text-silver"
          }`}
        >
          {handled ? "Handled" : "New"}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{it.details}</p>

      <dl className="mt-4 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
        {facts
          .filter(([, v]) => v !== null && v !== "")
          .map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="text-muted-foreground">{k}:</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
      </dl>

      {it.images.length > 0 ? (
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-silver">
            Photos ({it.images.length})
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {it.images.map((src, i) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-border bg-input hover:border-silver"
              >
                <img
                  src={src}
                  alt={`Photo ${i + 1} for ${it.item}`}
                  className="aspect-square w-full object-cover"
                />
              </a>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Click a photo to open it full size.
          </p>
        </div>
      ) : (
        <p className="mt-5 text-xs text-muted-foreground">No photos attached.</p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={`mailto:${it.email}?subject=${encodeURIComponent(`Your special order: ${it.item}`)}`}
          className="btn-silver px-5 py-2.5 text-xs"
        >
          Reply by email
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={() => void toggle()}
          className="btn-outline-silver px-5 py-2.5 text-xs disabled:opacity-60"
        >
          {busy ? "Saving…" : handled ? "Move back to New" : "Mark as handled"}
        </button>
      </div>
    </li>
  );
}
