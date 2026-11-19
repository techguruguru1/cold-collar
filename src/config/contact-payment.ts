// All customer-facing contact and payment details live here.
// TODO: replace the Cash App, PayPal and Zelle placeholders with the real details.
export const CONTACT_PAYMENT = {
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
