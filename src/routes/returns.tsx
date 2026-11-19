import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/Prose";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Cold Collar" },
      {
        name: "description",
        content:
          "Cold Collar returns: 30 days on unopened items, final sale on opened intimate-use products, and full cover for faults.",
      },
      { property: "og:title", content: "Returns & Refunds — Cold Collar" },
      { property: "og:description", content: "30-day returns on unopened items; faults always covered." },
    ],
  }),
  component: Returns,
});

function Returns() {
  return (
    <PageShell title="Returns & Refund Policy" intro="Straightforward, with one hygiene exception.">
      <Section heading="30-Day Window">
        <p>
          Unopened items in their original, sealed packaging can be returned within 30 days of
          delivery. Refunds are issued to the original payment method within 5 business days of the
          return arriving.
        </p>
      </Section>
      <Section heading="Final Sale on Opened Intimate-Use Items">
        <p>
          For health and hygiene reasons, intimate-use products cannot be returned or exchanged once
          the seal or packaging has been opened. This applies regardless of whether the item has been
          used.
        </p>
      </Section>
      <Section heading="Faulty or Damaged Items">
        <p>
          If an item arrives damaged or develops a fault under normal use, contact us within 14 days
          with photographs and we will replace it or refund you in full — including opened items.
        </p>
      </Section>
      <Section heading="How to Start a Return">
        <p>
          Message us through the{" "}
          <Link to="/contact" className="text-silver hover:underline">
            contact page
          </Link>{" "}
          with your order reference. We reply with a return address and instructions. Return shipping
          is paid by the customer except for faulty or incorrectly sent goods.
        </p>
      </Section>
    </PageShell>
  );
}
