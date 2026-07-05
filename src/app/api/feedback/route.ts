import { NextResponse } from "next/server";
import { isFeedbackEmailConfigured, notifyFeedbackByEmail } from "@/lib/feedback/notify";
import { isRateLimited } from "@/lib/feedback/rateLimit";
import { storeFeedback } from "@/lib/feedback/store";
import { validateFeedbackPayload } from "@/lib/feedback/validate";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { SUPPORT_EMAIL } from "@/lib/site/supportEmail";

export const runtime = "nodejs";

function userFacingError(emailConfigured: boolean, emailError?: string): string {
  if (!emailConfigured) {
    return `Feedback email is not configured on this site yet. Please email ${SUPPORT_EMAIL} directly.`;
  }

  const lower = (emailError ?? "").toLowerCase();
  if (lower.includes("domain") || lower.includes("verify") || lower.includes("from")) {
    return `Feedback email could not be sent (sender domain not verified in Resend). Please email ${SUPPORT_EMAIL} directly.`;
  }

  return `We could not deliver your message right now. Please email ${SUPPORT_EMAIL} directly.`;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = validateFeedbackPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if ("spam" in parsed) {
    return NextResponse.json({ ok: true });
  }

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Please wait a minute before sending another message." },
      { status: 429 }
    );
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const meta = {
    email: parsed.email,
    message: parsed.message,
    pageUrl: parsed.pageUrl,
    userAgent,
  };

  const submission = await storeFeedback(meta);
  const stored = Boolean(submission);

  const emailResult = await notifyFeedbackByEmail({
    email: meta.email,
    message: meta.message,
    pageUrl: meta.pageUrl,
    id: submission?.id ?? `msg_${Date.now()}`,
    createdAt: submission?.createdAt ?? new Date().toISOString(),
  });

  const emailed = emailResult.sent;
  const hasSupabase = Boolean(getSupabaseServerClient());
  const devStore = process.env.NODE_ENV === "development";

  if (!stored && !emailed) {
    const emailConfigured = isFeedbackEmailConfigured();
    return NextResponse.json(
      {
        error: userFacingError(emailConfigured, emailResult.error),
        details:
          process.env.NODE_ENV === "development"
            ? {
                emailConfigured,
                emailError: emailResult.error,
                supabase: hasSupabase,
              }
            : undefined,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    stored,
    emailed,
    channels: {
      database: hasSupabase && stored,
      email: emailed,
      localFile: devStore && stored && !hasSupabase,
    },
  });
}
