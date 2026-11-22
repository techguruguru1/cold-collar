import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PolicyContact, PolicyLink, Section } from "@/components/Prose";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy & Restrictions — Cold Coller" },
      {
        name: "description",
        content:
          "Cold Coller shipping times, discreet packaging, tracking, address changes and country restrictions on adult products.",
      },
      { property: "og:title", content: "Shipping Policy — Cold Coller" },
      {
        property: "og:description",
        content: "Discreet packaging, delivery times and shipping restrictions.",
      },
    ],
  }),
  component: ShippingPolicy,
});

function ShippingPolicy() {
  return (
    <PageShell title="Shipping Policy" intro="How, when and where we ship." updated>
      <Section heading="Processing and Delivery">
        <p>
          Orders are prepared within 1 to 2 business days of payment being confirmed. Standard
          delivery then takes 3 to 7 business days within the country of dispatch and 7 to 21
          business days internationally. Special orders take longer; we confirm the timing with you
          before you pay.
        </p>
      </Section>

      <Section heading="Tracking">
        <p>
          We email you a tracking number when your order ships. If you have not received it within 3
          business days of ordering, please check your spam folder or contact us.
        </p>
      </Section>

      <Section heading="Discreet Packaging">
        <p>
          Everything ships in a plain outer box or mailer. No product names, images or descriptions
          appear on the outside, and the sender name is generic. Customs forms use neutral wording
          such as "lifestyle accessories".
        </p>
      </Section>

      <Section heading="Delivery Address">
        <p>
          Please check your address carefully at checkout. Contact us straight away if it is wrong.
          We can change it until the order ships. We are not responsible for parcels sent to an
          incorrect address given at checkout, but we will help you try to recover them.
        </p>
      </Section>

      <Section heading="Country and State Restrictions">
        <p>
          Adult products are restricted or banned in some places. We do not ship to countries where
          importing adult lifestyle goods is against the law, and some US states and local areas
          restrict certain products.
        </p>
        <p>
          Please make sure the items you order can legally be delivered to your address. If customs
          seize or return a parcel because the goods are not allowed in your country, we cannot
          refund the order or the shipping cost.
        </p>
      </Section>

      <Section heading="Duties and Taxes">
        <p>
          International orders may be charged import duty or local sales tax on arrival. These are
          set by your country's authorities, are not included in our prices and are paid by the
          person receiving the parcel.
        </p>
      </Section>

      <Section heading="Late or Lost Orders">
        <p>
          If your order has not arrived within the times above, contact us. Our{" "}
          <PolicyLink to="/returns">Returns &amp; Refund Policy</PolicyLink> explains how we handle
          lost parcels.
        </p>
      </Section>

      <PolicyContact />
    </PageShell>
  );
}
