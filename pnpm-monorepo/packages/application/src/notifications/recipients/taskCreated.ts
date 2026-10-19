import { TaskVisibility } from "@sam-monorepo/database/browser";
import { findCitizensWithPermissions } from "../../auth/effectivePermissionsOfCitizens.js";
import type { ApplicationContext } from "../../context.js";
import type { Recipient } from "./recipient.js";
import { TASK_RECEIVER_PERMISSION_SETS } from "./taskRecipients.js";

export enum TaskCreatedRecipientKind {
  /** A citizen who can take on the public task */
  PublicTask = "public_task",
  /** An assignee of a personalized or group task */
  Assignee = "assignee",
}

/** The recipients of one new task */
export interface TaskCreatedRecipientGroup {
  readonly task: { readonly id: string; readonly title: string };
  readonly kind: TaskCreatedRecipientKind;
  readonly recipients: Recipient[];
}

export interface FindTaskCreatedRecipientsInput {
  readonly taskIds: readonly string[];
}

/**
 * One group for each new task that is not deleted. A personalized or group
 * task notifies its assignees. A public task has no assignees yet: it
 * notifies each citizen who can take it on, except its creator. With required
 * roles, the effective roles of the citizen must include one of them (the
 * same rule as `hasCurrentUserRequiredRole` of the app), also when the task
 * is visible for other roles. `task;manage` shows all tasks, but it gives no
 * notification.
 */
export const findTaskCreatedRecipients = async (
  context: ApplicationContext,
  input: FindTaskCreatedRecipientsInput,
): Promise<TaskCreatedRecipientGroup[]> => {
  const tasks = await context.prisma.task.findMany({
    where: {
      id: {
        in: [...input.taskIds],
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
  if (tasks.length <= 0) return [];

  const receivers = await findCitizensWithPermissions(
    context,
    {},
    TASK_RECEIVER_PERMISSION_SETS,
  );

  return tasks.map((task): TaskCreatedRecipientGroup => {
    const taskReference = { id: task.id, title: task.title };

    switch (task.visibility) {
      case TaskVisibility.PUBLIC:
        return {
          task: taskReference,
          kind: TaskCreatedRecipientKind.PublicTask,
          recipients: Array.from(receivers)
            .filter(
              ([citizenId, { roleIds }]) =>
                citizenId !== task.createdById &&
                (task.requiredRoles.length === 0 ||
                  task.requiredRoles.some((role) => roleIds.has(role.id))),
            )
            .map(([citizenId]) => ({ citizenId })),
        };

      case TaskVisibility.PERSONALIZED:
      case TaskVisibility.GROUP:
        return {
          task: taskReference,
          kind: TaskCreatedRecipientKind.Assignee,
          recipients: task.assignments
            .filter((assignment) => receivers.has(assignment.citizenId))
            .map((assignment) => ({ citizenId: assignment.citizenId })),
        };

      default:
        throw new Error(
          `Unknown task visibility: ${task.visibility satisfies never}`,
        );
    }
  });
};
