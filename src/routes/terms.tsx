import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PolicyContact, PolicyLink, Section, BusinessName } from "@/components/Prose";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Cold Collar" },
      {
        name: "description",
        content:
          "The terms for buying from Cold Collar: age requirement, orders, prices and currency, payment, billing, cancellations, refunds and safe use.",
      },
      { property: "og:title", content: "Terms of Service — Cold Collar" },
      { property: "og:description", content: "The terms for buying from Cold Collar." },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { statementName, governingLaw } = CONTACT_PAYMENT.business;
  return (
    <PageShell
      title="Terms of Service"
      intro="Please read these terms before placing an order. By using this site or placing an order you agree to them."
      updated
    >
      <Section heading="Who We Are">
        <p>
          This website is operated by <BusinessName /> ("we", "us"). Cold Collar sells adult
          lifestyle products to adults only.
        </p>
      </Section>

      <Section heading="Age Requirement">
        <p>
          You must be 18 or older (or the age of majority where you live, if higher) to use this
          site or buy from us. By entering the site and placing an order you confirm that you meet
          this requirement. We may cancel and refund any order if we have reason to believe the
          buyer is under age.
        </p>
      </Section>

      <Section heading="Orders">
        <p>
          Placing an order is an offer to buy. We accept it when we confirm your payment and prepare
          your order for dispatch. We may decline or cancel an order, for example if an item is out
          of stock, was listed at the wrong price, or the order looks fraudulent. If we cancel, we
          refund everything you paid.
        </p>
      </Section>

      <Section heading="Prices and Currency">
        <p>
          Our prices are set in US dollars. Visitors in the UK, the eurozone and Canada see prices
          converted into pounds, euros or Canadian dollars, and you can change the currency with the
          selector at the top of the page. You are charged the amount and currency shown at
          checkout. Your bank may add its own fees for foreign-currency payments.
        </p>
        <p>
          Prices include the products only. Any import duty or local taxes for international orders
          are explained in our <PolicyLink to="/shipping-policy">Shipping Policy</PolicyLink>.
        </p>
      </Section>

      <Section heading="Payment">
        <p>
          Card payments are handled by our secure payment provider on its own payment page. We never
          see or store your full card details.
        </p>
        <p>
          If you pay with Bitcoin, send the exact amount shown at checkout to the address given.
          Your order is processed once the payment is confirmed on the network. You are responsible
          for any network fees, and payments sent to the wrong address cannot be recovered. See{" "}
          <PolicyLink to="/how-to-pay">How to Pay</PolicyLink> for details.
        </p>
      </Section>

      <Section heading="Billing Name">
        <p>
          For your privacy, card charges appear on your statement as{" "}
          <span className="text-silver">{statementName}</span>. Nothing on the statement describes
          the products you bought.
        </p>
      </Section>

      <Section heading="Cancellations">
        <p>
          You can cancel an order free of charge until it has been dispatched. Contact us as soon as
          possible with your order reference and we will refund you in full. Once an order has
          shipped, our <PolicyLink to="/returns">Returns &amp; Refund Policy</PolicyLink> applies.
        </p>
      </Section>

      <Section heading="Delivery, Returns and Refunds">
        <p>
          Delivery times, packaging and shipping restrictions are set out in our{" "}
          <PolicyLink to="/shipping-policy">Shipping Policy</PolicyLink>. Returns, refunds and
          faulty items are covered by our{" "}
          <PolicyLink to="/returns">Returns &amp; Refund Policy</PolicyLink>. Nothing in these terms
          affects your legal rights as a consumer.
        </p>
      </Section>

      <Section heading="Payment Disputes">
        <p>
          If something is wrong with your order, please contact us first. We resolve most problems
          within 2 business days and can usually refund faster than a bank dispute. If you open a
          chargeback without contacting us, we will provide the bank with our order and delivery
          records. Accounts linked to fraudulent chargebacks may be closed.
        </p>
      </Section>

      <Section heading="Safe Use">
        <p>
          Products are sold for consensual use between informed adults. Read and follow all safety
          guidance supplied with each item. Do not modify products or use them other than as
          intended.
        </p>
      </Section>

      <Section heading="Our Liability">
        <p>
          We are not liable for injury, loss or damage caused by misuse, modification or use against
          the instructions and warnings supplied. To the extent the law allows, our total liability
          for any order is limited to the amount you paid for it. We do not exclude liability that
          cannot be excluded by law, such as for death or personal injury caused by our negligence.
        </p>
      </Section>

      <Section heading="Accounts">
        <p>
          An account is optional and only used for your wishlist and order history. Keep your login
          details secure. We may suspend accounts used for fraud or to abuse our staff.
        </p>
      </Section>

      <Section heading="Content">
        <p>
          The text, images and design of this site belong to Cold Collar or its suppliers and may
          not be copied without written permission.
        </p>
      </Section>

      <Section heading="Governing Law">
        <p>
          These terms are governed by the laws of{" "}
          {governingLaw || "the country where Cold Collar is registered"}. If you are a consumer,
          you also keep any protection given to you by the laws of the country where you live.
        </p>
      </Section>

      <Section heading="Changes to These Terms">
        <p>
          We may update these terms from time to time. The version shown when you place an order
          applies to that order. The date at the top shows when they were last changed.
        </p>
      </Section>

      <PolicyContact />
    </PageShell>
  );
}
