# Cold Collar Collection

Create a professional adult lifestyle e-commerce website called "Cold Collar" — a premium BDSM boutique, dark-industrial aesthetic, discreet and disciplined. Build all sections below in a single pass — no placeholders.

VISUAL DESIGN

Deep matte black (#0a0a0a) background, cool steel-grey (#71797E) accents, brushed silver/chrome (#C0C0C0) highlights and CTAs.

Sharp, geometric sans-serif for headings (bold, architectural feel), clean thin sans-serif for body text.

Subtle slow-moving background animation behind the hero section — faint metallic shimmer or drifting smoke, low opacity, non-distracting.

Smooth hover animations on product cards (slight scale + shadow).

Fully responsive: mobile, tablet, desktop. Tailwind CSS.

HEADER / NAV

Logo ("Cold Collar" in brushed silver), nav links (Home, Shop, Categories, About, Contact), search bar, wishlist icon, cart icon with item count badge. Sticky on scroll.

HERO SECTION

Full-width dark banner, tagline "Discipline. Desire. Control."

Two CTAs: "Shop Now" (silver) and "View Collections" (outlined).

AGE VERIFICATION

Modal on first load: "Are you 18 or older?" Yes/No. "No" redirects to Google. "Yes" enters site, doesn't retrigger this session.

LOGIN / ACCOUNT

Email + password signup/login. Guest checkout also available — login only required for wishlist and order history.

Account dashboard includes an "Order History" tab showing past orders and status.

PRODUCT CATEGORIES SECTION

🔰 Beginner Collection · ⚡ Intermediate Collection · 👑 Advanced Collection · 🎭 Specialty Collection

PRODUCT LISTINGS (SHOP SECTION)

Responsive grid (3–4 columns). Each card: product image, name, star rating (4–5 stars), 1-line description, price, "Add to Cart" button (steel-grey), wishlist heart icon. Add an "Intensity Level" filter (Beginner/Intermediate/Advanced) separate from a "Premium Materials" filter.

Products, in this exact order, with descriptions for each product detail page:

Red Leather Origin Wear — $400

Description: "Premium full-grain leather statement piece, hand-finished with reinforced stitching and adjustable straps. A bold centerpiece for any advanced collection."

Suspension Bar Restraint Kit (Aluminum Travel Case) — $399.00

Description: "Heavy-duty aircraft-grade aluminum suspension bar with a full accessory set, packed in a rugged travel case for secure storage and easy transport."

BDSM Bondage Bench with Restraint Straps — $279.00

Description: "Sturdy steel-frame bench with padded support and adjustable restraint straps, built for stability and comfort during extended sessions."

Vibrating Anal Beads with Cuffs — Starter Set — $69.99

Description: "A beginner-friendly introduction to sensation play, pairing graduated vibrating beads with soft adjustable cuffs."

Folding Bondage Bench with Cuff Restraints — $300.00

Description: "Portable, space-saving bench with a secure locking hinge and built-in cuff attachments — sturdy enough for full sessions, compact enough to store away."

20-Piece BDSM Beginner's Kit — $100

Description: "A complete starter collection covering restraints, sensory play, and impact essentials — everything needed for a first exploration into the lifestyle."

Under-Bed 8-Point Restraint System — $99.99

Description: "Discreet strap system that anchors under any mattress, offering full-body restraint without bulky hardware."

Leather Bondage Roll Kit — $54.99

Description: "Compact roll-up leather case housing a curated set of essentials — practical, discreet, and travel-ready."

Collar-to-Cuffs Body Harness Restraint — $59.99

Description: "Adjustable harness connecting collar to wrist cuffs for a secure, full-body restraint silhouette."

25-Piece Deluxe Pleasure & Bondage Kit — $150

Description: "An expanded collection blending restraint gear with pleasure accessories — designed for couples ready to go beyond the basics."

Sex Position Support Sling — $150

Description: "Reinforced support sling designed for comfort and stability across multiple positions, with padded straps for extended wear."

Anal Exploration Set — $52.99

Description: "A graduated set designed for comfortable, progressive exploration — smooth materials and ergonomic shaping throughout."

Electro Play Kit — $150

Description: "Entry-level e-stimulation set with adjustable intensity levels and multiple attachments for a controlled introduction to electro play."

Stainless Steel Lockable Cuffs & Collar Set — $200

Description: "Heavy-gauge stainless steel cuffs and collar with individual locks — a durable, statement-grade restraint set."

Fetish Fantasy Deluxe Shock Therapy Kit — $300

Description: "Full-featured e-stimulation system with digital control unit, multiple attachments, and adjustable pulse settings for advanced play."

Leather Bondage Case & Body Harness Bundle — $500

Description: "A premium bundle pairing a fully stocked leather case with a matching body harness — a complete advanced collection in one purchase."

IMAGE ASSIGNMENT: Product images will be uploaded as a sequential batch — assign the 1st uploaded image to product #1, 2nd to product #2, and so on down the list in exact order.

Each product page includes: material/care spec, sizing/adjustability, intensity-level tag, discreet packaging/billing note, size guide where relevant, and 2-4 related/cross-sell suggestions.

REVIEWS & RATINGS

3-6 realistic placeholder reviews per product, short authentic-sounding comments, star ratings randomly between 4 and 5.

Average rating shown on product cards and detail pages.

Reviewers labeled "Verified Buyer" with first name + last initial only.

WISHLIST

Heart icon on every product card/page, saves to a dedicated Wishlist page (requires login).

"Add to Cart" directly from Wishlist.

SHOPPING CART

Add/remove items, adjust quantities, slide-out cart summary from header icon. Persists across session.

"Checkout" button leads into the checkout flow below.

CHECKOUT / PAYMENT (placeholder flow — 3-step: Shipping → Payment → Confirm)

Payment method: leave as a generic "Payment Details" step with a placeholder note "Payment options coming soon" — do not build BTC, card, or any specific payment integration yet.

Order status: "Order Placed" → "Processing" → "Shipped" — auto-updates and appears in Order History.

FEATURES SECTION

3 trust badges: 🔒 Discreet shipping, ✅ Premium Quality, 🛡️ Secure Checkout

TESTIMONIALS SECTION

3 customer review cards with names, star ratings, short quotes.

NEWSLETTER BANNER

Dark section, silver text: "Join the Inner Circle — Get 15% off your first order." Email input + Subscribe button.

FAQ PAGE

Covers: shipping discretion, returns/refunds (final sale on opened intimate-use items), sizing help, first-time buyer guidance, general safety/consent basics.

LEGAL & PRIVACY

Footer links: Privacy Policy, Terms of Service, Shipping Policy (with country/state restriction disclaimer), Returns/Refund Policy.

Dedicated Data Privacy page: no data sold to third parties, purchase history never shared, billing under discreet generic name.

Discreet billing notice in footer: "All charges appear as CC Lifestyle on your statement."

CUSTOMER SERVICE

Footer + dedicated Contact page — use a simple contact form (name, email, message) as a placeholder. No live channels yet.

GENERAL

Social media icons and copyright text in footer.

No live chat widget, no third-party analytics/trackers.

Build everything above in this single pass — all pages and features functional on first generation.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
