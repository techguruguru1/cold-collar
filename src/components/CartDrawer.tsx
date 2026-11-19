import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { formatPrice, getProduct } from "@/data/products";
import { useCart } from "@/lib/shop";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, subtotal } = useCart();

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border bg-card transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Cart"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-silver">Your Cart</h2>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="text-muted-foreground hover:text-silver">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 && (
            <p className="mt-10 text-center text-xs text-muted-foreground">Your cart is empty.</p>
          )}
          <ul className="space-y-4">
            {lines.map((line) => {
              const p = getProduct(line.id);
              if (!p) return null;
              return (
                <li key={line.id} className="flex gap-3 border-b border-border pb-4">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-20 w-20 object-cover" />
                  <div className="flex-1">
                    <p className="font-display text-xs leading-tight">{p.name}</p>
                    <p className="mt-1 text-xs text-brushed">{formatPrice(p.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQty(line.id, line.qty - 1)}
                        aria-label="Decrease quantity"
                        className="border border-border p-1 text-muted-foreground hover:text-silver"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs">{line.qty}</span>
                      <button
                        onClick={() => setQty(line.id, line.qty + 1)}
                        aria-label="Increase quantity"
                        className="border border-border p-1 text-muted-foreground hover:text-silver"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => remove(line.id)}
                        aria-label="Remove item"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-display text-brushed">{formatPrice(subtotal)}</span>
          </div>
          <p className="mb-3 text-[11px] text-muted-foreground">
            Discreet packaging. Billed as CC Lifestyle.
          </p>
          <Link
            to="/checkout"
            onClick={() => setOpen(false)}
            className="btn-silver block w-full py-3 text-center text-xs"
          >
            Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}
