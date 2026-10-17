import { UserRole } from "@sam-monorepo/database/browser";
import { describe, expect, test } from "vitest";
import { createActor, type ActorFields } from "./actor.js";
import { ForbiddenError } from "./errors.js";

const MEMBER: ActorFields = {
  userId: "user",
  userRole: null,
  emailConfirmedAt: new Date("2026-01-01T00:00:00Z"),
  citizen: { id: "citizen", handle: "handle" },
  permissionSets: [
    { resource: "login", operation: "manage" },
    { resource: "event", operation: "read" },
  ],
  adminMode: false,
};

describe("admin mode", () => {
  test("does not apply to a user who is not an admin", () => {
    const actor = createActor({ ...MEMBER, adminMode: true });

    expect(actor.adminMode).toBe(false);
    expect(actor.authorize("task", "manage")).toBe(false);
  });

  test("gives an admin all operations except negate", () => {
    const actor = createActor({
      ...MEMBER,
      userRole: UserRole.ADMIN,
      permissionSets: [],
      adminMode: true,
    });

    expect(actor.authorize("task", "manage")).toBe(true);
    expect(actor.authorize("task", "negate")).toBe(false);
  });
});

describe("clearance", () => {
  test("requires a confirmed email address and login;manage", () => {
    expect(() => createActor(MEMBER).requireClearance()).not.toThrow();

    expect(() =>
      createActor({ ...MEMBER, emailConfirmedAt: null }).requireClearance(),
    ).toThrow(ForbiddenError);

    expect(() =>
      createActor({
        ...MEMBER,
        permissionSets: [{ resource: "event", operation: "read" }],
      }).requireClearance(),
    ).toThrow(ForbiddenError);
  });

  test("does not require a confirmed email address in admin mode", () => {
    const actor = createActor({
      ...MEMBER,
      userRole: UserRole.ADMIN,
      emailConfirmedAt: null,
      permissionSets: [],
      adminMode: true,
    });

    expect(() => actor.requireClearance()).not.toThrow();
  });
});
