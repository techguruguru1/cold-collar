import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageUp, Loader2, Pencil } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { adminAuth, adminToken } from "@/lib/admin-auth";
import { adminSavePaymentSettings, adminStartQrUpload } from "@/lib/admin.functions";
import { getPaymentSettings, isBitcoinAddress, type PaymentSettings } from "@/lib/payment-settings";

const QR_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type QrType = (typeof QR_TYPES)[number];

/** Admin: view and edit the Bitcoin address and QR image customers pay with. */
export function BitcoinSettings() {
  const [current, setCurrent] = useState<PaymentSettings | null>(null);
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState("");
  const [qrMode, setQrMode] = useState<"keep" | "auto" | "upload">("keep");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCurrent(await getPaymentSettings());
    } catch {
      toast("Couldn't load the payment settings.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const startEdit = () => {
    if (!current) return;
    setAddress(current.bitcoinAddress);
    setQrMode("keep");
    setFile(null);
    setProblem(null);
    setEditing(true);
  };

  const pickFile = (f: File | null) => {
    setProblem(null);
    if (!f) return;
    if (!(QR_TYPES as readonly string[]).includes(f.type)) {
      setProblem("Please choose a PNG, JPG or WEBP image.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setProblem("That image is over 5 MB.");
      return;
    }
    setFile(f);
    setQrMode("upload");
  };

  const save = async () => {
    const next = address.trim();
    if (!isBitcoinAddress(next)) {
      setProblem("That doesn't look like a Bitcoin address. Check it and try again.");
      return;
    }
    if (
      current &&
      next !== current.bitcoinAddress &&
      !window.confirm(
        `Change the Bitcoin address customers pay to?\n\nNew address:\n${next}\n\nBitcoin sent to a wrong address can't be recovered.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const accessToken = await adminToken();
      let qr: { mode: "keep" } | { mode: "auto" } | { mode: "upload"; path: string } = {
        mode: "keep",
      };
      if (qrMode === "auto") qr = { mode: "auto" };
      if (qrMode === "upload" && file) {
        const { path, uploadToken } = await adminStartQrUpload({
          data: { accessToken, contentType: file.type as QrType, size: file.size },
        });
        const { error } = await adminAuth()
          .storage.from("payment-assets")
          .uploadToSignedUrl(path, uploadToken, file, { contentType: file.type });
        if (error) throw new Error("The QR image couldn't be uploaded. Please try again.");
        qr = { mode: "upload", path };
      }
      await adminSavePaymentSettings({ data: { accessToken, bitcoinAddress: next, qr } });
      toast("Bitcoin payment details saved. Customers see them straight away.");
      setEditing(false);
      setFile(null);
      await load();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  };

  if (!current) {
    return (
      <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Loading payment settings…
      </p>
    );
  }

  const shownAddress = editing ? address.trim() : current.bitcoinAddress;
  const shownImage = !editing
    ? current.bitcoinQrUrl
    : qrMode === "upload"
      ? preview
      : qrMode === "auto"
        ? null
        : current.bitcoinQrUrl;

  return (
    <section className="card-surface mt-8 grid gap-8 p-6 md:grid-cols-[1fr_auto]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg">Bitcoin payment</h2>
          {!editing && (
            <button
              type="button"
              onClick={startEdit}
              className="btn-outline-silver inline-flex items-center gap-2 px-4 py-2 text-[11px]"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>

        {!editing ? (
          <>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-silver">Bitcoin address</p>
              <code className="mt-2 block break-all border border-border bg-input p-4 font-mono text-sm">
                {current.bitcoinAddress}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              QR code:{" "}
              {current.bitcoinQrUrl ? "your uploaded image" : "made automatically from the address"}
              . Customers see these at checkout and on their order page.
            </p>
          </>
        ) : (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="btc-address"
                className="text-[11px] uppercase tracking-[0.2em] text-silver"
              >
                Bitcoin address
              </label>
              <input
                id="btc-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                className="mt-2 w-full border border-border bg-input px-4 py-3 font-mono text-sm outline-none focus:border-silver"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-silver">QR code</p>
              <label
                htmlFor="btc-qr"
                className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border bg-input px-4 py-5 text-xs text-muted-foreground hover:border-silver"
              >
                <ImageUp size={18} className="shrink-0 text-silver" />
                {file ? (
                  <span className="break-all text-silver">{file.name}</span>
                ) : (
                  <span>Upload a QR image (PNG, JPG or WEBP, max 5 MB)</span>
                )}
                <input
                  id="btc-qr"
                  type="file"
                  accept={QR_TYPES.join(",")}
                  className="sr-only"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setQrMode("auto");
                }}
                className={`text-xs underline ${qrMode === "auto" ? "text-silver" : "text-muted-foreground"}`}
              >
                Or make the QR code automatically from the address
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Double-check the address. Customers see the new details straight away, and Bitcoin
              sent to a wrong address can't be recovered.
            </p>
            {problem && <p className="text-xs text-red-400">{problem}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void save()}
                className="btn-silver px-6 py-2.5 text-xs disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(false)}
                className="btn-outline-silver px-6 py-2.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto md:mx-0">
        <p className="mb-2 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {editing ? "Preview" : "Customers see"}
        </p>
        <div className={`w-48 max-w-full bg-white ${shownImage ? "p-2" : "p-3"}`}>
          {shownImage ? (
            <img
              src={shownImage}
              alt="Bitcoin QR code"
              className="block aspect-square h-auto w-full object-contain"
            />
          ) : isBitcoinAddress(shownAddress) ? (
            <QRCodeSVG
              value={`bitcoin:${shownAddress}`}
              size={168}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
              className="block h-auto w-full"
            />
          ) : (
            <p className="flex aspect-square w-full items-center justify-center p-4 text-center text-xs text-black">
              Enter a valid address to preview
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
