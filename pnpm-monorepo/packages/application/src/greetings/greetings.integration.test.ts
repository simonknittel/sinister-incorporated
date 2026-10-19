import { prisma } from "@sam-monorepo/database";
import { AuditEventType } from "@sam-monorepo/domain";
import { beforeEach, expect, test } from "vitest";
import { createTestApplicationContext } from "../../test/applicationContext.js";
import { truncateAllTables } from "../../test/database.js";
import { sendBirthdayGreetings } from "./sendBirthdayGreetings.js";
import { sendNewYearGreetings } from "./sendNewYearGreetings.js";

/** The interval of the schedule of the greeting automations */
const RUN_INTERVAL_IN_MILLISECONDS = 15 * 60 * 1000;

beforeEach(async () => {
  await truncateAllTables();
});

const createCitizenWhoCanLogin = async (data: {
  handle: string;
  timezone?: string;
  birthdayDay?: number;
  birthdayMonth?: number;
}) => {
  const role = await prisma.role.create({
    data: {
      name: `${data.handle}-role`,
      permissionStrings: { create: [{ permissionString: "login;manage" }] },
    },
  });

  return prisma.citizen.create({
    data: { ...data, roleAssignments: { create: { roleId: role.id } } },
  });
};

test("greets a citizen once on the birthday in their own time zone", async () => {
  // 2026-12-25 00:05 in Pacific/Kiritimati (UTC+14), 2026-12-24 11:05 in Berlin
  const now = new Date("2026-12-24T10:05:00Z");
  const celebrant = await createCitizenWhoCanLogin({
    handle: "kiritimati",
    timezone: "Pacific/Kiritimati",
    birthdayDay: 25,
    birthdayMonth: 12,
  });
  const sameDayInBerlin = await createCitizenWhoCanLogin({
    handle: "berlin",
    timezone: "Europe/Berlin",
    birthdayDay: 25,
    birthdayMonth: 12,
  });

  const { context, notifications, auditEvents } = createTestApplicationContext({
    now,
  });

  await expect(sendBirthdayGreetings(context)).resolves.toEqual({
    candidateCount: 2,
    greetedCount: 1,
    notificationsSent: true,
  });
  expect(notifications).toEqual([
    { type: "BirthdayGreeting", payload: { citizenId: celebrant.id } },
  ]);
  expect(auditEvents).toEqual([
    {
      type: AuditEventType.BIRTHDAY_GREETINGS_SENT,
      data: { citizenCount: 1 },
      createdById: null,
    },
  ]);
  await expect(
    prisma.citizen.findUniqueOrThrow({ where: { id: celebrant.id } }),
  ).resolves.toMatchObject({ birthdayGreetingSentAt: now });
  await expect(
    prisma.citizen.findUniqueOrThrow({ where: { id: sameDayInBerlin.id } }),
  ).resolves.toMatchObject({ birthdayGreetingSentAt: null });

  // The next run greets nobody
  const secondRun = createTestApplicationContext({
    now: new Date(now.getTime() + RUN_INTERVAL_IN_MILLISECONDS),
  });

  await expect(sendBirthdayGreetings(secondRun.context)).resolves.toEqual({
    candidateCount: 2,
    greetedCount: 0,
    notificationsSent: true,
  });
  expect(secondRun.notifications).toEqual([]);
  expect(secondRun.auditEvents).toEqual([]);
});

test("greets a citizen at the start of January 1 in their time zone", async () => {
  const now = new Date("2027-01-01T00:05:00+01:00");
  const citizen = await createCitizenWhoCanLogin({ handle: "berlin" });

  const { context, notifications, auditEvents } = createTestApplicationContext({
    now,
  });

  await expect(sendNewYearGreetings(context)).resolves.toEqual({
    candidateCount: 1,
    greetedCount: 1,
    notificationsSent: true,
  });
  expect(notifications).toEqual([
    {
      type: "NewYearGreeting",
      payload: { citizenId: citizen.id, year: 2027 },
    },
  ]);
  expect(auditEvents).toEqual([
    {
      type: AuditEventType.NEW_YEAR_GREETINGS_SENT,
      data: { citizenCount: 1 },
      createdById: null,
    },
  ]);
  await expect(
    prisma.citizen.findUniqueOrThrow({ where: { id: citizen.id } }),
  ).resolves.toMatchObject({ newYearGreetingSentAt: now });
});
