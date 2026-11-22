import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ShieldCheck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/Stars";
import { COLLECTIONS } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cold Coller — Discipline. Desire. Control." },
      {
        name: "description",
        content:
          "Premium BDSM boutique. Leather, steel and precision gear for beginners through advanced collectors. Discreet shipping and billing.",
      },
      { property: "og:title", content: "Cold Coller — Discipline. Desire. Control." },
      {
        property: "og:description",
        content: "Premium BDSM boutique with discreet shipping, premium materials and secure checkout.",
      },
    ],
  }),
  component: Home,
});

const TESTIMONIALS = [
  {
    name: "Alexei V.",
    rating: 5,
    quote: "The packaging was completely unmarked and the gear itself is museum-grade. Rare combination.",
  },
  {
    name: "Marguerite O.",
    rating: 5,
    quote: "We started with the beginner kit and worked up. Every piece has felt considered and safe.",
  },
  {
    name: "Devon P.",
    rating: 4,
    quote: "Steel set is genuinely heavy-duty. Ordering again for the leather side of the collection.",
  },
];

function Home() {
  const [email, setEmail] = useState("");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-shimmer" />
        <div className="hero-grid" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 text-center md:px-6 md:py-40">
          <p className="animate-fade-up text-[11px] uppercase tracking-[0.4em] text-secondary">
            Premium Adult Lifestyle Boutique
          </p>
          <h1 className="animate-fade-up mt-6 font-display text-4xl leading-[1.05] text-brushed sm:text-6xl md:text-7xl">
            Discipline. Desire. Control.
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Hand-finished leather, aircraft aluminium and surgical steel — built for those who take
            the lifestyle seriously. Shipped discreetly, always.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/shop" className="btn-silver px-10 py-4 text-xs">
              Shop Now
            </Link>
            <Link to="/categories" className="btn-outline-silver px-10 py-4 text-xs">
              View Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3 md:px-6">
          {[
            { icon: Lock, title: "Discreet Shipping", copy: "Unmarked outer packaging, no product wording." },
            { icon: BadgeCheck, title: "Premium Quality", copy: "Full-grain leather, 316L steel, medical silicone." },
            { icon: ShieldCheck, title: "Secure Checkout", copy: "Encrypted flow. Billed as CC Lifestyle." },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <b.icon size={20} className="mt-0.5 text-silver" />
              <div>
                <h3 className="font-display text-sm uppercase tracking-[0.14em]">{b.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{b.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h2 className="font-display text-2xl md:text-3xl">Collections</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Four tiers, from a first careful step to the full advanced arsenal.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.key}
              to="/shop"
              search={{ collection: c.key }}
              className="product-card card-surface flex flex-col p-6"
            >
              <span className="text-2xl">{c.icon}</span>
              <h3 className="mt-4 font-display text-base uppercase tracking-[0.14em] text-silver">
                {c.key} Collection
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <h2 className="font-display text-2xl md:text-3xl">What Our Members Say</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card-surface p-6">
                <Stars rating={t.rating} />
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-[0.18em] text-secondary">
                  {t.name} · Verified Buyer
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="card-surface relative overflow-hidden p-10 text-center md:p-16">
          <div className="hero-shimmer" />
          <div className="relative">
            <h2 className="font-display text-2xl text-brushed md:text-4xl">Join the Inner Circle</h2>
            <p className="mt-3 text-sm text-muted-foreground">Get 15% off your first order.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast("Welcome to the Inner Circle — your 15% code is on its way.");
                setEmail("");
              }}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="flex-1 border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver"
              />
              <button type="submit" className="btn-silver px-8 py-3 text-xs">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
