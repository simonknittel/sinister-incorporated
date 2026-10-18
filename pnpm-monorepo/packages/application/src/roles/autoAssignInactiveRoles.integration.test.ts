import { prisma } from "@sam-monorepo/database";
import { AuditEventType } from "@sam-monorepo/domain";
import { beforeEach, expect, test } from "vitest";
import {
  createTestApplicationContext,
  TEST_NOW,
} from "../../test/applicationContext.js";
import { truncateAllTables } from "../../test/database.js";
import { autoAssignInactiveRoles } from "./autoAssignInactiveRoles.js";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const INACTIVE_DAYS = 60;

const daysAgo = (days: number) =>
  new Date(TEST_NOW.getTime() - days * ONE_DAY_IN_MILLISECONDS);

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

  const { context, auditEvents } = createTestApplicationContext();

  const output = await autoAssignInactiveRoles(context);

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

  const { context, auditEvents } = createTestApplicationContext();

  await autoAssignInactiveRoles(context);
  await autoAssignInactiveRoles(context);

  expect(await prisma.roleAssignment.count()).toBe(1);
  expect(await prisma.roleAssignmentChange.count()).toBe(1);
  expect(auditEvents).toHaveLength(1);
});
