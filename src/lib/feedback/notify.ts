const DEFAULT_NOTIFY_EMAIL = "support@phycalcpro.com";

export function isFeedbackEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function notifyFeedbackByEmail(submission: {
  email: string;
  message: string;
  id: string;
  createdAt: string;
  pageUrl?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

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
    const detail = await response.text();
    throw new Error(`Resend failed (${response.status}): ${detail}`);
  }

  return true;
}
