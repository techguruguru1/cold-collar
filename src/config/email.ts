// Emails the site sends through PremiumSending (see src/lib/send-email.server.ts).
export const EMAIL = {
  // Set to false to stop all automatic emails without removing any code.
  enabled: true,
  // Template names exactly as they're saved in your PremiumSending account.
  // Every template receives: name, order_number, order_total, payment_method, items, order_url,
  // support_email.
  templates: {
    // Sent when you click "Accept Payment" on the admin page.
    orderConfirmation: "order-confirmation",
    // Sent when you click "Reject" on the admin page. Also receives: reason (what you typed as
    // the reason, or "We couldn't confirm your payment." if you left it blank).
    paymentFailed: "payment-failed",
  },
} as const;
