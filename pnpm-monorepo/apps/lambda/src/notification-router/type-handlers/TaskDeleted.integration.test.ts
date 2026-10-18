import { truncateAllTables } from "@sam-monorepo/application/test/database";
import {
  prisma,
  TaskRewardType,
  TaskVisibility,
  type Prisma,
} from "@sam-monorepo/database";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createCitizenWithPermissions } from "../../common/effectivePermissions.fixtures";
import { publishNotifications } from "../publish";
import { TaskDeletedHandler } from "./TaskDeleted";

vi.mock("../publish", () => ({ publishNotifications: vi.fn() }));

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
      deletedAt: new Date(),
      assignments: {
        create: assigneeIds.map((citizenId) => ({ citizenId })),
      },
      ...data,
    },
  });

beforeEach(async () => {
  await truncateAllTables();
});

describe("TaskDeletedHandler", () => {
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

    await TaskDeletedHandler({ taskId: task.id });

    expect(publishNotifications).toHaveBeenCalledExactlyOnceWith([
      {
        receiverId: assignee.id,
        notificationType: "task_deleted",
        payload: { taskTitle: task.title },
        title: "Task gelöscht",
        body: task.title,
      },
    ]);
  });

  test.each<{
    state: string;
    data: Partial<Prisma.TaskUncheckedCreateInput>;
  }>([
    { state: "completed", data: { completedAt: new Date() } },
    { state: "cancelled", data: { cancelledAt: new Date() } },
    {
      state: "expired",
      data: { expiresAt: new Date(Date.now() - ONE_HOUR_IN_MILLISECONDS) },
    },
  ])(
    "notifies nobody for a task that was $state before the deletion",
    async ({ data }) => {
      const assignee = await createCitizenWithPermissions(
        "assignee",
        RECEIVER_PERMISSION_STRINGS,
      );
      const task = await createDeletedTask([assignee.id], data);

      await TaskDeletedHandler({ taskId: task.id });

      expect(publishNotifications).not.toHaveBeenCalled();
    },
  );
});
