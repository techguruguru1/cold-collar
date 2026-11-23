// Server-only: sends an email from a saved template through the PremiumSending API.
// Requires SMTP_API_KEY in the environment (.env locally, Vercel in production).
// Only import this from server code (a createServerFn handler or another *.server.ts file),
// never from a route or component, or the API key could end up in the browser.

const SEND_URL = "https://app.premiumsending.com/v1/send";

export type EmailVariables = Record<string, string | number | boolean | null>;

export async function sendTemplateEmail(
  template: string,
  to: string,
  variables: EmailVariables = {},
): Promise<unknown> {
  const apiKey = process.env["SMTP_API_KEY"];
  if (!apiKey) throw new Error("Email isn't set up: SMTP_API_KEY is missing.");

  let res: Response;
  try {
    res = await fetch(SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ template, to, variables }),
      // Don't let a slow email service hold up the customer's request.
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    console.error("[email] request failed", err);
    throw new Error("Email not sent: couldn't reach the email service.");
  }

  // The service may reply with an empty or non-JSON body (e.g. an error page).
  const text = await res.text();
  let result: { message?: unknown } | null = null;
  try {
    result = text ? (JSON.parse(text) as { message?: unknown }) : null;
  } catch {
    result = null;
  }

  // Any 2xx (202 Accepted is the usual reply) counts as sent.
  if (!res.ok) {
    const message = typeof result?.message === "string" ? result.message : "";
    console.error("[email] send failed", res.status, message || text.slice(0, 300));
    throw new Error(message || `Email not sent (status ${res.status}).`);
  }
  return result;
}
