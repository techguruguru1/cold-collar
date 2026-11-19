import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Phone, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CONTACT_PAYMENT } from "@/config/contact-payment";
import { getProduct } from "@/data/products";
import { submitToFormspree } from "@/lib/formspree";

type SpecialOrderSearch = { product?: string | undefined };

export const Route = createFileRoute("/special-order")({
  validateSearch: (search: Record<string, unknown>): SpecialOrderSearch => ({
    product: typeof search["product"] === "string" ? search["product"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Special Order — Cold Collar" },
      {
        name: "description",
        content:
          "Request a custom or special-order piece from Cold Collar: custom sizing, colours, materials or items not in the collection.",
      },
      { property: "og:title", content: "Special Order — Cold Collar" },
      { property: "og:description", content: "Request a custom Cold Collar piece made to your specification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SpecialOrder,
});

type Request = {
  name: string;
  email: string;
  phone: string;
  item: string;
  details: string;
  size: string;
  quantity: string;
  budget: string;
  deadline: string;
  website: string;
};

function SpecialOrder() {
  const { product: productId } = Route.useSearch();
  const product = productId ? getProduct(productId) : undefined;
  const initial: Request = {
    name: "",
    email: "",
    phone: "",
    item: product ? `Custom version of ${product.name}` : "",
    details: "",
    size: "",
    quantity: "1",
    budget: "",
    deadline: "",
    website: "",
  };
  const [req, setReq] = useState<Request>(initial);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof Request) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setReq({ ...req, [key]: e.target.value });

  const extra: Record<string, string> = {
    ...(product ? { Product: `${product.name} (${product.id})` } : {}),
    "Size / measurements": req.size.trim(),
    Quantity: req.quantity.trim() || "1",
    Budget: req.budget.trim(),
    "Needed by": req.deadline,
  };
  const details = Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== ""));

  const chatMessage = [
    "Hi Cold Collar, I'd like to make a special order.",
    "",
    ...[
      ["Name", req.name],
      ["Item", req.item],
      ["Details", req.details],
      ...Object.entries(details),
    ]
      .filter(([, v]) => v!.trim() !== "")
      .map(([k, v]) => `${k}: ${v!.trim()}`),
  ].join("\n");

  const chatReady = req.item.trim() !== "" && req.details.trim() !== "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitToFormspree(CONTACT_PAYMENT.formspree.specialOrderFormId, {
        _subject: `Special order: ${req.item} — ${req.name}`,
        _gotcha: req.website,
        Type: "Special order request",
        name: req.name,
        email: req.email,
        phone: req.phone,
        item: req.item,
        details: req.details,
        ...details,
      });
      setSent(true);
      setReq(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendWhatsApp = () => {
    if (!chatReady) {
      toast("Add what you'd like and the details first.");
      return;
    }
    window.open(`${CONTACT_PAYMENT.whatsapp.href}?text=${encodeURIComponent(chatMessage)}`, "_blank", "noopener");
  };

  const copyForSignal = async () => {
    if (!chatReady) {
      toast("Add what you'd like and the details first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(chatMessage);
    } catch {
      toast("Couldn't copy. Please copy your request manually.");
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.open(CONTACT_PAYMENT.signal.href, "_blank", "noopener");
  };

  const input = "mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver";
  const label = "text-[11px] uppercase tracking-[0.2em] text-silver";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <div className="flex items-center gap-3">
        <Sparkles aria-hidden="true" size={24} className="text-silver" />
        <h1 className="font-display text-3xl md:text-4xl">Special Order</h1>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Want custom sizing, a different colour or material, or something that isn't in the collection? Tell us
        what you have in mind and we'll email you a quote and timeline.
      </p>

      <div className="card-surface mt-10 p-6 md:p-8">
        {sent ? (
          <div className="py-6 text-center" role="status">
            <Check size={32} className="mx-auto text-silver" />
            <h2 className="mt-4 font-display text-xl">Request received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks — we'll review it and email you a quote soon.
            </p>
            <button onClick={() => setSent(false)} className="btn-outline-silver mt-6 px-6 py-3 text-xs">
              Make another request
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="so-name" className={label}>Name</label>
                <input id="so-name" required maxLength={120} value={req.name} onChange={set("name")} className={input} />
              </div>
              <div>
                <label htmlFor="so-email" className={label}>Email</label>
                <input id="so-email" type="email" required maxLength={254} value={req.email} onChange={set("email")} className={input} />
              </div>
            </div>
            <div>
              <label htmlFor="so-phone" className={label}>Phone (optional)</label>
              <input id="so-phone" type="tel" maxLength={40} value={req.phone} onChange={set("phone")} className={input} />
            </div>
            <div>
              <label htmlFor="so-item" className={label}>What would you like?</label>
              <input
                id="so-item"
                required
                maxLength={200}
                value={req.item}
                onChange={set("item")}
                placeholder="e.g. Leather harness in red"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="so-details" className={label}>Details</label>
              <textarea
                id="so-details"
                required
                rows={5}
                maxLength={5000}
                value={req.details}
                onChange={set("details")}
                placeholder="Materials, colours, hardware, engraving, anything we should know"
                className={input}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="so-size" className={label}>Size / measurements</label>
                <input id="so-size" maxLength={200} value={req.size} onChange={set("size")} className={input} />
              </div>
              <div>
                <label htmlFor="so-qty" className={label}>Quantity</label>
                <input id="so-qty" type="number" min={1} max={999} value={req.quantity} onChange={set("quantity")} className={input} />
              </div>
              <div>
                <label htmlFor="so-budget" className={label}>Budget (optional)</label>
                <input id="so-budget" maxLength={60} value={req.budget} onChange={set("budget")} placeholder="e.g. $200" className={input} />
              </div>
              <div>
                <label htmlFor="so-deadline" className={label}>Needed by (optional)</label>
                <input id="so-deadline" type="date" value={req.deadline} onChange={set("deadline")} className={input} />
              </div>
            </div>
            {/* Honeypot for bots — hidden from people and screen readers */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="so-website">Website</label>
              <input id="so-website" tabIndex={-1} autoComplete="off" value={req.website} onChange={set("website")} />
            </div>
            {error && (
              <p role="alert" className="border border-destructive/60 bg-destructive/10 p-3 text-sm">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn-silver flex min-h-14 w-full items-center justify-center gap-3 px-5 py-4 text-xs disabled:opacity-60"
            >
              <Send aria-hidden="true" size={18} />
              {busy ? "Sending…" : "Send Request"}
            </button>
          </form>
        )}
      </div>

      {!sent && (
        <div className="mt-10">
          <h2 className="font-display text-lg">Prefer to chat?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send the same request on WhatsApp (pre-filled for you) or Signal (we copy it for you to paste).
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={sendWhatsApp}
              className="btn-steel flex min-h-14 items-center justify-center gap-3 px-5 py-4 text-xs"
            >
              <Phone aria-hidden="true" size={18} />
              Send on WhatsApp
            </button>
            <button
              type="button"
              onClick={() => void copyForSignal()}
              className="btn-outline-silver flex min-h-14 items-center justify-center gap-3 px-5 py-4 text-xs"
            >
              {copied ? <Check aria-hidden="true" size={18} /> : <Copy aria-hidden="true" size={18} />}
              {copied ? "Copied · paste in Signal" : "Copy & open Signal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
