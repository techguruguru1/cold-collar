import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Send } from "lucide-react";
import { ContactButtons } from "@/components/ContactButtons";
import { CONTACT_PAYMENT } from "@/config/contact-payment";
import { submitToFormspree } from "@/lib/formspree";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Customer Service — Cold Coller" },
      {
        name: "description",
        content:
          "Message the Cold Coller customer service team about orders, sizing, returns or product guidance.",
      },
      { property: "og:title", content: "Contact Cold Coller" },
      { property: "og:description", content: "Send Cold Coller customer service a message, or reach us on Signal or WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const SUBJECTS = ["Order question", "Payment", "Sizing & fit", "Shipping", "Returns & refunds", "Other"];

type Form = { name: string; email: string; phone: string; subject: string; message: string; website: string };
const EMPTY: Form = { name: "", email: "", phone: "", subject: SUBJECTS[0]!, message: "", website: "" };

function Contact() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitToFormspree(CONTACT_PAYMENT.formspree.contactFormId, {
        _subject: `Contact: ${form.subject} — ${form.name}`,
        _gotcha: form.website,
        Type: "Contact message",
        name: form.name,
        email: form.email,
        phone: form.phone,
        topic: form.subject,
        message: form.message,
      });
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver";
  const label = "text-[11px] uppercase tracking-[0.2em] text-silver";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">Customer Service</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Send us a message and we'll reply by email, usually within one business day.
      </p>

      <div className="card-surface mt-10 p-6 md:p-8">
        {sent ? (
          <div className="py-6 text-center" role="status">
            <Check size={32} className="mx-auto text-silver" />
            <h2 className="mt-4 font-display text-xl">Message sent</h2>
            <p className="mt-2 text-sm text-muted-foreground">Thanks — we'll get back to you by email soon.</p>
            <button onClick={() => setSent(false)} className="btn-outline-silver mt-6 px-6 py-3 text-xs">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className={label}>Name</label>
                <input id="c-name" required maxLength={120} value={form.name} onChange={set("name")} className={input} />
              </div>
              <div>
                <label htmlFor="c-email" className={label}>Email</label>
                <input id="c-email" type="email" required maxLength={254} value={form.email} onChange={set("email")} className={input} />
              </div>
              <div>
                <label htmlFor="c-phone" className={label}>Phone (optional)</label>
                <input id="c-phone" type="tel" maxLength={40} value={form.phone} onChange={set("phone")} className={input} />
              </div>
              <div>
                <label htmlFor="c-subject" className={label}>Topic</label>
                <select id="c-subject" value={form.subject} onChange={set("subject")} className={input}>
                  {SUBJECTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="c-message" className={label}>Message</label>
              <textarea
                id="c-message"
                required
                rows={6}
                maxLength={5000}
                value={form.message}
                onChange={set("message")}
                placeholder="Include your order reference if your message is about an order."
                className={input}
              />
            </div>
            {/* Honeypot for bots — hidden from people and screen readers */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="c-website">Website</label>
              <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
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
              {busy ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg">Prefer to chat?</h2>
        <p className="mt-2 text-sm text-muted-foreground">You can also reach us on Signal or WhatsApp.</p>
        <div className="mt-5">
          <ContactButtons />
        </div>
      </div>
    </div>
  );
}
