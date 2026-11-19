import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/Stars";
import { averageRating, reviewsFor, type Product } from "@/data/products";
import { useCurrency } from "@/lib/currency";
import { useAuth, useCart, useWishlist } from "@/lib/shop";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { price } = useCurrency();
  const wishlist = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const rating = averageRating(product);
  const reviewCount = reviewsFor(product).length;

  const onHeart = async () => {
    if (!user) {
      toast("Sign in to save to your wishlist");
      void navigate({ to: "/auth" });
      return;
    }
    await wishlist.toggle(product.id);
    toast(wishlist.has(product.id) ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <article className="product-card card-surface group relative flex flex-col overflow-hidden">
      <button
        onClick={onHeart}
        aria-label="Add to wishlist"
        className="absolute right-3 top-3 z-10 rounded-full bg-background/70 p-2 backdrop-blur transition-colors hover:bg-background"
      >
        <Heart
          size={16}
          className={wishlist.has(product.id) ? "fill-ember text-ember" : "text-muted-foreground"}
        />
      </button>

      <Link to="/product/$productId" params={{ productId: product.id }} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">
          {product.intensity}
        </span>
        <Link
          to="/product/$productId"
          params={{ productId: product.id }}
          className="font-display text-sm leading-tight text-foreground transition-colors hover:text-silver"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          <Stars rating={rating} />
          <span className="text-xs text-muted-foreground">
            {rating} ({reviewCount})
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{product.short}</p>
        <p className="mt-auto pt-2 font-display text-lg text-brushed">{price(product.price)}</p>
        <button
          onClick={() => {
            add(product.id);
          }}
          className="btn-steel mt-1 w-full py-2.5 text-xs"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
