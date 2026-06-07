const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFeedbackPayload(body: unknown):
  | { ok: true; spam: true }
  | { ok: true; email: string; message: string; pageUrl?: string }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;

  if (typeof record.website === "string" && record.website.trim()) {
    return { ok: true, spam: true };
  }

  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";
  const pageUrl = typeof record.pageUrl === "string" ? record.pageUrl.trim() : undefined;

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (message.length < 10) {
    return { ok: false, error: "Message must be at least 10 characters." };
  }

  if (message.length > 5000) {
    return { ok: false, error: "Message must be 5000 characters or fewer." };
  }

  return { ok: true, email, message, pageUrl };
}
