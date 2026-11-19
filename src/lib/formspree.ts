// Sends form submissions to Formspree, which stores them and emails them to you.
export async function submitToFormspree(formId: string, fields: Record<string, string>) {
  if (!formId) {
    throw new Error("This form isn't set up yet. Please contact us on WhatsApp or Signal for now.");
  }

  const body = Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim() !== ""));

  let res: Response;
  try {
    res = await fetch(`https://formspree.io/f/${encodeURIComponent(formId)}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    let message = "We couldn't send your message. Please try again or contact us on WhatsApp or Signal.";
    try {
      const data = (await res.json()) as { errors?: { message?: string }[] };
      const first = data.errors?.map((e) => e.message).filter(Boolean).join(" ");
      if (first) message = first;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }
}
