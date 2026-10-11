import { prisma, TaskVisibility, type Task } from "@sam-monorepo/database";
import { findCitizensWithPermissions } from "../../common/effectivePermissions";
import { type Notification } from "../notification";
import { publishNotifications } from "../publish";
import { TASK_RECEIVER_PERMISSION_SETS } from "../taskReceiverPermissionSets";

interface Payload {
  taskIds: Task["id"][];
}

export const TaskCreatedHandler = async (payload: Payload) => {
  const tasks = await prisma.task.findMany({
    where: {
      id: {
        in: payload.taskIds,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      visibility: true,
      createdById: true,
      requiredRoles: {
        select: {
          id: true,
        },
      },
      assignments: {
        select: {
          citizenId: true,
        },
      },
    },
  });
  if (tasks.length <= 0) return;

  const receivers = await findCitizensWithPermissions(
    {},
    TASK_RECEIVER_PERMISSION_SETS,
  );

  /**
   * Calculate recipients: a personalized or group task notifies its
   * assignees. A public task has no assignees yet: it notifies each citizen
   * who can take it on, except its creator. With required roles, the
   * effective roles of the citizen must include one of them (the same rule
   * as `hasCurrentUserRequiredRole` of the app), also when the task is
   * visible for other roles. `task;manage` shows all tasks, but it gives no
   * notification.
   */
  const notifications = tasks.flatMap((task): Notification[] => {
    switch (task.visibility) {
      case TaskVisibility.PUBLIC:
        return Array.from(receivers)
          .filter(
            ([citizenId, { roleIds }]) =>
              citizenId !== task.createdById &&
              (task.requiredRoles.length === 0 ||
                task.requiredRoles.some((role) => roleIds.has(role.id))),
          )
          .map(([citizenId]) => ({
            receiverId: citizenId,
            notificationType: "task_created",
            payload: { taskId: task.id, taskTitle: task.title },
            title: "Neuer Task",
            body: task.title,
            url: `/app/tasks/${task.id}`,
          }));

      case TaskVisibility.PERSONALIZED:
      case TaskVisibility.GROUP:
        return task.assignments
          .filter((assignment) => receivers.has(assignment.citizenId))
          .map((assignment) => ({
            receiverId: assignment.citizenId,
            notificationType: "task_assignment_updated",
            payload: { taskId: task.id, taskTitle: task.title },
            title: "Neuer Task",
            body: `Dir wurde ein Task zugewiesen: ${task.title}`,
            url: `/app/tasks/${task.id}`,
          }));

      default:
        throw new Error(
          `Unknown task visibility: ${task.visibility satisfies never}`,
        );
    }
  });

  /**
   * Publish notifications
   */
  await publishNotifications(notifications);
};
