import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { ShopProvider } from "@/lib/shop";
import { CurrencyProvider, getVisitorCurrency } from "@/lib/currency";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { AgeGate } from "@/components/AgeGate";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-brushed">404</h1>
        <h2 className="mt-4 font-display text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist or has been retired from the collection.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-silver inline-flex px-6 py-3 text-xs">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-silver px-6 py-3 text-xs"
          >
            Try again
          </button>
          <a href="/" className="btn-outline-silver px-6 py-3 text-xs">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cold Coller — Premium BDSM Boutique" },
      {
        name: "description",
        content:
          "Cold Coller is a premium adult lifestyle boutique. Discreet shipping, premium materials, secure checkout.",
      },
      { property: "og:site_name", content: "Cold Coller" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "rating", content: "adult" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Barlow:wght@200;300;400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  // Works out pounds vs dollars once per visit (from a saved choice or the visitor's country).
  loader: () => getVisitorCurrency(),
  staleTime: Infinity,
  shouldReload: false,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { currency } = Route.useLoaderData();
  // The admin area is a separate app: no shop header, footer, cart or age check.
  const isAdmin = useRouterState({
    select: (s) => s.location.pathname === "/admin" || s.location.pathname.startsWith("/admin/"),
  });

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider initial={currency}>
          <Outlet />
          <Toaster theme="dark" position="bottom-right" />
        </CurrencyProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider initial={currency}>
        <ShopProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            <Footer />
          </div>
          <CartDrawer />
          <AgeGate />
          <Toaster theme="dark" position="bottom-right" />
        </ShopProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
