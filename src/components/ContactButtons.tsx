import { MessageCircle, Phone } from "lucide-react";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

export function ContactButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a
        href={CONTACT_PAYMENT.signal.href}
        target="_blank"
        rel="noreferrer"
        className="btn-outline-silver flex min-h-14 items-center justify-center gap-3 px-5 py-4 text-xs"
      >
        <MessageCircle aria-hidden="true" size={20} />
        <span>Signal · {CONTACT_PAYMENT.signal.display}</span>
      </a>
      <a
        href={CONTACT_PAYMENT.whatsapp.href}
        target="_blank"
        rel="noreferrer"
        className="btn-steel flex min-h-14 items-center justify-center gap-3 px-5 py-4 text-xs"
      >
        <Phone aria-hidden="true" size={20} />
        <span>WhatsApp · {CONTACT_PAYMENT.whatsapp.display}</span>
      </a>
    </div>
  );
}