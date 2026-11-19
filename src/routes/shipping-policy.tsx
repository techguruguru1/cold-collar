import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/Prose";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy & Restrictions — Cold Collar" },
      {
        name: "description",
        content:
          "Cold Collar shipping times, discreet packaging standards and country and state restrictions on adult products.",
      },
      { property: "og:title", content: "Shipping Policy — Cold Collar" },
      { property: "og:description", content: "Discreet packaging, delivery times and shipping restrictions." },
    ],
  }),
  component: ShippingPolicy,
});

function ShippingPolicy() {
  return (
    <PageShell title="Shipping Policy" intro="How, when and where we ship.">
      <Section heading="Processing and Delivery">
        <p>
          Orders are prepared within 1–2 business days. Standard delivery takes 3–7 business days
          domestically and 7–21 business days internationally. Tracking is emailed on dispatch.
        </p>
      </Section>
      <Section heading="Discreet Packaging">
        <p>
          Everything ships in a plain outer box or mailer. No product names, imagery or category
          descriptions appear on the outside, and the sender name is generic. Customs declarations use
          neutral wording such as “lifestyle accessories”.
        </p>
      </Section>
      <Section heading="Country and State Restrictions">
        <p>
          Adult products are restricted or prohibited in some jurisdictions. We cannot ship to
          countries where the import of adult lifestyle goods is unlawful, and certain US states and
          municipalities apply additional restrictions to specific product categories.
        </p>
        <p>
          It is the buyer's responsibility to confirm that an item may lawfully be imported to their
          delivery address. Where a shipment is seized or refused by customs, we cannot refund the
          order or the shipping cost.
        </p>
      </Section>
      <Section heading="Duties and Taxes">
        <p>
          International orders may attract import duty or local sales tax payable on delivery. These
          charges are set by your local authority and are not included in our prices.
        </p>
      </Section>
    </PageShell>
  );
}
