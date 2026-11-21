import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PolicyContact, PolicyLink, Section } from "@/components/Prose";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Cold Collar" },
      {
        name: "description",
        content:
          "Cold Collar returns: cancel free before dispatch, 30 days on unopened items, final sale on opened intimate-use products, and full cover for faults.",
      },
      { property: "og:title", content: "Returns & Refunds — Cold Collar" },
      {
        property: "og:description",
        content: "30-day returns on unopened items; faults always covered.",
      },
    ],
  }),
  component: Returns,
});

function Returns() {
  return (
    <PageShell
      title="Returns & Refund Policy"
      intro="Straightforward, with one hygiene exception."
      updated
    >
      <Section heading="Cancelling Before Dispatch">
        <p>
          Changed your mind? Contact us with your order reference before your order ships and we
          will cancel it and refund you in full.
        </p>
      </Section>

      <Section heading="30-Day Returns">
        <p>
          Unopened items in their original sealed packaging can be returned within 30 days of
          delivery for a full refund of the item price.
        </p>
      </Section>

      <Section heading="Final Sale on Opened Intimate-Use Items">
        <p>
          For health and hygiene reasons, intimate-use products cannot be returned or exchanged once
          the seal or packaging has been opened, whether or not the item has been used. This does
          not affect your rights if an item is faulty.
        </p>
      </Section>

      <Section heading="Faulty, Damaged or Wrong Items">
        <p>
          If an item arrives damaged, is not what you ordered, or develops a fault under normal use,
          contact us within 14 days of delivery with photos. We will replace it or refund you in
          full, including opened items, and we cover the cost of sending it back.
        </p>
      </Section>

      <Section heading="Lost Parcels">
        <p>
          If your tracking has not updated for 10 business days, or your order has not arrived
          within the times in our <PolicyLink to="/shipping-policy">Shipping Policy</PolicyLink>,
          contact us. We will investigate with the delivery company and resend your order or refund
          you.
        </p>
      </Section>

      <Section heading="How to Start a Return">
        <p>
          Message us through the <PolicyLink to="/contact">contact page</PolicyLink> with your order
          reference and the item you want to return. We reply with the return address and
          instructions. Please do not send items back without contacting us first.
        </p>
        <p>
          You pay the cost of returning unwanted items. We recommend a tracked service, as we cannot
          refund parcels that do not reach us.
        </p>
      </Section>

      <Section heading="How Refunds Are Paid">
        <p>
          We issue refunds within 5 business days of approving a cancellation or receiving your
          return. Card refunds go back to the card you paid with, in the same currency you were
          charged. Your bank may take a further 5 to 10 business days to show the money.
        </p>
        <p>
          Bitcoin payments are refunded in Bitcoin to an address you give us, for the value of your
          order in the currency shown at checkout.
        </p>
        <p>
          Original shipping costs are refunded only for cancellations, faulty items or our mistakes.
        </p>
      </Section>

      <PolicyContact />
    </PageShell>
  );
}
