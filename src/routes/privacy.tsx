import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/Prose";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Cold Collar" },
      {
        name: "description",
        content:
          "How Cold Collar collects, uses and protects your personal information. We never sell customer data.",
      },
      { property: "og:title", content: "Privacy Policy — Cold Collar" },
      { property: "og:description", content: "How Cold Collar handles and protects your information." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PageShell title="Privacy Policy" intro="Last updated: this policy applies to all Cold Collar orders and accounts.">
      <Section heading="What We Collect">
        <p>
          Account email and password (stored encrypted), order contents, shipping address and any
          message you send us. We do not run third-party analytics, advertising pixels or trackers on
          this site.
        </p>
      </Section>
      <Section heading="How We Use It">
        <p>
          Only to fulfil orders, provide support, and maintain your wishlist and order history. We
          send marketing email only if you subscribe, and every message has a one-click unsubscribe.
        </p>
      </Section>
      <Section heading="What We Never Do">
        <p>
          We never sell, rent or trade customer data. We never share purchase history with anyone
          outside the fulfilment of your order.
        </p>
      </Section>
      <Section heading="Retention and Your Rights">
        <p>
          You may request a copy or full deletion of your data at any time through our contact page.
          Order records are retained only as long as required for tax and consumer-law purposes.
        </p>
      </Section>
      <Section heading="Security">
        <p>
          Traffic is encrypted in transit. Account records are protected by per-user access rules so
          only you can read your own wishlist and order history.
        </p>
      </Section>
    </PageShell>
  );
}
