import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useAuth, useCart } from "@/lib/shop";
import { CurrencySwitcher } from "@/lib/currency";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/special-order", label: "Special Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/shop", search: { q: q.trim() || undefined } });
    setMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="font-display text-xl tracking-[0.2em] text-brushed md:text-2xl">
          COLD COLLER
        </Link>

        <nav className="ml-6 hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-silver" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="whitespace-nowrap text-xs uppercase tracking-[0.18em] transition-colors hover:text-silver"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden items-center md:flex">
          <div className="flex items-center gap-2 border border-border bg-input px-3 py-2">
            <Search size={14} className="text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the collection"
              aria-label="Search products"
              className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground lg:w-52"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <CurrencySwitcher className="mr-1" />
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="p-2 text-muted-foreground hover:text-silver"
          >
            <Heart size={18} />
          </Link>
          <Link
            to={user ? "/account" : "/auth"}
            aria-label="Account"
            className="p-2 text-muted-foreground hover:text-silver"
          >
            <User size={18} />
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open cart"
            className="relative p-2 text-muted-foreground hover:text-silver"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-silver px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenu((v) => !v)}
            aria-label="Menu"
            className="p-2 text-muted-foreground hover:text-silver lg:hidden"
          >
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <form
            onSubmit={submit}
            className="mb-4 flex items-center gap-2 border border-border bg-input px-3 py-2"
          >
            <Search size={14} className="text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the collection"
              aria-label="Search products"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </form>
          <nav className="flex flex-col gap-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMenu(false)}
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-silver"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
