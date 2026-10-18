import { prisma } from "@sam-monorepo/database";
import { AuditEventType } from "@sam-monorepo/domain";
import { beforeEach, expect, test } from "vitest";
import { createTestApplicationContext } from "../../test/applicationContext.js";
import { truncateAllTables } from "../../test/database.js";
import { autoAssignInactiveRoles } from "./autoAssignInactiveRoles.js";

const NOW = new Date("2026-06-15T10:00:00.000Z");
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const INACTIVE_DAYS = 60;

const daysAgo = (days: number) => new Date(NOW.getTime() - days * ONE_DAY_MS);

beforeEach(async () => {
  await truncateAllTables();
  await prisma.role.create({
    data: { name: "Reserve", assignAfterInactiveDays: INACTIVE_DAYS },
  });
});

test("assigns the role to inactive citizens with a login only", async () => {
  const inactive = await prisma.citizen.create({
    data: {
      handle: "inactive",
      user: { create: { lastSeenAt: daysAgo(INACTIVE_DAYS + 1) } },
    },
  });
  const active = await prisma.citizen.create({
    data: {
      handle: "active",
      user: { create: { lastSeenAt: daysAgo(1) } },
    },
  });
  const withoutLogin = await prisma.citizen.create({
    data: { handle: "without-login" },
  });

  const { context, auditEvents } = createTestApplicationContext({ now: NOW });

  const output = await autoAssignInactiveRoles(context, { now: NOW });

  expect(output).toEqual({ assignedCount: 1 });
  const assignments = await prisma.roleAssignment.findMany({
    select: { citizenId: true },
  });
  expect(assignments.map(({ citizenId }) => citizenId)).toEqual([inactive.id]);
  expect(
    await prisma.roleAssignmentChange.count({
      where: { citizenId: { in: [active.id, withoutLogin.id] } },
    }),
  ).toBe(0);
  expect(auditEvents).toEqual([
    {
      type: AuditEventType.ROLE_AUTO_ASSIGNED,
      data: {
        citizenId: inactive.id,
        citizenHandle: "inactive",
        roleId: expect.any(String),
        roleName: "Reserve",
      },
      createdById: null,
    },
  ]);
});

test("a second run adds no second history row", async () => {
  await prisma.citizen.create({
    data: {
      handle: "inactive",
      user: { create: { lastSeenAt: daysAgo(INACTIVE_DAYS + 1) } },
    },
  });

  const { context, auditEvents } = createTestApplicationContext({ now: NOW });

  await autoAssignInactiveRoles(context, { now: NOW });
  await autoAssignInactiveRoles(context, { now: NOW });

  expect(await prisma.roleAssignment.count()).toBe(1);
  expect(await prisma.roleAssignmentChange.count()).toBe(1);
  expect(auditEvents).toHaveLength(1);
});
