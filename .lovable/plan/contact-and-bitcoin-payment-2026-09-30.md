# Contact and Bitcoin Payment

## Scope
- Add one shared configuration file containing the Signal number/link, WhatsApp number/link, and Bitcoin address.
- Replace the current contact form and its conflicting customer-service copy with two large icon buttons for Signal and WhatsApp.
- Add a reusable “How to Pay” panel with a selectable monospace Bitcoin address, copy button with a two-second “Copied” state, an encoded QR code, the three supplied payment steps, and the exact BTC-only warning.
- Show the payment panel in the checkout Payment step and on a dedicated `/how-to-pay` page, linked from the footer.
- Keep the existing visual system and all unrelated content unchanged; arrange new controls mobile-first with large tap targets.

## Technical details
- Use one client-safe config module as the source of truth for display values and normalized links.
- Use a QR library to render the Bitcoin URI locally; no external image service or payment processor will be added.
- Preserve the existing placeholder order flow: this adds Bitcoin instructions only and does not create automated payment verification.
- Add complete page metadata for the new route and verify both mobile and desktop rendering, copying, links, and QR output.
