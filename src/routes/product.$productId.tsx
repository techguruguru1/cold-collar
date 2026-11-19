import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Lock, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/Stars";
import { ProductCard } from "@/components/ProductCard";
import { averageRating, formatPrice, getProduct, reviewsFor } from "@/data/products";
import { useAuth, useCart, useWishlist } from "@/lib/shop";

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Cold Collar" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Cold Collar` },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: `${product.name} — Cold Collar` },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const wishlist = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const reviews = reviewsFor(product);
  const rating = averageRating(product);
  const related = product.related
    .map((id) => getProduct(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const onHeart = async () => {
    if (!user) {
      toast("Sign in to save to your wishlist");
      void navigate({ to: "/auth" });
      return;
    }
    await wishlist.toggle(product.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <nav className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <Link to="/shop" className="hover:text-silver">
          Shop
        </Link>{" "}
        / <span className="text-silver">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="card-surface overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-secondary">
            {product.intensity} Intensity
          </span>
          <h1 className="mt-4 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={rating} size={16} />
            <span className="text-xs text-muted-foreground">
              {rating} average · {reviews.length} verified reviews
            </span>
          </div>
          <p className="mt-6 font-display text-3xl text-brushed">{formatPrice(product.price)}</p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => {
                add(product.id);
                toast(`${product.name} added to cart`);
              }}
              className="btn-steel flex-1 py-4 text-xs"
            >
              Add to Cart
            </button>
            <button
              onClick={onHeart}
              aria-label="Add to wishlist"
              className="btn-outline-silver px-5 py-4"
            >
              <Heart size={16} className={wishlist.has(product.id) ? "fill-ember text-ember" : ""} />
            </button>
          </div>
          <Link
            to="/special-order"
            search={{ product: product.id }}
            className="btn-outline-silver mt-3 flex items-center justify-center gap-2 py-4 text-xs"
          >
            <Sparkles size={16} aria-hidden="true" />
            Make a Special Order
          </Link>

          <dl className="mt-10 space-y-5 border-t border-border pt-8 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-silver">Materials & Spec</dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{product.spec}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-silver">Care</dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{product.care}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-silver">Sizing & Adjustability</dt>
              <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{product.sizing}</dd>
            </div>
            {product.sizeGuide && (
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-silver">Size Guide</dt>
                <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{product.sizeGuide}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Truck size={14} className="text-silver" /> Ships in unmarked packaging with no product
              wording on the label.
            </p>
            <p className="flex items-center gap-2">
              <Lock size={14} className="text-silver" /> Charges appear as “CC Lifestyle” on your
              statement.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-border pt-12">
        <h2 className="font-display text-2xl">Reviews</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {rating} out of 5 from {reviews.length} verified buyers.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reviews.map((r, i) => (
            <figure key={`${r.name}-${i}`} className="card-surface p-5">
              <Stars rating={r.rating} />
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                “{r.comment}”
              </blockquote>
              <figcaption className="mt-3 text-[11px] uppercase tracking-[0.18em] text-secondary">
                {r.name} · Verified Buyer
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-20 border-t border-border pt-12">
        <h2 className="font-display text-2xl">You May Also Consider</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
