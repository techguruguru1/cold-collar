import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, ImagePlus, Phone, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { CONTACT_PAYMENT } from "@/config/contact-payment";
import { getProduct } from "@/data/products";
import { submitToFormspree } from "@/lib/formspree";
import { supabase } from "@/integrations/supabase/client";
import {
  SPECIAL_ORDER_IMAGE_MAX_BYTES,
  SPECIAL_ORDER_IMAGE_TYPES,
  SPECIAL_ORDER_MAX_IMAGES,
  SPECIAL_ORDER_BUCKET,
  createSpecialOrder,
  startSpecialOrderUpload,
} from "@/lib/special-orders.functions";

type ImageType = (typeof SPECIAL_ORDER_IMAGE_TYPES)[number];

type SpecialOrderSearch = { product?: string | undefined };

export const Route = createFileRoute("/special-order")({
  validateSearch: (search: Record<string, unknown>): SpecialOrderSearch => ({
    product: typeof search["product"] === "string" ? search["product"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Special Order — Cold Coller" },
      {
        name: "description",
        content:
          "Request a custom or special-order piece from Cold Coller: custom sizing, colours, materials or items not in the collection.",
      },
      { property: "og:title", content: "Special Order — Cold Coller" },
      {
        property: "og:description",
        content: "Request a custom Cold Coller piece made to your specification.",
      },
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
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [photoProblem, setPhotoProblem] = useState<string | null>(null);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const addPhotos = (list: FileList | null) => {
    setPhotoProblem(null);
    if (!list) return;
    const next = [...photos];
    for (const f of Array.from(list)) {
      if (next.length >= SPECIAL_ORDER_MAX_IMAGES) {
        setPhotoProblem(`You can add up to ${SPECIAL_ORDER_MAX_IMAGES} photos.`);
        break;
      }
      if (!(SPECIAL_ORDER_IMAGE_TYPES as readonly string[]).includes(f.type)) {
        setPhotoProblem("Please choose photos (JPG, PNG, WEBP or HEIC).");
        continue;
      }
      if (f.size > SPECIAL_ORDER_IMAGE_MAX_BYTES) {
        setPhotoProblem(`${f.name} is over 10 MB. Please choose a smaller photo.`);
        continue;
      }
      next.push(f);
    }
    setPhotos(next);
  };

  const set =
    (key: keyof Request) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
    "Hi Cold Coller, I'd like to make a special order.",
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
      // Bots fill the hidden field; pretend it worked.
      if (req.website) {
        setSent(true);
        return;
      }
      const imagePaths: string[] = [];
      for (const f of photos) {
        const { path, uploadToken } = await startSpecialOrderUpload({
          data: { contentType: f.type as ImageType, size: f.size },
        });
        const { error: upErr } = await supabase.storage
          .from(SPECIAL_ORDER_BUCKET)
          .uploadToSignedUrl(path, uploadToken, f, { contentType: f.type });
        if (upErr)
          throw new Error(
            "A photo couldn't be uploaded. Please check your connection and try again.",
          );
        imagePaths.push(path);
      }
      const qty = Number.parseInt(req.quantity, 10);
      await createSpecialOrder({
        data: {
          name: req.name.trim(),
          email: req.email.trim(),
          phone: req.phone.trim() || undefined,
          item: req.item.trim(),
          details: req.details.trim(),
          size: req.size.trim() || undefined,
          quantity: Number.isFinite(qty) && qty > 0 ? Math.min(qty, 999) : 1,
          budget: req.budget.trim() || undefined,
          neededBy: req.deadline || undefined,
          product: product ? `${product.name} (${product.id})` : undefined,
          imagePaths,
        },
      });
      // Email notification as well (doesn't block the customer if it fails).
      void submitToFormspree(CONTACT_PAYMENT.formspree.specialOrderFormId, {
        _subject: `Special order: ${req.item} — ${req.name}`,
        _gotcha: req.website,
        Type: "Special order request",
        name: req.name,
        email: req.email,
        phone: req.phone,
        item: req.item,
        details: req.details,
        ...details,
        Photos: imagePaths.length
          ? `${imagePaths.length} attached. View them at ${window.location.origin}/admin`
          : "None",
      }).catch(() => {});
      setSent(true);
      setReq(initial);
      setPhotos([]);
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
    window.open(
      `${CONTACT_PAYMENT.whatsapp.href}?text=${encodeURIComponent(chatMessage)}`,
      "_blank",
      "noopener",
    );
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

  const input =
    "mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver";
  const label = "text-[11px] uppercase tracking-[0.2em] text-silver";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <div className="flex items-center gap-3">
        <Sparkles aria-hidden="true" size={24} className="text-silver" />
        <h1 className="font-display text-3xl md:text-4xl">Special Order</h1>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Want custom sizing, a different colour or material, or something that isn't in the
        collection? Tell us what you have in mind and we'll email you a quote and timeline.
      </p>

      <div className="card-surface mt-10 p-6 md:p-8">
        {sent ? (
          <div className="py-6 text-center" role="status">
            <Check size={32} className="mx-auto text-silver" />
            <h2 className="mt-4 font-display text-xl">Request received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks — we'll review it and email you a quote soon.
            </p>
            <button
              onClick={() => setSent(false)}
              className="btn-outline-silver mt-6 px-6 py-3 text-xs"
            >
              Make another request
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="so-name" className={label}>
                  Name
                </label>
                <input
                  id="so-name"
                  required
                  maxLength={120}
                  value={req.name}
                  onChange={set("name")}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="so-email" className={label}>
                  Email
                </label>
                <input
                  id="so-email"
                  type="email"
                  required
                  maxLength={254}
                  value={req.email}
                  onChange={set("email")}
                  className={input}
                />
              </div>
            </div>
            <div>
              <label htmlFor="so-phone" className={label}>
                Phone (optional)
              </label>
              <input
                id="so-phone"
                type="tel"
                maxLength={40}
                value={req.phone}
                onChange={set("phone")}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="so-item" className={label}>
                What would you like?
              </label>
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
              <label htmlFor="so-details" className={label}>
                Details
              </label>
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
                <label htmlFor="so-size" className={label}>
                  Size / measurements
                </label>
                <input
                  id="so-size"
                  maxLength={200}
                  value={req.size}
                  onChange={set("size")}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="so-qty" className={label}>
                  Quantity
                </label>
                <input
                  id="so-qty"
                  type="number"
                  min={1}
                  max={999}
                  value={req.quantity}
                  onChange={set("quantity")}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="so-budget" className={label}>
                  Budget (optional)
                </label>
                <input
                  id="so-budget"
                  maxLength={60}
                  value={req.budget}
                  onChange={set("budget")}
                  placeholder="e.g. $200"
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="so-deadline" className={label}>
                  Needed by (optional)
                </label>
                <input
                  id="so-deadline"
                  type="date"
                  value={req.deadline}
                  onChange={set("deadline")}
                  className={input}
                />
              </div>
            </div>
            <div>
              <p className={label}>Photos (optional)</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a picture of what you'd like, a reference or a sketch. Up to{" "}
                {SPECIAL_ORDER_MAX_IMAGES} photos, 10 MB each.
              </p>
              {photos.length < SPECIAL_ORDER_MAX_IMAGES && (
                <label
                  htmlFor="so-photos"
                  className="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border bg-input px-4 py-6 text-xs text-muted-foreground hover:border-silver"
                >
                  <ImagePlus aria-hidden="true" size={18} className="shrink-0 text-silver" />
                  Upload image of your special order
                  <input
                    id="so-photos"
                    type="file"
                    multiple
                    accept={SPECIAL_ORDER_IMAGE_TYPES.join(",")}
                    className="sr-only"
                    onChange={(e) => {
                      addPhotos(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              {photos.length > 0 && (
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="relative border border-border bg-input">
                      {previews[i] && (
                        <img
                          src={previews[i]}
                          alt={f.name}
                          className="aspect-square w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                        aria-label={`Remove ${f.name}`}
                        className="absolute right-1 top-1 bg-background/80 p-1 text-silver hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {photoProblem && <p className="mt-2 text-xs text-red-400">{photoProblem}</p>}
            </div>
            {/* Honeypot for bots — hidden from people and screen readers */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="so-website">Website</label>
              <input
                id="so-website"
                tabIndex={-1}
                autoComplete="off"
                value={req.website}
                onChange={set("website")}
              />
            </div>
            {error && (
              <p
                role="alert"
                className="border border-destructive/60 bg-destructive/10 p-3 text-sm"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn-silver flex min-h-14 w-full items-center justify-center gap-3 px-5 py-4 text-xs disabled:opacity-60"
            >
              <Send aria-hidden="true" size={18} />
              {busy ? (photos.length ? "Uploading…" : "Sending…") : "Send Request"}
            </button>
          </form>
        )}
      </div>

      {!sent && (
        <div className="mt-10">
          <h2 className="font-display text-lg">Prefer to chat?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send the same request on WhatsApp (pre-filled for you) or Signal (we copy it for you to
            paste).
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
              {copied ? (
                <Check aria-hidden="true" size={18} />
              ) : (
                <Copy aria-hidden="true" size={18} />
              )}
              {copied ? "Copied · paste in Signal" : "Copy & open Signal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
