import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabaseServer", () => ({
  getUserFromRequest: vi.fn(),
  getSupabaseServerClient: vi.fn(() => null),
}));

import { getUserFromRequest } from "@/lib/supabaseServer";
import { GET, POST } from "@/app/api/account/entitlement/route";

describe("/api/account/entitlement", () => {
  beforeEach(() => {
    vi.mocked(getUserFromRequest).mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/account/entitlement"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when spoofed user id does not match token", async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue({ id: "real-user", email: "a@b.com" });
    const res = await GET(
      new Request("http://localhost/api/account/entitlement", {
        headers: { "x-phycalc-user-id": "other-user" },
      })
    );
    expect(res.status).toBe(403);
  });

  it("ignores client-supplied user id when it matches and returns stored:false without DB", async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue({ id: "real-user", email: "a@b.com" });
    const res = await GET(
      new Request("http://localhost/api/account/entitlement", {
        headers: {
          Authorization: "Bearer fake",
          "x-phycalc-user-id": "real-user",
        },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stored).toBe(false);
  });

  it("POST requires authentication", async () => {
    vi.mocked(getUserFromRequest).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/account/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "x" }),
      })
    );
    expect(res.status).toBe(401);
  });
});
