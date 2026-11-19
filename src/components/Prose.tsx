import type { ReactNode } from "react";

export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
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
