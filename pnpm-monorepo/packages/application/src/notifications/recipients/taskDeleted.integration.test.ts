import {
  prisma,
  TaskRewardType,
  TaskVisibility,
  type Prisma,
} from "@sam-monorepo/database";
import { beforeEach, describe, expect, test } from "vitest";
import {
  createTestApplicationContext,
  TEST_NOW,
} from "../../../test/applicationContext.js";
import { createCitizenWithPermissions } from "../../../test/citizensWithPermissions.js";
import { truncateAllTables } from "../../../test/database.js";
import { findTaskDeletedRecipients } from "./taskDeleted.js";

const RECEIVER_PERMISSION_STRINGS = ["login;manage", "task;read"];

const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1_000;

const createDeletedTask = (
  assigneeIds: readonly string[],
  data: Partial<Prisma.TaskUncheckedCreateInput> = {},
) =>
  prisma.task.create({
    data: {
      title: "Frachter eskortieren",
      visibility: TaskVisibility.GROUP,
      rewardType: TaskRewardType.TEXT,
      rewardTypeTextValue: "Ruhm und Ehre",
      deletedAt: TEST_NOW,
      assignments: {
        create: assigneeIds.map((citizenId) => ({ citizenId })),
      },
      ...data,
    },
  });

beforeEach(async () => {
  await truncateAllTables();
});

describe("findTaskDeletedRecipients", () => {
  test("notifies the assignees who can log in and open tasks, except the citizen who deleted the task", async () => {
    const deleter = await createCitizenWithPermissions("deleter", [
      ...RECEIVER_PERMISSION_STRINGS,
      "task;delete",
    ]);
    const assignee = await createCitizenWithPermissions(
      "assignee",
      RECEIVER_PERMISSION_STRINGS,
    );
    const assigneeWithoutLogin = await createCitizenWithPermissions(
      "assignee-without-login",
      ["task;read"],
    );
    await createCitizenWithPermissions("reader", RECEIVER_PERMISSION_STRINGS);
    const task = await createDeletedTask(
      [deleter.id, assignee.id, assigneeWithoutLogin.id],
      { deletedById: deleter.id },
    );
    const { context } = createTestApplicationContext();

    const result = await findTaskDeletedRecipients(context, {
      taskId: task.id,
    });

    expect(result).toEqual({
      task: { title: task.title },
      recipients: [{ citizenId: assignee.id }],
    });
  });

  test.each<{
    state: string;
    data: Partial<Prisma.TaskUncheckedCreateInput>;
  }>([
    { state: "completed", data: { completedAt: TEST_NOW } },
    { state: "cancelled", data: { cancelledAt: TEST_NOW } },
    {
      state: "expired",
      data: {
        expiresAt: new Date(TEST_NOW.getTime() - ONE_HOUR_IN_MILLISECONDS),
      },
    },
  ])(
    "notifies nobody for a task that was $state before the deletion",
    async ({ data }) => {
      const assignee = await createCitizenWithPermissions(
        "assignee",
        RECEIVER_PERMISSION_STRINGS,
      );
      const task = await createDeletedTask([assignee.id], data);
      const { context } = createTestApplicationContext();

      expect(
        await findTaskDeletedRecipients(context, { taskId: task.id }),
      ).toBeNull();
    },
  );
});
