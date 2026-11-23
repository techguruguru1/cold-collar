// Emails the site sends through PremiumSending (see src/lib/send-email.server.ts).
export const EMAIL = {
  // Set to false to stop all automatic emails without removing any code.
  enabled: true,
  templates: {
    // The template name exactly as it's saved in your PremiumSending account.
    // Variables it receives: name, order_number, order_total, payment_method, items, order_url,
    // support_email.
    orderConfirmation: "order-confirmation",
  },
} as const;
