import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PolicyContact, PolicyLink, Section } from "@/components/Prose";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Cold Coller" },
      {
        name: "description",
        content:
          "Cold Coller returns: cancel free before dispatch, 30 days on unopened items, final sale on opened intimate-use products, faults always covered, and your legal rights in the UK, EU, US, Canada and Australia.",
      },
      { property: "og:title", content: "Returns & Refunds — Cold Coller" },
      {
        property: "og:description",
        content:
          "30-day returns on unopened items; faults always covered; your local rights explained.",
      },
    ],
  }),
  component: Returns,
});

const sub = "font-display text-sm uppercase tracking-[0.14em] text-foreground";

function Returns() {
  return (
    <PageShell
      title="Returns & Refund Policy"
      intro="Straightforward, with one hygiene exception. Nothing here takes away the rights consumer law gives you where you live. Where your local law gives you more, you get more."
      updated
    >
      <Section heading="Cancelling Before Dispatch">
        <p>
          Changed your mind? Contact us with your order reference before your order ships and we
          will cancel it and refund everything you paid, including shipping.
        </p>
      </Section>

      <Section heading="30-Day Returns">
        <p>
          Unopened items in their original sealed packaging can be returned within 30 days of
          delivery for a full refund of the item price. You don't need to give a reason.
        </p>
      </Section>

      <Section heading="Final Sale on Opened Intimate-Use Items">
        <p>
          For health and hygiene reasons, intimate-use products cannot be returned or exchanged once
          the seal or protective packaging has been opened, whether or not the item has been used.
          This hygiene exception is allowed by consumer law in the UK and EU. It never affects your
          rights if an item is faulty, damaged or not what you ordered.
        </p>
      </Section>

      <Section heading="Faulty, Damaged or Wrong Items">
        <p>
          If an item arrives damaged or isn't what you ordered, please tell us within 14 days of
          delivery with photos so we can claim from the delivery company. We will replace it or
          refund you in full, including opened items, and we pay for it to be sent back.
        </p>
        <p>
          If a fault appears later under normal use, contact us. Faults are covered for at least as
          long as the law where you live requires (see below), and we will repair, replace or refund
          the item.
        </p>
      </Section>

      <Section heading="Lost or Late Parcels">
        <p>
          If your tracking has not updated for 10 business days, or your order has not arrived
          within the times in our <PolicyLink to="/shipping-policy">Shipping Policy</PolicyLink>,
          contact us. We will investigate with the delivery company and resend your order or refund
          you. If your order hasn't arrived within 30 days of the delivery date we gave you, you can
          cancel it for a full refund.
        </p>
      </Section>

      <Section heading="Your Rights Where You Live">
        <div className="space-y-2">
          <p className={sub}>United Kingdom</p>
          <p>
            Under the Consumer Contracts Regulations 2013 you can cancel an online order within 14
            days of receiving it, without giving a reason. Sealed intimate-use items that have been
            unsealed are excluded for hygiene reasons. If you cancel within 14 days we refund the
            item and the standard delivery charge you paid, within 14 days of getting the item back
            (or proof you sent it). You pay the cost of sending it back.
          </p>
          <p>
            Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for
            purpose and as described. If they aren't, you can reject them for a full refund within
            30 days of delivery. After that you can ask for a repair or replacement, and if that
            doesn't work, a refund or price reduction. A fault that shows up within 6 months is
            presumed to have been there at delivery unless we can show otherwise.
          </p>
        </div>

        <div className="space-y-2">
          <p className={sub}>European Union and EEA</p>
          <p>
            Under EU consumer law you have 14 days from delivery to withdraw from an online purchase
            without giving a reason. Sealed goods unsealed after delivery for health or hygiene
            reasons are excluded. If you withdraw, we refund the item and the standard delivery
            charge within 14 days of hearing from you. We may wait until the item is back with us or
            you show proof of sending. You pay the cost of returning it.
          </p>
          <p>
            You also have a legal guarantee of at least 2 years from delivery for goods that are
            faulty or not as described: you can ask for repair or replacement, or a price reduction
            or refund if that isn't possible. Your country may give you longer.
          </p>
          <p>
            To withdraw, send us a clear message (for example through the contact page) with your
            order number, saying you want to cancel.
          </p>
        </div>

        <div className="space-y-2">
          <p className={sub}>United States</p>
          <p>
            US law doesn't give a general right to return online purchases, so our 30-day returns on
            unopened items and our cover for faulty or wrong items are what apply. Some states
            require sellers to clearly show their refund policy before you buy; this page is that
            notice. If your state's consumer protection or warranty law gives you more, you get it.
          </p>
        </div>

        <div className="space-y-2">
          <p className={sub}>Canada</p>
          <p>
            Provincial consumer protection laws (for example in Ontario, Quebec, British Columbia
            and Alberta) give you rights for online purchases, including cancelling for a refund if
            your order isn't delivered within 30 days of the promised date, and protection when
            goods are faulty or not as described. Those rights apply in addition to this policy.
          </p>
        </div>

        <div className="space-y-2">
          <p className={sub}>Australia</p>
          <p>
            Our goods come with guarantees that cannot be excluded under the Australian Consumer
            Law. For a major failure you can choose a replacement or refund. For a minor failure we
            will repair or replace the item, and if we can't within a reasonable time you can ask
            for a refund.
          </p>
        </div>

        <div className="space-y-2">
          <p className={sub}>Everywhere else</p>
          <p>
            This policy applies, together with any rights the consumer law of your country gives you
            that can't be waived.
          </p>
        </div>
      </Section>

      <Section heading="How to Start a Return">
        <p>
          Message us through the <PolicyLink to="/contact">contact page</PolicyLink> with your order
          reference and the item you want to return. We reply with the return address and
          instructions. Please don't send items back without contacting us first, so we can match
          the parcel to your order.
        </p>
        <p>
          You pay the cost of returning unwanted items. We recommend a tracked service, as we can
          only refund returns that reach us (or that you can show you sent). Faulty, damaged or
          wrong items are returned at our cost.
        </p>
      </Section>

      <Section heading="How Refunds Are Paid">
        <p>
          We aim to issue refunds within 5 business days of approving a cancellation or receiving
          your return, and always within 14 days. Card refunds go back to the card you paid with, in
          the same currency you were charged. Your bank may take a further 5 to 10 business days to
          show the money.
        </p>
        <p>
          Bitcoin payments are refunded in Bitcoin to an address you give us, for the value of your
          order in the currency shown at checkout.
        </p>
        <p>
          Original shipping costs are refunded for cancellations before dispatch, faulty, damaged or
          wrong items, and where the law requires it (for example UK and EU cancellations within 14
          days). They aren't refunded for other change-of-mind returns.
        </p>
      </Section>

      <PolicyContact />
    </PageShell>
  );
}
