import { findCitizenIdsWithPermissions } from "../../auth/effectivePermissionsOfCitizens.js";
import type { ApplicationContext } from "../../context.js";
import type { Recipient } from "./recipient.js";
import { TASK_RECEIVER_PERMISSION_SETS } from "./taskRecipients.js";

export interface FindTaskDeletedRecipientsInput {
  readonly taskId: string;
}

export interface TaskDeletedRecipients {
  readonly task: { readonly title: string };
  readonly recipients: Recipient[];
}

/**
 * The assignees of the deleted task who can log in and open tasks, except
 * the citizen who deleted the task. Null when the task does not exist, is not
 * deleted or was closed before the deletion.
 */
export const findTaskDeletedRecipients = async (
  context: ApplicationContext,
  input: FindTaskDeletedRecipientsInput,
): Promise<TaskDeletedRecipients | null> => {
  const task = await context.prisma.task.findUnique({
    where: {
      id: input.taskId,
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
  if (!task?.deletedAt) return null;

  /**
   * The deletion of a closed task only cleans up, thus it notifies nobody.
   * The rule of `isTaskUpdatable()` of the app, at the time of the deletion.
   */
  if (
    task.completedAt ||
    task.cancelledAt ||
    (task.expiresAt && task.expiresAt < task.deletedAt)
  )
    return null;

  const assigneeIds = task.assignments
    .map((assignment) => assignment.citizenId)
    .filter((citizenId) => citizenId !== task.deletedById);
  if (assigneeIds.length <= 0)
    return { task: { title: task.title }, recipients: [] };

  const recipientIds = await findCitizenIdsWithPermissions(
    context,
    { id: { in: assigneeIds } },
    TASK_RECEIVER_PERMISSION_SETS,
  );

  return {
    task: { title: task.title },
    recipients: Array.from(recipientIds, (citizenId) => ({ citizenId })),
  };
};
