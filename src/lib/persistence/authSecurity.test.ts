import { describe, expect, it } from "vitest";
import { defaultProjectId, isDefaultProjectId } from "@/lib/persistence/defaultProject";
import { checkRateLimit } from "@/lib/security/rateLimit";
import {
  createRecord,
  ensureDefaultProject,
  listRecords,
} from "@/lib/persistence/repository";

describe("defaultProjectId", () => {
  it("is unique per user", () => {
    expect(defaultProjectId("user-a")).toBe("default:user-a");
    expect(defaultProjectId("user-b")).toBe("default:user-b");
    expect(defaultProjectId("user-a")).not.toBe(defaultProjectId("user-b"));
  });

  it("detects default project ids", () => {
    expect(isDefaultProjectId("default")).toBe(true);
    expect(isDefaultProjectId("default:abc")).toBe(true);
    expect(isDefaultProjectId("other")).toBe(false);
  });
});

describe("checkRateLimit", () => {
  it("allows requests under the limit and blocks after", () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    const blocked = checkRateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });
});

describe("repository ownership (memory fallback)", () => {
  it("isolates default projects per user", async () => {
    await ensureDefaultProject("alice");
    await ensureDefaultProject("bob");

    const aliceProjects = await listRecords("projects", "alice");
    const bobProjects = await listRecords("projects", "bob");

    expect(aliceProjects.some((p) => p.id === defaultProjectId("alice"))).toBe(true);
    expect(bobProjects.some((p) => p.id === defaultProjectId("bob"))).toBe(true);
    expect(aliceProjects.every((p) => p.userId === "alice")).toBe(true);
    expect(bobProjects.every((p) => p.userId === "bob")).toBe(true);
  });

  it("rejects upsert when id belongs to another user", async () => {
    const created = await createRecord("models", {
      userId: "owner-1",
      projectId: defaultProjectId("owner-1"),
      title: "Study A",
      moduleId: "column-buckling",
      payload: { id: "shared-id", name: "A", created_at: new Date().toISOString() },
      id: "model-shared-id",
    });

    expect(created.userId).toBe("owner-1");

    await expect(
      createRecord("models", {
        userId: "owner-2",
        projectId: defaultProjectId("owner-2"),
        title: "Hijack",
        moduleId: "column-buckling",
        payload: {},
        id: "model-shared-id",
      })
    ).rejects.toThrow(/another user/i);
  });
});
