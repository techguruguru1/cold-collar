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
  const [shown, setShown] = useState(0);
  const handled = it.status === "handled";
  const photo = it.images[shown] ?? it.images[0];

  const toggle = async () => {
    setBusy(true);
    try {
      const accessToken = await adminToken();
      await adminSetSpecialOrderStatus({
        data: { accessToken, id: it.id, status: handled ? "new" : "handled" },
      });
      toast(handled ? "Moved back to New." : "Marked as handled.");
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
    <li className="card-surface grid gap-6 p-6 md:grid-cols-[1fr_220px]">
      <div className="min-w-0 space-y-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-base text-foreground">
            Special order #{it.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-silver">
            {handled ? "Handled" : "New"}
          </p>
        </div>
        <p>
          Sent {new Date(it.createdAt).toLocaleString()}
          {it.images.length > 0 && ` · ${it.images.length} photo${it.images.length > 1 ? "s" : ""}`}
        </p>
        <p>
          <span className="text-silver">{it.name}</span> · {it.email}
        </p>
        <div className="border-t border-border pt-3">
          <p className="break-words text-sm text-foreground">{it.item}</p>
          <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{it.details}</p>
        </div>
        {facts
          .filter(([, v]) => v !== null && v !== "")
          .map(([k, v]) => (
            <p key={k} className="break-words">
              {k}: <span className="text-silver">{v}</span>
            </p>
          ))}

        <div className="flex flex-wrap gap-2 pt-2">
          <a
            href={`mailto:${it.email}?subject=${encodeURIComponent(`Your special order: ${it.item}`)}`}
            className="btn-silver px-5 py-2.5 text-xs"
          >
            Reply by Email
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggle()}
            className="btn-outline-silver px-5 py-2.5 text-xs disabled:opacity-60"
          >
            {busy ? "Saving…" : handled ? "Move back to New" : "Mark as Handled"}
          </button>
        </div>
      </div>

      <div>
        {photo ? (
          <>
            <a
              href={photo}
              target="_blank"
              rel="noreferrer"
              className="group block border border-border hover:border-silver"
            >
              <img
                src={photo}
                alt={`Special order photo ${shown + 1}`}
                className="max-h-72 w-full object-contain"
              />
              <span className="block border-t border-border px-3 py-2 text-center text-[11px] text-muted-foreground group-hover:text-silver">
                Open full size
              </span>
            </a>
            {it.images.length > 1 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {it.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setShown(i)}
                    aria-label={`Show photo ${i + 1}`}
                    className={`border ${i === shown ? "border-silver" : "border-border"}`}
                  >
                    <img src={src} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="flex h-40 items-center justify-center border border-dashed border-border text-xs text-muted-foreground">
            No photo uploaded
          </p>
        )}
      </div>
    </li>
  );
}
