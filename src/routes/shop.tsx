import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import {
  MATERIALS,
  products,
  type Collection,
  type Intensity,
} from "@/data/products";

type ShopSearch = {
  q?: string | undefined;
  collection?: Collection | undefined;
  intensity?: Intensity | undefined;
  material?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search['q'] === "string" ? search['q'] : undefined,
    collection: (["Beginner", "Intermediate", "Advanced", "Specialty"] as const).includes(
      search['collection'] as Collection,
    )
      ? (search['collection'] as Collection)
      : undefined,
    intensity: (["Beginner", "Intermediate", "Advanced"] as const).includes(
      search['intensity'] as Intensity,
    )
      ? (search['intensity'] as Intensity)
      : undefined,
    material: typeof search['material'] === "string" ? search['material'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Gear — Cold Coller" },
      {
        name: "description",
        content:
          "Browse the full Cold Coller catalogue: restraints, benches, harnesses, steel and electro gear. Filter by intensity level and premium material.",
      },
      { property: "og:title", content: "Shop All Gear — Cold Coller" },
      {
        property: "og:description",
        content: "Filter premium BDSM gear by intensity level and material. Discreet shipping worldwide.",
      },
    ],
  }),
  component: Shop,
});

const INTENSITIES: Intensity[] = ["Beginner", "Intermediate", "Advanced"];
const COLLECTION_KEYS: Collection[] = ["Beginner", "Intermediate", "Advanced", "Specialty"];

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const set = (patch: Partial<ShopSearch>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const list = products.filter((p) => {
    if (search.intensity && p.intensity !== search.intensity) return false;
    if (search.collection && p.collection !== search.collection) return false;
    if (search.material && !p.materials.includes(search.material)) return false;
    if (search.q) {
      const q = search.q.toLowerCase();
      if (!(p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)))
        return false;
    }
    return true;
  });

  const chip = (active: boolean) =>
    `border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
      active
        ? "border-silver bg-silver text-primary-foreground"
        : "border-border text-muted-foreground hover:border-silver hover:text-silver"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">Shop</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {list.length} piece{list.length === 1 ? "" : "s"}
        {search.q ? ` matching “${search.q}”` : ""}
      </p>

      <div className="mt-8 space-y-4 border-y border-border py-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[11px] uppercase tracking-[0.2em] text-silver">Intensity Level</span>
          <button className={chip(!search.intensity)} onClick={() => set({ intensity: undefined })}>
            All
          </button>
          {INTENSITIES.map((i) => (
            <button key={i} className={chip(search.intensity === i)} onClick={() => set({ intensity: i })}>
              {i}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[11px] uppercase tracking-[0.2em] text-silver">Premium Materials</span>
          <button className={chip(!search.material)} onClick={() => set({ material: undefined })}>
            All
          </button>
          {MATERIALS.map((m) => (
            <button key={m} className={chip(search.material === m)} onClick={() => set({ material: m })}>
              {m}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[11px] uppercase tracking-[0.2em] text-silver">Collection</span>
          <button className={chip(!search.collection)} onClick={() => set({ collection: undefined })}>
            All
          </button>
          {COLLECTION_KEYS.map((c) => (
            <button key={c} className={chip(search.collection === c)} onClick={() => set({ collection: c })}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Nothing matches those filters yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
