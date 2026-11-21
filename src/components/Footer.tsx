import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { CONTACT_PAYMENT } from "@/config/contact-payment";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <p className="font-display text-lg tracking-[0.2em] text-brushed">COLD COLLAR</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            A premium boutique for disciplined tastes. Considered materials, discreet delivery, no
            compromise on safety.
          </p>
          <div className="mt-5 flex gap-3 text-muted-foreground">
            <a href="https://instagram.com" aria-label="Instagram" className="hover:text-silver">
              <Instagram size={16} />
            </a>
            <a href="https://x.com" aria-label="X" className="hover:text-silver">
              <Twitter size={16} />
            </a>
            <a href="https://youtube.com" aria-label="YouTube" className="hover:text-silver">
              <Youtube size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-silver">Shop</h4>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-silver">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-silver">
                Collections
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-silver">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-silver">
                Order History
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-silver">Support</h4>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li>
              <Link to="/contact" className="hover:text-silver">
                Customer Service
              </Link>
            </li>
            <li>
              <Link to="/how-to-pay" className="hover:text-silver">
                How to Pay
              </Link>
            </li>
            <li>
              <Link to="/special-order" className="hover:text-silver">
                Special Order
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-silver">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="hover:text-silver">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-silver">
                Returns & Refunds
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-silver">Legal</h4>
          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li>
              <Link to="/privacy" className="hover:text-silver">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-silver">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/data-privacy" className="hover:text-silver">
                Data Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[11px] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            All charges appear as{" "}
            <span className="text-silver">{CONTACT_PAYMENT.business.statementName}</span> on your
            statement.
          </p>
          <p>© {new Date().getFullYear()} Cold Collar. Adults 18+ only. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
