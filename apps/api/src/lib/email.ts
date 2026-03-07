const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getSender(): { name: string; email: string } {
  return {
    name: process.env.BREVO_SENDER_NAME ?? "App",
    email: process.env.BREVO_SENDER_EMAIL ?? "noreply@example.com",
  };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY not set — email not sent");
    console.debug("[email] Dev preview:", {
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.htmlContent,
    });
    return;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: getSender(),
        to: [{ email: opts.to }],
        subject: opts.subject,
        htmlContent: opts.htmlContent,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[email] Brevo API error", {
        status: response.status,
        body,
      });
    }
  } catch (err) {
    console.error("[email] Failed to send email", { error: err });
  }
}
