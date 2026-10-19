import { findCitizenIdsWithPermissions } from "../../auth/effectivePermissionsOfCitizens.js";
import type { ApplicationContext } from "../../context.js";
import type { Recipient } from "./recipient.js";
import { TASK_RECEIVER_PERMISSION_SETS } from "./taskRecipients.js";

export interface FindTaskAssignmentRecipientsInput {
  readonly taskId: string;
}

export interface TaskAssignmentRecipients {
  readonly task: { readonly id: string; readonly title: string };
  readonly recipients: Recipient[];
}

/**
 * The assignees of the task who can log in and open tasks. Null when the
 * task does not exist or has no assignee.
 */
export const findTaskAssignmentRecipients = async (
  context: ApplicationContext,
  input: FindTaskAssignmentRecipientsInput,
): Promise<TaskAssignmentRecipients | null> => {
  // TODO: Only notify newly assigned citizens

  const task = await context.prisma.task.findUnique({
    where: { id: input.taskId },
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
  if (!task || task.assignments.length <= 0) return null;

  const recipientIds = await findCitizenIdsWithPermissions(
    context,
    {
      id: {
        in: task.assignments.map((assignment) => assignment.citizenId),
      },
    },
    TASK_RECEIVER_PERMISSION_SETS,
  );

  return {
    task: { id: task.id, title: task.title },
    recipients: Array.from(recipientIds, (citizenId) => ({ citizenId })),
  };
};
