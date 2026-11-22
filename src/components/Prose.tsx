import type { ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

export function PageShell({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  /** Shows a "Last updated" line under the title (policy pages). */
  updated?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
      {updated && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Last updated {CONTACT_PAYMENT.business.policiesUpdated}
        </p>
      )}
      <div className="mt-10 space-y-8">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-base uppercase tracking-[0.16em] text-silver">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

/** Inline link styled for policy text. */
export function PolicyLink({
  to,
  children,
}: {
  to: NonNullable<LinkProps["to"]>;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="text-silver hover:underline">
      {children}
    </Link>
  );
}

/** "Contact Us" section with whatever business details are filled in. */
export function PolicyContact({ heading = "Contact Us" }: { heading?: string }) {
  const { legalName, email, address } = CONTACT_PAYMENT.business;
  return (
    <Section heading={heading}>
      <p>
        Questions about this policy, an order or your data? Reach us through the{" "}
        <PolicyLink to="/contact">contact page</PolicyLink>
        {email ? (
          <>
            {" "}
            or by email at{" "}
            <a href={`mailto:${email}`} className="text-silver hover:underline">
              {email}
            </a>
          </>
        ) : null}
        . We reply within 2 business days.
      </p>
      {(legalName || address) && (
        <p>
          {legalName && <span className="block text-silver">{legalName}</span>}
          {address && <span className="block">{address}</span>}
        </p>
      )}
    </Section>
  );
}

/** The registered business name, or "Cold Coller" if it hasn't been filled in. */
export function BusinessName() {
  const { legalName } = CONTACT_PAYMENT.business;
  return <>{legalName ? `${legalName}, trading as Cold Coller` : "Cold Coller"}</>;
}
