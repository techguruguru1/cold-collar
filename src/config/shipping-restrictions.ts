// Places we don't ship to. Checkout won't let customers continue with these addresses,
// and the server refuses the order as well. Names must match the checkout dropdowns
// (src/data/countries.ts and public/geo/regions/<CODE>.json).
//
// Alabama and Mississippi restrict the sale of certain adult devices, so all orders to
// those states are blocked. Remove a line here to allow a state again.
export const BLOCKED_REGIONS: { country: string; state: string }[] = [
  { country: "United States", state: "Alabama" },
  { country: "United States", state: "Mississippi" },
];

export function isBlockedDestination(country: string, state: string | undefined) {
  const c = country.trim().toLowerCase();
  const s = (state ?? "").trim().toLowerCase();
  return BLOCKED_REGIONS.some((r) => r.country.toLowerCase() === c && r.state.toLowerCase() === s);
}

export const blockedMessage = (state: string) =>
  `Sorry, we can't ship to ${state} because of state laws on adult products.`;
