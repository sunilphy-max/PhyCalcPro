import { NextResponse } from "next/server";
import { notifyFeedbackByEmail } from "@/lib/feedback/notify";
import { isRateLimited } from "@/lib/feedback/rateLimit";
import { storeFeedback } from "@/lib/feedback/store";
import { validateFeedbackPayload } from "@/lib/feedback/validate";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

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

  let stored = false;
  let emailed = false;
  const errors: string[] = [];
  let submissionId = `msg_${Date.now()}`;
  let createdAt = new Date().toISOString();

  try {
    const submission = await storeFeedback(meta);
    stored = true;
    submissionId = submission.id;
    createdAt = submission.createdAt;
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Store failed");
  }

  try {
    emailed = await notifyFeedbackByEmail({
      email: meta.email,
      message: meta.message,
      pageUrl: meta.pageUrl,
      id: submissionId,
      createdAt,
    });
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Email failed");
  }

  const hasSupabase = Boolean(getSupabaseServerClient());
  const devStore = process.env.NODE_ENV === "development";

  if (!stored && !emailed) {
    return NextResponse.json(
      {
        error:
          "Feedback is not configured on this deployment. Email support@phycalcpro.com directly.",
        details: process.env.NODE_ENV === "development" ? errors : undefined,
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
