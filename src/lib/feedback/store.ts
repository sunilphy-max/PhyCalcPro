import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { FeedbackSubmission } from "./types";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `fb_${crypto.randomUUID()}`;
  }
  return `fb_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** Persists feedback when Supabase or local dev storage is available. Returns null if optional storage is skipped. */
export async function storeFeedback(
  input: Omit<FeedbackSubmission, "id" | "createdAt">
): Promise<FeedbackSubmission | null> {
  const submission: FeedbackSubmission = {
    id: createId(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  const client = getSupabaseServerClient();
  if (client) {
    const { error } = await client.from("user_feedback").insert({
      id: submission.id,
      email: submission.email,
      message: submission.message,
      userAgent: submission.userAgent ?? null,
      pageUrl: submission.pageUrl ?? null,
      createdAt: submission.createdAt,
    });

    if (error) {
      console.error("[feedback] Supabase insert failed:", error.message);
      return null;
    }

    return submission;
  }

  if (process.env.NODE_ENV === "development") {
    const dir = join(process.cwd(), "data", "feedback");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const file = join(dir, `${submission.id}.json`);
    writeFileSync(file, JSON.stringify(submission, null, 2), "utf8");
    return submission;
  }

  return null;
}
