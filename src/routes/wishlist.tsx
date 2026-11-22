import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { getProduct } from "@/data/products";
import { useCurrency } from "@/lib/currency";
import { useAuth, useCart, useWishlist } from "@/lib/shop";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Cold Coller" },
      {
        name: "description",
        content:
          "Saved pieces from the Cold Coller collection, ready to move straight into your cart.",
      },
      { property: "og:title", content: "Your Wishlist — Cold Coller" },
      {
        property: "og:description",
        content: "Saved Cold Coller pieces, ready to add to your cart.",
      },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading } = useAuth();
  const { price } = useCurrency();
  const wishlist = useWishlist();
  const { add } = useCart();

  if (loading) {
    return <p className="px-4 py-24 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Heart size={28} className="mx-auto text-silver" />
        <h1 className="mt-6 font-display text-2xl">Your wishlist is private</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to save pieces and pick them up on any device.
        </p>
        <Link to="/auth" className="btn-silver mt-8 inline-flex px-8 py-3 text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const items = wishlist.ids
    .map((id) => getProduct(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nothing saved yet.{" "}
          <Link to="/shop" className="text-silver hover:underline">
            Browse the collection
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {items.map((p) => (
            <li
              key={p.id}
              className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <img src={p.image} alt={p.name} loading="lazy" className="h-24 w-24 object-cover" />
              <div className="flex-1">
                <Link
                  to="/product/$productId"
                  params={{ productId: p.id }}
                  className="font-display text-sm hover:text-silver"
                >
                  {p.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">{p.short}</p>
                <p className="mt-1 font-display text-sm text-brushed">{price(p.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    add(p.id);
                  }}
                  className="btn-steel px-5 py-2.5 text-xs"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => void wishlist.toggle(p.id)}
                  aria-label="Remove from wishlist"
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
