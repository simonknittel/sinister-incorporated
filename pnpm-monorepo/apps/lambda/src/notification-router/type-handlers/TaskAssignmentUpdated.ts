import { prisma, type Task } from "@sam-monorepo/database";
import { findCitizenIdsWithPermissions } from "../../common/effectivePermissions";
import { publishNotifications } from "../publish";
import { TASK_RECEIVER_PERMISSION_SETS } from "../taskReceiverPermissionSets";

interface Payload {
  taskId: Task["id"];
}

export const TaskAssignmentUpdatedHandler = async (payload: Payload) => {
  // TODO: Only notify newly assigned citizens

  const task = await prisma.task.findUnique({
    where: { id: payload.taskId },
    select: {
      id: true,
      title: true,
      assignments: {
        select: {
          citizenId: true,
        },
      },
    },
  });
  if (!task || task.assignments.length <= 0) return;

  const recipientIds = await findCitizenIdsWithPermissions(
    {
      id: {
        in: task.assignments.map((assignment) => assignment.citizenId),
      },
    },
    TASK_RECEIVER_PERMISSION_SETS,
  );

  /**
   * Publish notifications
   */
  await publishNotifications(
    Array.from(recipientIds, (recipientId) => ({
      receiverId: recipientId,
      notificationType: "task_assignment_updated" as const,
      payload: { taskId: task.id, taskTitle: task.title },
      title: "Neuer Task",
      body: `Dir wurde ein Task zugewiesen: ${task.title}`,
      url: `/app/tasks/${task.id}`,
    })),
  );
};
