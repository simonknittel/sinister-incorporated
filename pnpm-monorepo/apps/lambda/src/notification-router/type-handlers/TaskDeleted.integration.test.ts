import { prisma, TaskRewardType, TaskVisibility } from "@sam-monorepo/database";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { truncateAllTables } from "../../../test/database";
import { createCitizenWithPermissions } from "../../common/effectivePermissions.fixtures";
import { publishNotifications } from "../publish";
import { TaskDeletedHandler } from "./TaskDeleted";

vi.mock("../publish", () => ({ publishNotifications: vi.fn() }));

const RECEIVER_PERMISSION_STRINGS = ["login;manage", "task;read"];

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
    const task = await prisma.task.create({
      data: {
        title: "Frachter eskortieren",
        visibility: TaskVisibility.GROUP,
        rewardType: TaskRewardType.TEXT,
        rewardTypeTextValue: "Ruhm und Ehre",
        deletedAt: new Date(),
        deletedById: deleter.id,
        assignments: {
          create: [deleter, assignee, assigneeWithoutLogin].map((citizen) => ({
            citizenId: citizen.id,
          })),
        },
      },
    });

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
});
