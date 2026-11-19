import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/Prose";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Cold Collar" },
      {
        name: "description",
        content:
          "The terms governing use of the Cold Collar boutique, including age requirements, orders and safe use of products.",
      },
      { property: "og:title", content: "Terms of Service — Cold Collar" },
      { property: "og:description", content: "Terms governing use of the Cold Collar boutique." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <PageShell title="Terms of Service" intro="By using this site you agree to the terms below.">
      <Section heading="Age Requirement">
        <p>
          This site is for adults aged 18 or over (21 where required locally). By entering you confirm
          you meet that requirement. We reserve the right to cancel any order where age eligibility
          cannot be reasonably assured.
        </p>
      </Section>
      <Section heading="Orders and Pricing">
        <p>
          All prices are in US dollars. An order is accepted when we confirm dispatch. If an item is
          mispriced or unavailable we will contact you and refund in full.
        </p>
      </Section>
      <Section heading="Safe Use and Liability">
        <p>
          Products are sold for consensual adult use between informed participants. You are
          responsible for following all supplied safety guidance. Cold Collar is not liable for
          injury or loss arising from misuse, modification, or use contrary to the instructions and
          warnings supplied.
        </p>
      </Section>
      <Section heading="Accounts">
        <p>
          You are responsible for keeping your login credentials secure. Accounts may be suspended
          for fraudulent activity or abuse of staff.
        </p>
      </Section>
      <Section heading="Intellectual Property">
        <p>
          All site content, imagery and copy are owned by Cold Collar and may not be reproduced
          without written permission.
        </p>
      </Section>
    </PageShell>
  );
}
