import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/Prose";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

export const Route = createFileRoute("/data-privacy")({
  head: () => ({
    meta: [
      { title: "Data Privacy & Discreet Billing — Cold Coller" },
      {
        name: "description",
        content:
          "No data sold to third parties, purchase history never shared, and billing under a discreet generic name.",
      },
      { property: "og:title", content: "Data Privacy — Cold Coller" },
      {
        property: "og:description",
        content: "No data sold, purchase history never shared, discreet billing as CC Lifestyle.",
      },
    ],
  }),
  component: DataPrivacy,
});

function DataPrivacy() {
  return (
    <PageShell
      title="Data Privacy"
      intro="Privacy is a product feature here, not a legal afterthought. Three commitments, in plain language."
    >
      <Section heading="1. We Never Sell Your Data">
        <p>
          No customer information is sold, rented, licensed or traded to third parties — not email
          addresses, not browsing behaviour, not order contents. There are no advertising pixels or
          third-party analytics scripts running on this site.
        </p>
      </Section>
      <Section heading="2. Purchase History Is Never Shared">
        <p>
          What you buy stays between you and our fulfilment team. We do not disclose purchase
          history to marketing partners, data brokers, insurers or anyone else, and we do not use it
          to build profiles that leave our systems.
        </p>
      </Section>
      <Section heading="3. Discreet Billing">
        <p>
          Charges appear on your card or bank statement as{" "}
          <span className="text-silver">{CONTACT_PAYMENT.business.statementName}</span>. Nothing on
          the statement identifies the nature of the products or the boutique.
        </p>
      </Section>
      <Section heading="Your Controls">
        <p>
          You can delete your account and all associated wishlist data at any time by contacting us.
          Order records that we must retain for tax purposes are stripped of marketing use.
        </p>
      </Section>
    </PageShell>
  );
}
