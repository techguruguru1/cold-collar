import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { COLLECTIONS, products } from "@/data/products";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Collections — Cold Coller" },
      {
        name: "description",
        content:
          "Four Cold Coller collections: Beginner, Intermediate, Advanced and Specialty. Find the tier that matches your experience.",
      },
      { property: "og:title", content: "Collections — Cold Coller" },
      {
        property: "og:description",
        content: "Beginner, Intermediate, Advanced and Specialty gear tiers from Cold Coller.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">Product Categories</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Every piece is graded so you always know what you are stepping into.
      </p>

      <div className="mt-14 space-y-16">
        {COLLECTIONS.map((c) => {
          const items = products.filter((p) => p.collection === c.key);
          return (
            <section key={c.key}>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="font-display text-xl uppercase tracking-[0.14em] text-silver">
                    {c.icon} {c.key} Collection
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
                </div>
                <Link
                  to="/shop"
                  search={{ collection: c.key }}
                  className="text-xs uppercase tracking-[0.18em] text-silver hover:underline"
                >
                  Browse {items.length} items
                </Link>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
