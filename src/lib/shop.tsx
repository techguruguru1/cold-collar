import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getProduct } from "@/data/products";

/* ---------------------------------- Auth ---------------------------------- */

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

/* ---------------------------------- Cart ---------------------------------- */

export type CartLine = { id: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

const EMPTY_CART: CartCtx = {
  lines: [],
  count: 0,
  subtotal: 0,
  open: false,
  setOpen: () => {},
  add: () => {},
  remove: () => {},
  setQty: () => {},
  clear: () => {},
};

export function useCart() {
  return useContext(CartContext) ?? EMPTY_CART;
}

/* -------------------------------- Wishlist -------------------------------- */

type WishlistCtx = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
  loading: boolean;
};

const WishlistContext = createContext<WishlistCtx | null>(null);

const EMPTY_WISHLIST: WishlistCtx = {
  ids: [],
  has: () => false,
  toggle: async () => {},
  loading: false,
};

export function useWishlist() {
  return useContext(WishlistContext) ?? EMPTY_WISHLIST;
}

const CART_KEY = "cc_cart_v1";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [wishIds, setWishIds] = useState<string[]>([]);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const user = session?.user ?? null;

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishIds([]);
      return;
    }
    setWishLoading(true);
    const { data } = await supabase.from("wishlist_items").select("product_id");
    setWishIds((data ?? []).map((r) => r.product_id as string));
    setWishLoading(false);
  }, [user]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  const add = useCallback((id: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === id);
      if (found) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { id, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + (getProduct(l.id)?.price ?? 0) * l.qty, 0),
    [lines],
  );
  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const toggle = useCallback(
    async (id: string) => {
      if (!user) return;
      if (wishIds.includes(id)) {
        setWishIds((p) => p.filter((x) => x !== id));
        await supabase.from("wishlist_items").delete().eq("product_id", id).eq("user_id", user.id);
      } else {
        setWishIds((p) => [...p, id]);
        await supabase.from("wishlist_items").insert({ product_id: id, user_id: user.id });
      }
    },
    [user, wishIds],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading: authLoading, signOut }}>
      <CartContext.Provider
        value={{ lines, count, subtotal, open, setOpen, add, remove, setQty, clear }}
      >
        <WishlistContext.Provider
          value={{ ids: wishIds, has: (id) => wishIds.includes(id), toggle, loading: wishLoading }}
        >
          {children}
        </WishlistContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

/* ------------------------------ Order status ------------------------------ */

export function derivedStatus(createdAt: string): "Order Placed" | "Processing" | "Shipped" {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (mins < 1) return "Order Placed";
  if (mins < 3) return "Processing";
  return "Shipped";
}
