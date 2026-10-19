import { prisma } from "@sam-monorepo/database";
import { AuditEventType } from "@sam-monorepo/domain";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createTestApplicationContext,
  TEST_NOW,
} from "../../../test/applicationContext.js";
import { truncateAllTables } from "../../../test/database.js";
import {
  storeOnSiteNotifications,
  type OnSiteNotificationDraft,
} from "./onSiteNotificationStore.js";

const createDraft = (receiverId: string): OnSiteNotificationDraft => ({
  receiverId,
  notificationType: "task_assignment_updated",
  payload: { taskId: "task", taskTitle: "Test" },
});

beforeEach(async () => {
  await truncateAllTables();
});

describe("storeOnSiteNotifications", () => {
  test("writes nothing for a deleted receiver and leaves it out of the active receivers", async () => {
    const activeReceiver = await prisma.citizen.create({
      data: { handle: "active" },
    });
    const deletedReceiver = await prisma.citizen.create({
      data: { handle: "deleted", deletedAt: TEST_NOW },
    });
    const { context, auditEvents } = createTestApplicationContext();

    const { rows, activeReceiverIds } = await storeOnSiteNotifications(
      context,
      [createDraft(activeReceiver.id), createDraft(deletedReceiver.id)],
    );

    const onSiteNotifications = await prisma.onSiteNotification.findMany({
      select: { citizenId: true },
    });
    expect(onSiteNotifications).toEqual([{ citizenId: activeReceiver.id }]);
    expect(rows).toEqual([
      expect.objectContaining({ citizenId: activeReceiver.id }),
    ]);
    expect([...activeReceiverIds]).toEqual([activeReceiver.id]);
    expect(auditEvents).toEqual([
      {
        type: AuditEventType.ON_SITE_NOTIFICATIONS_CREATED,
        data: { count: 1, notificationTypes: ["task_assignment_updated"] },
        createdById: null,
      },
    ]);
  });

  test("writes no row and no audit event when all receivers are deleted", async () => {
    const deletedReceiver = await prisma.citizen.create({
      data: { handle: "deleted", deletedAt: TEST_NOW },
    });
    const { context, auditEvents } = createTestApplicationContext();

    const { rows, activeReceiverIds } = await storeOnSiteNotifications(
      context,
      [createDraft(deletedReceiver.id)],
    );

    expect(await prisma.onSiteNotification.count()).toBe(0);
    expect(rows).toEqual([]);
    expect(activeReceiverIds.size).toBe(0);
    expect(auditEvents).toEqual([]);
  });
});
