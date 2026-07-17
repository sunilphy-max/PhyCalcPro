import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabaseServer", () => ({
  getUserFromRequest: vi.fn(),
  getSupabaseServerClient: vi.fn(() => null),
}));

vi.mock("@/lib/billing/stripe", () => ({
  getStripe: vi.fn(() => ({
    billingPortal: {
      sessions: {
        create: vi.fn(async () => ({ url: "https://billing.example/session" })),
      },
    },
  })),
}));

import { getUserFromRequest, getSupabaseServerClient } from "@/lib/supabaseServer";
import { POST } from "@/app/api/billing/portal/route";

describe("/api/billing/portal", () => {
  beforeEach(() => {
    vi.mocked(getUserFromRequest).mockReset();
    vi.mocked(getSupabaseServerClient).mockReset();
    vi.mocked(getSupabaseServerClient).mockReturnValue(null);
  });

  it("returns 401 without auth", async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: "cus_attacker" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("does not accept a client-supplied customerId when cloud storage is off", async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue({ id: "user-1" });
    vi.mocked(getSupabaseServerClient).mockReturnValue(null);
    const res = await POST(
      new Request("http://localhost/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer fake",
        },
        body: JSON.stringify({ customerId: "cus_attacker" }),
      })
    );
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });
});
