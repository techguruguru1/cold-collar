import { useEffect, useState } from "react";
import { COUNTRIES } from "@/data/countries";

const selectClass =
  "mt-2 w-full appearance-none border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver disabled:opacity-60";
const labelClass = "text-[11px] uppercase tracking-[0.2em] text-silver";

/** What to call a country's regions. */
function regionLabel(code: string) {
  switch (code) {
    case "US":
    case "AU":
    case "NG":
    case "IN":
    case "MX":
    case "BR":
    case "DE":
      return "State";
    case "CA":
    case "ZA":
    case "CN":
    case "AR":
      return "Province";
    case "GB":
    case "IE":
      return "County";
    default:
      return "State / Region";
  }
}

// Region lists are downloaded once per country and remembered for this visit.
const cache = new Map<string, Promise<string[]>>();
function loadRegions(code: string) {
  let p = cache.get(code);
  if (!p) {
    p = fetch(`/geo/regions/${code}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<string[]>) : []))
      .catch(() => {
        cache.delete(code);
        return [];
      });
    cache.set(code, p);
  }
  return p;
}

/**
 * Country dropdown plus a State/Province/County dropdown for the chosen country.
 * Values are the display names (e.g. "United States", "California").
 */
export function CountryRegionFields({
  country,
  region,
  onChange,
}: {
  country: string;
  region: string;
  onChange: (next: { country: string; region: string }) => void;
}) {
  const selected = COUNTRIES.find((c) => c.name === country);
  const [regions, setRegions] = useState<string[] | null>(null);

  useEffect(() => {
    if (!selected?.hasRegions) {
      setRegions(null);
      return;
    }
    let cancelled = false;
    setRegions(null);
    void loadRegions(selected.code).then((list) => {
      if (!cancelled) setRegions(list);
    });
    return () => {
      cancelled = true;
    };
  }, [selected?.code, selected?.hasRegions]);

  const label = selected ? regionLabel(selected.code) : "State / Region";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="country" className={labelClass}>
          Country
        </label>
        <select
          id="country"
          required
          value={country}
          onChange={(e) => onChange({ country: e.target.value, region: "" })}
          className={selectClass}
        >
          <option value="" disabled>
            Select your country
          </option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selected?.hasRegions && (
        <div>
          <label htmlFor="region" className={labelClass}>
            {label}
          </label>
          <select
            id="region"
            required={!!regions && regions.length > 0}
            disabled={!regions}
            value={region}
            onChange={(e) => onChange({ country, region: e.target.value })}
            className={selectClass}
          >
            <option value="" disabled>
              {regions ? `Select your ${label.toLowerCase()}` : "Loading…"}
            </option>
            {regions?.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
