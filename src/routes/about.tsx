import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/Prose";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Cold Collar — Discreet, Disciplined, Premium" },
      {
        name: "description",
        content:
          "Cold Collar is a premium adult lifestyle boutique built on material quality, safety and absolute discretion.",
      },
      { property: "og:title", content: "About Cold Collar" },
      {
        property: "og:description",
        content: "Why Cold Collar exists: material quality, safety and absolute discretion.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell
      title="About Cold Collar"
      intro="A boutique for people who treat this lifestyle with the same seriousness they bring to anything else they care about."
    >
      <Section heading="Our Standard">
        <p>
          Every piece we stock is chosen on three criteria: material integrity, safe mechanics, and
          finish. Full-grain leather instead of bonded. 316L stainless instead of plated alloy.
          Medical-grade silicone instead of unspecified "body-safe" plastic.
        </p>
      </Section>
      <Section heading="Discretion by Default">
        <p>
          Orders leave in unmarked outer packaging with no product wording on the label. Statements
          read “CC Lifestyle”. Purchase history is never shared or sold — see our{" "}
          <Link to="/data-privacy" className="text-silver hover:underline">
            data privacy page
          </Link>
          .
        </p>
      </Section>
      <Section heading="Safety and Consent">
        <p>
          Nothing here works without informed, enthusiastic, ongoing consent. Agree limits and a safe
          word before you begin, keep keys and safety shears within reach, and never leave a
          restrained partner unattended. Start at the lowest intensity and progress slowly.
        </p>
      </Section>
      <Section heading="Questions">
        <p>
          Our team answers every message.{" "}
          <Link to="/contact" className="text-silver hover:underline">
            Contact us
          </Link>{" "}
          or read the{" "}
          <Link to="/faq" className="text-silver hover:underline">
            FAQ
          </Link>
          .
        </p>
      </Section>
    </PageShell>
  );
}
