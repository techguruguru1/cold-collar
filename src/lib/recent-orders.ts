// Remembers this browser's recent orders so guests can get back to their order page.
const KEY = "cc_recent_orders_v1";

export type RecentOrder = { id: string; token: string; at: number };

export function getRecentOrders(): RecentOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentOrder[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function rememberOrder(id: string, token: string) {
  try {
    const list = getRecentOrders().filter((o) => o.id !== id);
    list.unshift({ id, token, at: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    // storage unavailable; the order link still works
  }
}
