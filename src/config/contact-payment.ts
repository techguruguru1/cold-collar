// All customer-facing contact and payment details live here.
// TODO: replace the Cash App, PayPal and Zelle placeholders with the real details.
export const CONTACT_PAYMENT = {
  business: {
    // Shown on the Terms, Privacy, Returns and Shipping pages. Card processors check these.
    // Leave a field empty ("") to hide it.
    // The registered business name (or the owner's full name for a sole trader).
    legalName: "",
    // An email address customers can write to for orders, refunds and privacy requests.
    email: "",
    // Business or mailing address.
    address: "",
    // Whose laws the Terms follow, e.g. "the State of Florida, USA" or "England and Wales".
    governingLaw: "",
    // The name customers see on their card statement. Must match what your card processor sets up.
    statementName: "CC Lifestyle",
    // Change this date whenever you edit the policy pages.
    policiesUpdated: "21 November 2026",
  },
  card: {
    // false: checkout shows Card as "Unavailable" and it can't be selected, and the server
    // refuses to start card payments. Set to true once a card processor is approved and its
    // live key is set in Vercel.
    enabled: false,
  },
  signal: {
    display: "5619834876",
    href: "https://signal.me/#p/+15619834876",
  },
  whatsapp: {
    display: "+1 (727) 741-6718",
    href: "https://wa.me/17277416718",
  },
  formspree: {
    // Form IDs from formspree.io (the part after https://formspree.io/f/).
    // You can use the same ID for both, or separate forms to keep them apart in Formspree.
    contactFormId: "mvkaqvne",
    specialOrderFormId: "mvkaqvne",
  },
  bitcoin: {
    address: "bc1qn4qa5h6743pphgq4aagpeepqyw542c46chpxpt",
  },
  cashapp: {
    // Your $Cashtag, including the leading "$".
    cashtag: "$YourCashtag",
  },
  paypal: {
    // Your paypal.me username (the part after paypal.me/).
    username: "YourPayPalName",
  },
  zelle: {
    // The email or US phone number registered with Zelle.
    recipient: "payments@example.com",
    // The name customers will see when they send to you.
    name: "Your Name",
    // Optional: path to your Zelle QR image in /public (e.g. "/zelle-qr.png"). Leave empty to hide.
    qrImage: "",
  },
} as const;
