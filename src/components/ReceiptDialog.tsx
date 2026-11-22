import { useState } from "react";
import { toast } from "sonner";
import { FileUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { startReceiptUpload, submitReceipt } from "@/lib/orders.functions";
import { RECEIPT_MAX_BYTES, RECEIPT_TYPES, orderRef } from "@/lib/order-status";
import { submitToFormspree } from "@/lib/formspree";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

/** Pop-up where the customer uploads a screenshot or PDF of their payment. */
export function ReceiptDialog({
  open,
  onOpenChange,
  orderId,
  token,
  amount,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  token: string;
  amount: string;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [txid, setTxid] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const pick = (f: File | null) => {
    setProblem(null);
    if (!f) return setFile(null);
    if (!(RECEIPT_TYPES as readonly string[]).includes(f.type)) {
      setFile(null);
      return setProblem("Please choose a photo (JPG, PNG, WEBP, HEIC) or a PDF.");
    }
    if (f.size > RECEIPT_MAX_BYTES) {
      setFile(null);
      return setProblem("That file is over 10 MB. Please choose a smaller one.");
    }
    setFile(f);
  };

  const send = async () => {
    if (!file) return setProblem("Please choose your receipt first.");
    setBusy(true);
    setProblem(null);
    try {
      const { path, uploadToken } = await startReceiptUpload({
        data: {
          id: orderId,
          token,
          contentType: file.type as (typeof RECEIPT_TYPES)[number],
          size: file.size,
        },
      });
      const { error } = await supabase.storage
        .from("receipts")
        .uploadToSignedUrl(path, uploadToken, file, { contentType: file.type });
      if (error) throw new Error("Upload failed. Please check your connection and try again.");
      await submitReceipt({
        data: { id: orderId, token, path, ...(txid.trim() ? { transactionId: txid.trim() } : {}) },
      });
      // Let the shop know there's a payment to check (doesn't block the customer if it fails).
      void submitToFormspree(CONTACT_PAYMENT.formspree.contactFormId, {
        subject: `Payment to review: order #${orderRef(orderId)}`,
        message: `A customer uploaded a payment receipt for order #${orderRef(orderId)} (${amount}). Review it at ${window.location.origin}/admin`,
        transaction_id: txid.trim(),
      }).catch(() => {});
      toast("Receipt received. Your payment is now under review.");
      setFile(null);
      setTxid("");
      onDone();
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display">Upload Your Receipt</DialogTitle>
          <DialogDescription>
            Add a screenshot or PDF from your wallet showing the payment of {amount}. We check it
            and confirm your order.
          </DialogDescription>
        </DialogHeader>

        <label
          htmlFor="receipt"
          className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-border bg-input px-4 py-8 text-center text-xs text-muted-foreground hover:border-silver"
        >
          <FileUp size={22} className="text-silver" />
          {file ? (
            <span className="break-all text-silver">{file.name}</span>
          ) : (
            <span>Tap to choose a photo or PDF (max 10 MB)</span>
          )}
          <input
            id="receipt"
            type="file"
            accept={RECEIPT_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />
        </label>

        <div>
          <label htmlFor="txid" className="text-[11px] uppercase tracking-[0.2em] text-silver">
            Transaction ID (optional)
          </label>
          <input
            id="txid"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            placeholder="Paste it from your wallet if you have it"
            className="mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver"
          />
        </div>

        {problem && <p className="text-xs text-red-400">{problem}</p>}

        <button
          type="button"
          disabled={busy || !file}
          onClick={() => void send()}
          className="btn-silver w-full py-3 text-xs disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Submit Receipt"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
