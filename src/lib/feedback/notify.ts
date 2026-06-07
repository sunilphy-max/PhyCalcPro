const DEFAULT_NOTIFY_EMAIL = "support@phycalcpro.com";

export type FeedbackEmailResult = {
  sent: boolean;
  error?: string;
};

export function isFeedbackEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function parseResendError(body: string): string {
  try {
    const json = JSON.parse(body) as { message?: string };
    if (json.message) return json.message;
  } catch {
    // use raw body below
  }
  return body.slice(0, 200);
}

export async function notifyFeedbackByEmail(submission: {
  email: string;
  message: string;
  id: string;
  createdAt: string;
  pageUrl?: string;
}): Promise<FeedbackEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY is not set on the server." };
  }

  const to = (process.env.FEEDBACK_NOTIFY_EMAIL ?? DEFAULT_NOTIFY_EMAIL).trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ?? "PhyCalcPro <onboarding@resend.dev>";

  const lines = [
    `New feedback (${submission.id})`,
    `From: ${submission.email}`,
    `At: ${submission.createdAt}`,
    submission.pageUrl ? `Page: ${submission.pageUrl}` : null,
    "",
    submission.message,
  ].filter(Boolean);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: submission.email,
        subject: `PhyCalcPro feedback from ${submission.email}`,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      const detail = parseResendError(await response.text());
      console.error("[feedback] Resend error:", response.status, detail);
      return { sent: false, error: `Resend (${response.status}): ${detail}` };
    }

    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    console.error("[feedback] Resend request failed:", message);
    return { sent: false, error: message };
  }
}
