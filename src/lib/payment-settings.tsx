// Bitcoin payment details customers see. The admin can change them from the dashboard;
// they're stored in the database (site_settings). The address in src/config/contact-payment.ts
// is the default used until something is saved (or if the database can't be reached).
import { createContext, useContext, type ReactNode } from "react";
import { createServerFn } from "@tanstack/react-start";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

export type PaymentSettings = {
  bitcoinAddress: string;
  /** Uploaded QR image URL, or null to generate the QR from the address. */
  bitcoinQrUrl: string | null;
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bitcoinAddress: CONTACT_PAYMENT.bitcoin.address,
  bitcoinQrUrl: null,
};

export const SETTING_KEYS = {
  bitcoinAddress: "bitcoin_address",
  bitcoinQrUrl: "bitcoin_qr_url",
} as const;

/** Basic shape check for Bitcoin addresses (bech32 bc1..., or legacy 1... / 3...). */
export const isBitcoinAddress = (s: string) =>
  /^(bc1[02-9ac-hj-np-z]{11,87}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/.test(s.trim());

export const getPaymentSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<PaymentSettings> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("site_settings")
        .select("key, value")
        .in("key", Object.values(SETTING_KEYS));
      if (error || !data) return DEFAULT_PAYMENT_SETTINGS;
      const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
      const address = map[SETTING_KEYS.bitcoinAddress];
      return {
        bitcoinAddress:
          address && isBitcoinAddress(address) ? address : DEFAULT_PAYMENT_SETTINGS.bitcoinAddress,
        bitcoinQrUrl: map[SETTING_KEYS.bitcoinQrUrl] || null,
      };
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  },
);

const PaymentSettingsContext = createContext<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

export function PaymentSettingsProvider({
  value,
  children,
}: {
  value: PaymentSettings;
  children: ReactNode;
}) {
  return (
    <PaymentSettingsContext.Provider value={value}>{children}</PaymentSettingsContext.Provider>
  );
}

export const usePaymentSettings = () => useContext(PaymentSettingsContext);
