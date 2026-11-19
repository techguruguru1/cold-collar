import { createFileRoute } from "@tanstack/react-router";
import { PaymentMethods } from "@/components/PaymentMethods";
import { ContactButtons } from "@/components/ContactButtons";

export const Route = createFileRoute("/how-to-pay")({
  head: () => ({
    meta: [
      { title: "How to Pay — Cold Collar" },
      { name: "description", content: "Card and Bitcoin payment instructions and customer service contacts for Cold Collar orders." },
      { property: "og:title", content: "How to Pay — Cold Collar" },
      { property: "og:description", content: "Pay for a Cold Collar order by card or Bitcoin and send transaction details securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowToPay,
});

function HowToPay() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">How to Pay</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Pay by credit or debit card at checkout through Stripe's secure payment page. We never see your card
        details. You can also pay with Bitcoin using the details below.
      </p>
      <div className="card-surface mt-10 p-6 md:p-8">
        <PaymentMethods />
        <div className="mt-8 border-t border-border pt-8">
          <h2 className="font-display text-lg">Send Your Payment Details</h2>
          <p className="mt-2 text-sm text-muted-foreground">Contact customer service after sending your payment.</p>
          <div className="mt-5"><ContactButtons /></div>
        </div>
      </div>
    </div>
  );
}