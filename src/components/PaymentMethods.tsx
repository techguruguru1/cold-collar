import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bitcoin,
  Check,
  Copy,
  DollarSign,
  ExternalLink,
  Landmark,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CONTACT_PAYMENT } from "@/config/contact-payment";
import { usePaymentSettings } from "@/lib/payment-settings";

export type PaymentMethodId = "cashapp" | "paypal" | "zelle" | "bitcoin";

type MethodInfo = {
  id: PaymentMethodId;
  label: string;
  icon: ReactNode;
  fieldLabel: string;
  value: string;
  /** What the QR code encodes (a pay link or URI). Empty = no generated QR. */
  qrValue: string;
  /** Optional uploaded QR image instead of a generated one. */
  qrImage?: string | undefined;
  openHref?: string;
  openLabel?: string;
  steps: string[];
  warning?: string;
};

const { cashapp, paypal, zelle, bitcoin } = CONTACT_PAYMENT;
const cashtag = cashapp.cashtag.startsWith("$") ? cashapp.cashtag : `$${cashapp.cashtag}`;
const cashLink = `https://cash.app/${cashtag}`;
const paypalLink = `https://paypal.me/${paypal.username}`;

export const PAYMENT_METHODS: MethodInfo[] = [
  {
    id: "cashapp",
    label: "Cash App",
    icon: <DollarSign aria-hidden="true" size={18} />,
    fieldLabel: "Cashtag",
    value: cashtag,
    qrValue: cashLink,
    openHref: cashLink,
    openLabel: "Open Cash App",
    steps: [
      "Scan the QR code with your phone camera or Cash App, or copy the $Cashtag.",
      "Send the exact order total. Leave the note blank or write only your order number.",
      "Message us on Signal or WhatsApp with your order number and a screenshot of the payment.",
    ],
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: <Wallet aria-hidden="true" size={18} />,
    fieldLabel: "PayPal username",
    value: `paypal.me/${paypal.username}`,
    qrValue: paypalLink,
    openHref: paypalLink,
    openLabel: "Open PayPal",
    steps: [
      "Scan the QR code or open the PayPal link, or copy the username.",
      "Send the exact order total.",
      "Message us on Signal or WhatsApp with your order number and the PayPal transaction ID.",
    ],
  },
  {
    id: "zelle",
    label: "Zelle",
    icon: <Landmark aria-hidden="true" size={18} />,
    fieldLabel: `Zelle recipient · ${zelle.name}`,
    value: zelle.recipient,
    qrValue: "",
    qrImage: zelle.qrImage || undefined,
    steps: [
      "Open Zelle in your banking app and add the recipient above (or scan the QR code if shown).",
      `Check the recipient name shows as “${zelle.name}” before you send.`,
      "Send the exact order total, then message us on Signal or WhatsApp with your order number and a screenshot.",
    ],
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    icon: <Bitcoin aria-hidden="true" size={18} />,
    fieldLabel: "Bitcoin address",
    value: bitcoin.address,
    qrValue: `bitcoin:${bitcoin.address}`,
    steps: [
      "Scan the QR code with your wallet, or copy the address.",
      "Send the exact BTC amount equal to your order total.",
      'Tap "I\'ve sent the payment" below and upload a screenshot of the payment. We confirm it after 1 network confirmation.',
    ],
    warning:
      "Only send Bitcoin (BTC) to this address. Sending any other coin will result in permanent loss.",
  },
];

/**
 * Manual methods shown to customers. Cash App, PayPal and Zelle are switched off for now
 * (card payments go through Stripe). Add their ids back here to show them again.
 */
export const ENABLED_METHODS: PaymentMethodId[] = ["bitcoin"];
export const ACTIVE_PAYMENT_METHODS = PAYMENT_METHODS.filter((m) => ENABLED_METHODS.includes(m.id));

export function getPaymentMethod(id: PaymentMethodId) {
  return PAYMENT_METHODS.find((m) => m.id === id)!;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="btn-silver flex min-h-12 flex-1 items-center justify-center gap-2 px-6 py-3 text-xs sm:flex-none"
      aria-live="polite"
    >
      {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
      {copied ? "Copied" : `Copy ${label}`}
    </button>
  );
}

export function PaymentMethodDetails({
  method: baseMethod,
  amount,
}: {
  method: MethodInfo;
  amount?: string | undefined;
}) {
  // The Bitcoin address and QR image can be changed by the admin from the dashboard.
  const settings = usePaymentSettings();
  const method: MethodInfo =
    baseMethod.id === "bitcoin"
      ? {
          ...baseMethod,
          value: settings.bitcoinAddress,
          qrValue: `bitcoin:${settings.bitcoinAddress}`,
          qrImage: settings.bitcoinQrUrl ?? undefined,
        }
      : baseMethod;
  return (
    <div>
      {amount && (
        <p className="text-sm text-muted-foreground">
          Amount to send: <span className="font-display text-brushed">{amount}</span>
        </p>
      )}
      <div className="mt-4 grid items-start gap-6 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-silver">{method.fieldLabel}</p>
          <div className="mt-2 border border-border bg-input p-4">
            <code className="block select-all break-all font-mono text-sm leading-relaxed text-foreground">
              {method.value}
            </code>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <CopyButton
              value={method.value}
              label={
                method.id === "bitcoin"
                  ? "address"
                  : method.id === "zelle"
                    ? "recipient"
                    : method.id === "cashapp"
                      ? "$Cashtag"
                      : "username"
              }
            />
            {method.openHref && (
              <a
                href={method.openHref}
                target="_blank"
                rel="noreferrer"
                className="btn-outline-silver flex min-h-12 flex-1 items-center justify-center gap-2 px-6 py-3 text-xs sm:flex-none"
              >
                <ExternalLink aria-hidden="true" size={16} />
                {method.openLabel}
              </a>
            )}
          </div>
        </div>

        {method.qrImage ? (
          <div className="mx-auto border border-border bg-foreground p-3 md:mx-0">
            <img
              src={method.qrImage}
              alt={`${method.label} QR code`}
              width={176}
              height={176}
              className="h-44 w-44 object-contain"
            />
          </div>
        ) : method.qrValue ? (
          <div className="mx-auto border border-border bg-foreground p-3 md:mx-0">
            <QRCodeSVG
              value={method.qrValue}
              size={176}
              level="M"
              bgColor="var(--foreground)"
              fgColor="var(--background)"
              title={`${method.label} QR code for Cold Coller`}
            />
          </div>
        ) : null}
      </div>

      <ol className="mt-7 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {method.steps.map((s, i) => (
          <li key={i}>
            <span className="mr-2 font-display text-silver">{i + 1}.</span>
            {s}
          </li>
        ))}
      </ol>

      {method.warning && (
        <div className="mt-7 flex gap-3 border border-destructive/60 bg-destructive/10 p-4 text-sm leading-relaxed text-foreground">
          <TriangleAlert
            aria-hidden="true"
            size={20}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p>{method.warning}</p>
        </div>
      )}
    </div>
  );
}

export function PaymentMethods({
  value,
  onChange,
  amount,
}: {
  value?: PaymentMethodId;
  onChange?: (id: PaymentMethodId) => void;
  amount?: string;
}) {
  const [internal, setInternal] = useState<PaymentMethodId>(ACTIVE_PAYMENT_METHODS[0]!.id);
  const selected = value ?? internal;
  const select = (id: PaymentMethodId) => {
    setInternal(id);
    onChange?.(id);
  };
  const method = getPaymentMethod(selected);
  const showTabs = ACTIVE_PAYMENT_METHODS.length > 1;

  return (
    <section aria-labelledby="payment-heading">
      <h2 id="payment-heading" className="font-display text-xl">
        {showTabs ? "How to Pay" : `Pay with ${method.label}`}
      </h2>
      {showTabs && <p className="mt-1 text-xs text-muted-foreground">Choose a payment method.</p>}

      <div
        role="radiogroup"
        aria-label="Payment method"
        className={showTabs ? "mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" : "hidden"}
      >
        {ACTIVE_PAYMENT_METHODS.map((m) => {
          const active = m.id === selected;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => select(m.id)}
              className={`flex min-h-12 items-center justify-center gap-2 border px-3 py-3 text-xs uppercase tracking-[0.14em] transition-colors ${
                active
                  ? "border-silver bg-input text-foreground"
                  : "border-border text-muted-foreground hover:border-silver/60 hover:text-foreground"
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <PaymentMethodDetails method={method} amount={amount} />
      </div>
    </section>
  );
}
