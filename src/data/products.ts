import p1 from "@/assets/product-01.jpg";
import p2 from "@/assets/product-02.jpg";
import p3 from "@/assets/product-03.webp";
import p4 from "@/assets/product-04.jpg";
import p5 from "@/assets/product-05.webp";
import p6 from "@/assets/product-06.webp";
import p7 from "@/assets/product-07.webp";
import p8 from "@/assets/product-08.webp";
import p9 from "@/assets/product-09.webp";
import p10 from "@/assets/product-10.webp";
import p11 from "@/assets/product-11.webp";
import p12 from "@/assets/product-12.jpg";
import p13 from "@/assets/product-13.jpg";
import p14 from "@/assets/product-14.jpg";
import p15 from "@/assets/product-15.jpg";
import p16 from "@/assets/product-16.jpg";

export type Intensity = "Beginner" | "Intermediate" | "Advanced";
export type Collection = "Beginner" | "Intermediate" | "Advanced" | "Specialty";

export type Review = {
  name: string;
  rating: number;
  comment: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  short: string;
  description: string;
  intensity: Intensity;
  collection: Collection;
  materials: string[];
  spec: string;
  care: string;
  sizing: string;
  sizeGuide?: string;
  related: string[];
};

export const COLLECTIONS: { key: Collection; icon: string; blurb: string }[] = [
  { key: "Beginner", icon: "🔰", blurb: "Soft entry points. Gentle materials, forgiving adjustment." },
  { key: "Intermediate", icon: "⚡", blurb: "Structured gear for those who already know the ropes." },
  { key: "Advanced", icon: "👑", blurb: "Statement-grade steel and leather for seasoned collections." },
  { key: "Specialty", icon: "🎭", blurb: "Electro, suspension and support — precision instruments." },
];

export const MATERIALS = [
  "Full-Grain Leather",
  "Stainless Steel",
  "Aircraft Aluminum",
  "Medical Silicone",
  "Reinforced Nylon",
];

export const products: Product[] = [
  {
    id: "red-leather-origin-wear",
    name: "Red Leather Origin Wear",
    price: 400,
    image: p1,
    short: "Hand-finished red full-grain leather statement piece.",
    description:
      "Premium full-grain leather statement piece, hand-finished with reinforced stitching and adjustable straps. A bold centerpiece for any advanced collection.",
    intensity: "Advanced",
    collection: "Advanced",
    materials: ["Full-Grain Leather", "Stainless Steel"],
    spec: "Full-grain vegetable-tanned leather, 3.5mm thickness, nickel-free stainless hardware, saddle-stitched edges.",
    care: "Wipe with a dry cloth after use. Condition with neutral leather balm every 3 months. Never machine wash or submerge.",
    sizing: "Adjustable across 5 buckle positions; fits 26–46 in / 66–117 cm.",
    sizeGuide:
      "Measure at the widest point of the intended wear area and choose the middle buckle position as your starting point.",
    related: ["stainless-steel-cuffs-collar", "leather-case-harness-bundle", "collar-to-cuffs-harness"],
  },
  {
    id: "suspension-bar-kit",
    name: "Suspension Bar Restraint Kit (Aluminum Travel Case)",
    price: 399,
    image: p2,
    short: "Aircraft-grade bar with full accessory set and travel case.",
    description:
      "Heavy-duty aircraft-grade aluminum suspension bar with a full accessory set, packed in a rugged travel case for secure storage and easy transport.",
    intensity: "Advanced",
    collection: "Specialty",
    materials: ["Aircraft Aluminum", "Reinforced Nylon"],
    spec: "6061-T6 aluminum bar, 32mm diameter, load-rated hardware, foam-lined lockable case.",
    care: "Wipe hardware dry after each use. Inspect all clips and straps before every session.",
    sizing: "Bar adjusts 24–36 in / 61–91 cm. Cuff straps fit 5–11 in / 13–28 cm circumference.",
    sizeGuide: "Set the bar to shoulder width for stability; widen one notch at a time.",
    related: ["support-sling", "bondage-bench", "stainless-steel-cuffs-collar"],
  },
  {
    id: "bondage-bench",
    name: "BDSM Bondage Bench with Restraint Straps",
    price: 279,
    image: p3,
    short: "Steel-frame bench with padded support and adjustable straps.",
    description:
      "Sturdy steel-frame bench with padded support and adjustable restraint straps, built for stability and comfort during extended sessions.",
    intensity: "Intermediate",
    collection: "Intermediate",
    materials: ["Stainless Steel", "Reinforced Nylon"],
    spec: "Powder-coated steel frame, high-density foam padding, wipe-clean PU top, 300 lb / 136 kg capacity.",
    care: "Surface-clean with mild soap and water. Retighten frame bolts monthly.",
    sizing: "48 x 20 x 24 in / 122 x 51 x 61 cm. Straps adjust from 8–40 in / 20–102 cm.",
    related: ["folding-bondage-bench", "support-sling", "suspension-bar-kit"],
  },
  {
    id: "vibrating-beads-cuffs-set",
    name: "Vibrating Anal Beads with Cuffs — Starter Set",
    price: 69.99,
    image: p4,
    short: "Graduated vibrating beads paired with soft adjustable cuffs.",
    description:
      "A beginner-friendly introduction to sensation play, pairing graduated vibrating beads with soft adjustable cuffs.",
    intensity: "Beginner",
    collection: "Beginner",
    materials: ["Medical Silicone", "Reinforced Nylon"],
    spec: "Body-safe medical-grade silicone, USB rechargeable, 10 vibration patterns, IPX7 splash rated.",
    care: "Wash with warm water and toy cleaner before and after use. Use water-based lubricant only.",
    sizing: "Graduated 0.8–1.4 in / 20–35 mm. Cuffs adjust 5–9 in / 13–23 cm.",
    sizeGuide: "Start at the smallest bead and progress only when fully comfortable.",
    related: ["anal-exploration-set", "beginner-kit-20", "under-bed-restraint-system"],
  },
  {
    id: "folding-bondage-bench",
    name: "Folding Bondage Bench with Cuff Restraints",
    price: 300,
    image: p5,
    short: "Portable bench with locking hinge and built-in cuffs.",
    description:
      "Portable, space-saving bench with a secure locking hinge and built-in cuff attachments — sturdy enough for full sessions, compact enough to store away.",
    intensity: "Intermediate",
    collection: "Intermediate",
    materials: ["Stainless Steel", "Reinforced Nylon"],
    spec: "Steel folding frame with dual safety latches, padded PU top, folds to 4 in / 10 cm depth.",
    care: "Wipe clean. Confirm both latches are locked before every use.",
    sizing: "44 x 18 x 22 in / 112 x 46 x 56 cm open. Cuffs adjust 5–11 in / 13–28 cm.",
    related: ["bondage-bench", "support-sling", "collar-to-cuffs-harness"],
  },
  {
    id: "beginner-kit-20",
    name: "20-Piece BDSM Beginner's Kit",
    price: 100,
    image: p6,
    short: "Complete starter collection for a first exploration.",
    description:
      "A complete starter collection covering restraints, sensory play, and impact essentials — everything needed for a first exploration into the lifestyle.",
    intensity: "Beginner",
    collection: "Beginner",
    materials: ["Full-Grain Leather", "Reinforced Nylon"],
    spec: "20 pieces: collar, cuffs, blindfold, rope, clips, feather tickler and more. Silver-tone hardware.",
    care: "Spot clean leather with a dry cloth; hand wash fabric items cold and air dry.",
    sizing: "Collar 12–18 in / 30–46 cm. Cuffs 5–10 in / 13–25 cm. Rope 32 ft / 10 m.",
    sizeGuide: "One size adjustable — measure neck and wrists to confirm you fall inside the ranges above.",
    related: ["deluxe-kit-25", "under-bed-restraint-system", "vibrating-beads-cuffs-set"],
  },
  {
    id: "under-bed-restraint-system",
    name: "Under-Bed 8-Point Restraint System",
    price: 99.99,
    image: p7,
    short: "Discreet strap system that anchors under any mattress.",
    description:
      "Discreet strap system that anchors under any mattress, offering full-body restraint without bulky hardware.",
    intensity: "Beginner",
    collection: "Beginner",
    materials: ["Reinforced Nylon"],
    spec: "Heavy webbing with 8 anchor points, quick-release buckles, packs into an included pouch.",
    care: "Hand wash cold, hang dry. Do not bleach.",
    sizing: "Fits twin through king mattresses. Cuffs adjust 5–12 in / 13–30 cm.",
    related: ["beginner-kit-20", "collar-to-cuffs-harness", "leather-roll-kit"],
  },
  {
    id: "leather-roll-kit",
    name: "Leather Bondage Roll Kit",
    price: 54.99,
    image: p8,
    short: "Roll-up leather case with a curated set of essentials.",
    description:
      "Compact roll-up leather case housing a curated set of essentials — practical, discreet, and travel-ready.",
    intensity: "Intermediate",
    collection: "Intermediate",
    materials: ["Full-Grain Leather", "Stainless Steel"],
    spec: "Leather roll with elastic retention loops, tie closure, stainless accessories included.",
    care: "Keep dry. Condition leather twice a year. Store rolled, not folded.",
    sizing: "Roll measures 12 x 9 in / 30 x 23 cm closed.",
    related: ["leather-case-harness-bundle", "beginner-kit-20", "deluxe-kit-25"],
  },
  {
    id: "collar-to-cuffs-harness",
    name: "Collar-to-Cuffs Body Harness Restraint",
    price: 59.99,
    image: p9,
    short: "Adjustable harness linking collar to wrist cuffs.",
    description:
      "Adjustable harness connecting collar to wrist cuffs for a secure, full-body restraint silhouette.",
    intensity: "Intermediate",
    collection: "Intermediate",
    materials: ["Full-Grain Leather", "Stainless Steel"],
    spec: "Padded leather collar, welded steel O-rings, adjustable connector straps.",
    care: "Wipe with a dry cloth. Condition leather every 3 months.",
    sizing: "Collar 13–19 in / 33–48 cm. Cuffs 5–10 in / 13–25 cm. Connector 10–22 in / 25–56 cm.",
    sizeGuide: "Two fingers should slide comfortably under the collar at the chosen setting.",
    related: ["red-leather-origin-wear", "stainless-steel-cuffs-collar", "under-bed-restraint-system"],
  },
  {
    id: "deluxe-kit-25",
    name: "25-Piece Deluxe Pleasure & Bondage Kit",
    price: 150,
    image: p10,
    short: "Restraint gear plus pleasure accessories in a fitted case.",
    description:
      "An expanded collection blending restraint gear with pleasure accessories — designed for couples ready to go beyond the basics.",
    intensity: "Intermediate",
    collection: "Intermediate",
    materials: ["Full-Grain Leather", "Medical Silicone", "Aircraft Aluminum"],
    spec: "25 pieces in a foam-fitted lockable case: restraints, sensory tools and silicone accessories.",
    care: "Clean silicone items with toy cleaner; wipe leather dry. Store in the fitted case.",
    sizing: "Case 18 x 11 x 5 in / 46 x 28 x 13 cm. Restraints adjust 5–12 in / 13–30 cm.",
    related: ["beginner-kit-20", "leather-case-harness-bundle", "leather-roll-kit"],
  },
  {
    id: "support-sling",
    name: "Sex Position Support Sling",
    price: 150,
    image: p11,
    short: "Reinforced sling with padded straps for extended wear.",
    description:
      "Reinforced support sling designed for comfort and stability across multiple positions, with padded straps for extended wear.",
    intensity: "Intermediate",
    collection: "Specialty",
    materials: ["Reinforced Nylon", "Stainless Steel"],
    spec: "Double-stitched ballistic nylon, padded panels, steel carabiner, 300 lb / 136 kg rated.",
    care: "Hand wash cold, air dry. Inspect stitching and hardware before each use.",
    sizing: "Straps adjust 24–60 in / 61–152 cm. Seat panel 16 x 12 in / 41 x 30 cm.",
    related: ["suspension-bar-kit", "bondage-bench", "folding-bondage-bench"],
  },
  {
    id: "anal-exploration-set",
    name: "Anal Exploration Set",
    price: 52.99,
    image: p12,
    short: "Graduated set for comfortable, progressive exploration.",
    description:
      "A graduated set designed for comfortable, progressive exploration — smooth materials and ergonomic shaping throughout.",
    intensity: "Beginner",
    collection: "Beginner",
    materials: ["Medical Silicone"],
    spec: "Three graduated body-safe silicone pieces with flared safety bases and matte finish.",
    care: "Wash with warm water and toy cleaner before and after use. Water-based lubricant only.",
    sizing: "Sizes 1.0 in / 25 mm, 1.3 in / 33 mm and 1.6 in / 40 mm at widest point.",
    sizeGuide: "Progress one size at a time, never rushing between stages.",
    related: ["vibrating-beads-cuffs-set", "beginner-kit-20", "deluxe-kit-25"],
  },
  {
    id: "electro-play-kit",
    name: "Electro Play Kit",
    price: 150,
    image: p13,
    short: "Entry-level e-stim set with adjustable intensity.",
    description:
      "Entry-level e-stimulation set with adjustable intensity levels and multiple attachments for a controlled introduction to electro play.",
    intensity: "Advanced",
    collection: "Specialty",
    materials: ["Medical Silicone", "Stainless Steel"],
    spec: "Battery-powered control unit, 10 intensity levels, two conductive attachments, shielded cables.",
    care: "Clean contacts with a dry cloth. Never use above the waist or with a pacemaker.",
    sizing: "Attachments fit 1.5–5 in / 4–13 cm circumference bands.",
    related: ["shock-therapy-kit", "stainless-steel-cuffs-collar", "suspension-bar-kit"],
  },
  {
    id: "stainless-steel-cuffs-collar",
    name: "Stainless Steel Lockable Cuffs & Collar Set",
    price: 200,
    image: p14,
    short: "Heavy-gauge steel cuffs and collar with individual locks.",
    description:
      "Heavy-gauge stainless steel cuffs and collar with individual locks — a durable, statement-grade restraint set.",
    intensity: "Advanced",
    collection: "Advanced",
    materials: ["Stainless Steel"],
    spec: "316L brushed stainless steel, hinge-and-screw closure, three keyed padlocks, two keys each.",
    care: "Polish with a microfiber cloth. Keep keys accessible at all times during use.",
    sizing: "Collar inner 13 in / 33 cm. Cuffs inner 6.3 in / 16 cm. Fixed sizing — check measurements first.",
    sizeGuide:
      "Measure neck and wrist circumference with a soft tape; steel does not stretch, so allow 0.5 in / 12 mm of clearance.",
    related: ["red-leather-origin-wear", "collar-to-cuffs-harness", "electro-play-kit"],
  },
  {
    id: "shock-therapy-kit",
    name: "Fetish Fantasy Deluxe Shock Therapy Kit",
    price: 300,
    image: p15,
    short: "Digital e-stim system with adjustable pulse settings.",
    description:
      "Full-featured e-stimulation system with digital control unit, multiple attachments, and adjustable pulse settings for advanced play.",
    intensity: "Advanced",
    collection: "Specialty",
    materials: ["Medical Silicone", "Stainless Steel"],
    spec: "Digital LCD control unit, dual independent channels, 7 pulse modes, 4 attachments, storage case.",
    care: "Wipe electrodes after use. Never use above the waist, near the heart, or with implanted devices.",
    sizing: "Cables 6 ft / 1.8 m. Attachment bands adjust 2–6 in / 5–15 cm.",
    related: ["electro-play-kit", "suspension-bar-kit", "leather-case-harness-bundle"],
  },
  {
    id: "leather-case-harness-bundle",
    name: "Leather Bondage Case & Body Harness Bundle",
    price: 500,
    image: p16,
    short: "Stocked leather case with a matching body harness.",
    description:
      "A premium bundle pairing a fully stocked leather case with a matching body harness — a complete advanced collection in one purchase.",
    intensity: "Advanced",
    collection: "Advanced",
    materials: ["Full-Grain Leather", "Stainless Steel"],
    spec: "Structured leather case with fitted interior, matching harness with welded steel hardware.",
    care: "Condition leather quarterly. Store the case upright, away from direct sunlight.",
    sizing: "Harness fits 28–48 in / 71–122 cm chest. Case 16 x 12 x 6 in / 41 x 30 x 15 cm.",
    sizeGuide: "Measure around the chest under the arms; the harness sits best in the middle of its range.",
    related: ["red-leather-origin-wear", "deluxe-kit-25", "leather-roll-kit"],
  },
];

const REVIEW_POOL: { name: string; comment: string }[] = [
  { name: "Marcus T.", comment: "Build quality is far beyond what I expected at this price. Feels engineered." },
  { name: "Elena R.", comment: "Arrived in a plain box, nothing on the label. Exactly the discretion promised." },
  { name: "Dana K.", comment: "Adjustment range is generous — fits both of us without swapping anything out." },
  { name: "Priya S.", comment: "Finish is immaculate. No rough edges anywhere, and the hardware feels solid." },
  { name: "Owen B.", comment: "Second purchase from Cold Collar. Consistency between orders is impressive." },
  { name: "Nadia F.", comment: "Comfortable for long sessions, which is rarely true of gear at this level." },
  { name: "Julian M.", comment: "Instructions were clear and safety notes were genuinely useful for us." },
  { name: "Hana L.", comment: "Shipping was quick and the packaging was sturdy. Nothing shifted in transit." },
  { name: "Theo V.", comment: "Materials feel premium in the hand. Worth every dollar over the cheap versions." },
  { name: "Simone A.", comment: "We started cautious and grew into it. Perfectly judged for our pace." },
  { name: "Ryan C.", comment: "Cleans up easily and stores flat. Small details clearly thought through." },
  { name: "Ines D.", comment: "Exactly as described, no surprises. Customer service answered within a day." },
];

export function reviewsFor(product: Product): Review[] {
  const seed = product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 3 + (seed % 4); // 3–6 reviews
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const pick = REVIEW_POOL[(seed + i * 5) % REVIEW_POOL.length]!;
    out.push({
      name: pick.name,
      comment: pick.comment,
      rating: (seed + i * 3) % 3 === 0 ? 4 : 5,
    });
  }
  return out;
}

export function averageRating(product: Product): number {
  const r = reviewsFor(product);
  return Math.round((r.reduce((a, b) => a + b.rating, 0) / r.length) * 10) / 10;
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export const formatPrice = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
