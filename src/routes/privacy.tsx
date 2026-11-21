import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PolicyContact, PolicyLink, Section, BusinessName } from "@/components/Prose";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Cold Collar" },
      {
        name: "description",
        content:
          "What personal information Cold Collar collects, why, who it is shared with, how long it is kept and your rights. We never sell customer data.",
      },
      { property: "og:title", content: "Privacy Policy — Cold Collar" },
      {
        property: "og:description",
        content: "How Cold Collar handles and protects your information.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PageShell
      title="Privacy Policy"
      intro="This policy explains what information we collect when you visit or buy from Cold Collar, how we use it and the choices you have."
      updated
    >
      <Section heading="Who Is Responsible">
        <p>
          <BusinessName /> is responsible for the personal information described here. You can reach
          us using the details at the bottom of this page.
        </p>
      </Section>

      <Section heading="What We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-silver">Orders:</span> your name, delivery address, email address,
            the items you buy, the amount, currency and payment method.
          </li>
          <li>
            <span className="text-silver">Accounts (optional):</span> your email address and a
            password, which is stored in scrambled form so no one can read it. If you sign in with
            Google, we receive your name and email address from Google.
          </li>
          <li>
            <span className="text-silver">Messages:</span> anything you send through the contact or
            special order forms, or by WhatsApp or Signal.
          </li>
          <li>
            <span className="text-silver">Technical information:</span> our hosting provider sees
            your IP address when you visit. We use the country it points to only to show prices in
            your currency, and we do not store it.
          </li>
        </ul>
        <p>
          We never receive your full card details. They are entered directly on our payment
          provider's secure page. Bitcoin payments are recorded on the public Bitcoin network, which
          we do not control.
        </p>
      </Section>

      <Section heading="How We Use It">
        <p>
          We use your information only to process and deliver orders, handle refunds and returns,
          answer your messages, run your account, wishlist and order history, and prevent fraud. We
          also keep records the law requires, such as for tax. We use it because we need it to
          fulfil your order, because the law requires it, or, for fraud prevention, because we have
          a legitimate interest in protecting our customers and business.
        </p>
        <p>
          We do not send marketing emails unless you ask to receive them, and you can unsubscribe at
          any time.
        </p>
      </Section>

      <Section heading="Who We Share It With">
        <p>
          We never sell, rent or trade your information. We share only what each of these service
          providers needs to do its job for us:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Our card payment provider, to take payments and prevent fraud.</li>
          <li>Supabase, which stores accounts, wishlists and orders.</li>
          <li>Vercel, which hosts this website.</li>
          <li>Formspree, which delivers messages sent through our forms.</li>
          <li>Google, only if you choose to sign in with Google.</li>
          <li>Delivery companies, which receive your name and delivery address.</li>
        </ul>
        <p>
          We may also share information if the law requires it, for example with tax authorities or
          the police under a valid legal request.
        </p>
      </Section>

      <Section heading="Cookies and Storage">
        <p>
          We use only what the site needs to work. There are no advertising cookies and no
          third-party analytics or tracking.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>A cookie that remembers your chosen currency (kept for one year).</li>
          <li>Your basket, saved in your browser so it is still there when you come back.</li>
          <li>Your login session, if you sign in.</li>
          <li>Your age confirmation, kept only until you close the browser tab.</li>
        </ul>
      </Section>

      <Section heading="How Long We Keep It">
        <p>
          We keep order records for as long as tax and consumer law require, usually up to 7 years.
          Account information is kept until you delete your account. Messages are kept for up to 2
          years unless they relate to an order.
        </p>
      </Section>

      <Section heading="Your Rights">
        <p>
          You can ask us to give you a copy of your information, correct it, delete it, or stop
          using it for a particular purpose. Contact us and we will respond within 30 days. We may
          need to keep some order records where the law requires it.
        </p>
        <p>
          If you live in the UK or the European Union you can also complain to your local data
          protection authority. California residents have the right to know what we collect and to
          ask for it to be deleted, and we do not sell or share personal information for
          advertising.
        </p>
      </Section>

      <Section heading="Where It Is Stored">
        <p>
          Our service providers may store information in the United States, the European Union or
          other countries. They are required to protect it to the standard set out in this policy.
        </p>
      </Section>

      <Section heading="Security">
        <p>
          All traffic to this site is encrypted. Account records are protected so that only you can
          see your own wishlist and order history.
        </p>
      </Section>

      <Section heading="Adults Only">
        <p>
          This site is not for anyone under 18. We do not knowingly collect information from minors,
          and we delete it if we find out we have.
        </p>
      </Section>

      <Section heading="Changes to This Policy">
        <p>
          If we change this policy we will update the date at the top. See also our{" "}
          <PolicyLink to="/data-privacy">Data Privacy</PolicyLink> commitments.
        </p>
      </Section>

      <PolicyContact />
    </PageShell>
  );
}
