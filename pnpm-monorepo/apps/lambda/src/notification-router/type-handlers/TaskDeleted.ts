import { prisma, type Task } from "@sam-monorepo/database";
import { findCitizenIdsWithPermissions } from "../../common/effectivePermissions";
import { publishNotifications } from "../publish";
import { TASK_RECEIVER_PERMISSION_SETS } from "../taskReceiverPermissionSets";

interface Payload {
  taskId: Task["id"];
}

export const TaskDeletedHandler = async (payload: Payload) => {
  const task = await prisma.task.findUnique({
    where: {
      id: payload.taskId,
    },
    select: {
      title: true,
      completedAt: true,
      cancelledAt: true,
      expiresAt: true,
      deletedAt: true,
      deletedById: true,
      assignments: {
        select: {
          citizenId: true,
        },
      },
    },
  });
  if (!task?.deletedAt) return;

  /**
   * The deletion of a closed task only cleans up, thus it notifies nobody.
   * The rule of `isTaskUpdatable()` of the app, at the time of the deletion.
   */
  if (
    task.completedAt ||
    task.cancelledAt ||
    (task.expiresAt && task.expiresAt < task.deletedAt)
  )
    return;

  /**
   * Calculate recipients: the assignees, except the citizen who deleted the
   * task
   */

  const assigneeIds = task.assignments
    .map((assignment) => assignment.citizenId)
    .filter((citizenId) => citizenId !== task.deletedById);
  if (assigneeIds.length <= 0) return;

  const recipientIds = await findCitizenIdsWithPermissions(
    { id: { in: assigneeIds } },
    TASK_RECEIVER_PERMISSION_SETS,
  );

  /**
   * Publish notifications
   */
  await publishNotifications(
    Array.from(recipientIds, (recipientId) => ({
      receiverId: recipientId,
      notificationType: "task_deleted" as const,
      payload: { taskTitle: task.title },
      title: "Task gelöscht",
      body: task.title,
    })),
  );
};
