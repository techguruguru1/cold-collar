import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/Prose";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Shipping, Returns, Sizing & Safety | Cold Coller" },
      {
        name: "description",
        content:
          "Answers on discreet shipping, returns on intimate-use items, sizing help, first-time buyer guidance and safety basics.",
      },
      { property: "og:title", content: "Cold Coller FAQ" },
      {
        property: "og:description",
        content: "Discreet shipping, returns, sizing and safety answers from Cold Coller.",
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <PageShell title="Frequently Asked Questions" intro="Everything people ask before their first order.">
      <Section heading="How discreet is shipping?">
        <p>
          Orders ship in plain, unmarked outer packaging. No product names, imagery or category
          wording appear on the label or customs description, and the sender is listed under a
          generic name. Statements read “CC Lifestyle”.
        </p>
      </Section>
      <Section heading="Can I return an item?">
        <p>
          Unopened items in original packaging can be returned within 30 days of delivery for a
          refund to the original payment method. For hygiene and safety reasons, opened
          intimate-use items are final sale and cannot be returned or exchanged. Faulty items are
          always replaced or refunded — see the{" "}
          <Link to="/returns" className="text-silver hover:underline">
            returns policy
          </Link>
          .
        </p>
      </Section>
      <Section heading="How do I choose the right size?">
        <p>
          Every product page lists an adjustment range, and most also carry a size guide. Measure
          with a soft tape at the widest point of the intended wear area and aim to land in the
          middle of the range. Steel is fixed sizing — measure carefully before ordering.
        </p>
      </Section>
      <Section heading="I'm buying for the first time. Where do I start?">
        <p>
          Start in the Beginner Collection. Kits give you the widest sense of what you enjoy for the
          least outlay, and everything in that tier uses forgiving materials and generous
          adjustment. Move up a tier only once you both feel confident.
        </p>
      </Section>
      <Section heading="What safety basics should I know?">
        <p>
          Agree limits and a safe word before every session, and a non-verbal signal if speech may be
          restricted. Keep keys, quick-release buckles and safety shears within arm's reach. Never
          leave a restrained person alone. Check circulation regularly. Do not use electro gear above
          the waist, near the heart, or with a pacemaker or other implanted device.
        </p>
      </Section>
      <Section heading="Do I need an account?">
        <p>
          No. Checkout is available to guests. An account is only needed to save a wishlist and to
          keep order history.
        </p>
      </Section>
    </PageShell>
  );
}
