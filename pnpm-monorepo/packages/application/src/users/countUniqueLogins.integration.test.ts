import { prisma } from "@sam-monorepo/database";
import { AuditEventType } from "@sam-monorepo/domain";
import { beforeEach, expect, test } from "vitest";
import { createTestApplicationContext } from "../../test/applicationContext.js";
import { truncateAllTables } from "../../test/database.js";
import { countUniqueLogins } from "./countUniqueLogins.js";

/**
 * The scheduler starts the function at midnight in Europe/Berlin. The result
 * must not depend on the time zone of the process (the `TZ` variable).
 */
const MIDNIGHT = new Date("2026-09-16T00:00:05+02:00");

beforeEach(async () => {
  await truncateAllTables();
});

test("stores the count under the day that it counts in Europe/Berlin", async () => {
  await prisma.user.createMany({
    data: [
      { lastSeenAt: new Date("2026-09-15T00:30:00+02:00") },
      { lastSeenAt: new Date("2026-09-15T23:30:00+02:00") },
      { lastSeenAt: new Date("2026-09-14T23:30:00+02:00") },
    ],
  });

  const { context } = createTestApplicationContext({ now: MIDNIGHT });

  const output = await countUniqueLogins(context);

  expect(output).toEqual({ date: "2026-09-15", count: 2, saved: true });
  const rows = await prisma.dailyLoginCount.findMany();
  expect(
    rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      count: row.count,
    })),
  ).toEqual([{ date: "2026-09-15", count: 2 }]);
});

test("a second run later in the night keeps the count of the first run", async () => {
  const [returningUser] = await prisma.user.createManyAndReturn({
    data: [
      { lastSeenAt: new Date("2026-09-15T20:00:00+02:00") },
      { lastSeenAt: new Date("2026-09-15T21:00:00+02:00") },
    ],
  });
  const firstRun = createTestApplicationContext({ now: MIDNIGHT });
  await countUniqueLogins(firstRun.context);

  // A user of the counted day visits again after midnight
  await prisma.user.update({
    where: { id: returningUser!.id },
    data: { lastSeenAt: new Date("2026-09-16T00:30:00+02:00") },
  });
  const repeatedRun = createTestApplicationContext({
    now: new Date("2026-09-16T01:00:00+02:00"),
  });
  const repeatedOutput = await countUniqueLogins(repeatedRun.context);

  expect(repeatedOutput.saved).toBe(false);
  const rows = await prisma.dailyLoginCount.findMany();
  expect(rows.map((row) => row.count)).toEqual([2]);
  expect(firstRun.auditEvents.map(({ type }) => type)).toEqual([
    AuditEventType.UNIQUE_LOGINS_COUNTED,
  ]);
  expect(repeatedRun.auditEvents).toEqual([]);
});
