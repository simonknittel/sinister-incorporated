import { ReadMarkerSubject } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import {
  toCitizenReferences,
  type CitizenReference,
} from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { buildUnreadWhere } from "../readMarkers/unreadWhere.js";
import { withSpan } from "../withSpan.js";
import { findNewTaskIds } from "./findNewTaskIds.js";
import { TASK_DETAILS_INCLUDE, type TaskDetailsRow } from "./taskListSelect.js";
import { toTaskListItem, type TaskListItem } from "./taskOutput.js";
import { isAllowedToManageTask, isTaskUpdatable } from "./taskRules.js";
import { getVisibleTasksWhere } from "./taskWhere.js";

export const getTaskInputSchema = z.object({
  task_id: idSchema.describe(
    "The id of the task, for example from list_tasks.",
  ),
});

export type GetTaskInput = z.output<typeof getTaskInputSchema>;

export interface TaskRoleReference {
  readonly id: string;
  readonly name: string;
}

export interface GetTaskOutput extends TaskListItem {
  /** The citizens that completed the task, without the deleted citizens */
  readonly completionists: CitizenReference[];
  /**
   * The roles that a citizen must have to accept the task. Only the roles
   * that the user can see.
   */
  readonly required_roles: TaskRoleReference[];
  /** Whether the user has one of the required roles, or no role is required */
  readonly has_required_role: boolean;
  /** Whether the user can change, complete and cancel the task */
  readonly can_manage: boolean;
  /** Whether the task is still open, thus it can change */
  readonly is_updatable: boolean;
  /** How often the task can be completed */
  readonly repeatable: number;
  /** Whether only the citizens with a required role can see the task */
  readonly hidden_for_other_roles: boolean;
  /** The maximum number of citizens that can accept the task */
  readonly assignment_limit: number | null;
}

export type VisibleTask = TaskDetailsRow & {
  /**
   * The role rule of the self-assignment, with the effective roles of the
   * citizen of the actor
   */
  readonly hasCurrentUserRequiredRole: boolean;
};

/**
 * Loads a task that the actor can see, with the relations of the task page.
 * Requires `task;read` and a citizen. `getTask` maps the row to its output.
 * The app wrapper of the task page keeps the row, because the page and the
 * task actions use it.
 *
 * @returns null when the task does not exist, is deleted, or is not visible
 * for the actor
 */
export const findVisibleTask = async (
  context: ApplicationContext,
  actor: Actor,
  taskId: string,
): Promise<VisibleTask | null> => {
  requirePermission(actor, "task", "read");

  const task = await context.prisma.task.findFirst({
    where: {
      AND: [{ id: taskId, deletedAt: null }, getVisibleTasksWhere(actor)],
    },
    include: TASK_DETAILS_INCLUDE,
  });
  if (!task) return null;

  return {
    ...task,
    hasCurrentUserRequiredRole:
      task.requiredRoles.length === 0 ||
      task.requiredRoles.some((role) => actor.roleIds.has(role.id)),
  };
};

/**
 * Loads the names of the required roles that the actor can see. The app
 * shows only these roles (see the role badges).
 */
const findReadableRequiredRoles = async (
  context: ApplicationContext,
  actor: Actor,
  task: VisibleTask,
): Promise<TaskRoleReference[]> => {
  const readableRoleIds = task.requiredRoles
    .map((role) => role.id)
    .filter((roleId) =>
      actor.authorize("otherRole", "read", [{ key: "roleId", value: roleId }]),
    );
  if (readableRoleIds.length <= 0) return [];

  return context.prisma.role.findMany({
    where: { id: { in: readableRoleIds } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};

/**
 * One task that the actor can see, with its details. Requires `task;read`
 * and a citizen. Throws a `NotFoundError` when the task does not exist or the
 * actor cannot see it.
 */
export const getTask = (
  context: ApplicationContext,
  actor: Actor,
  input: GetTaskInput,
): Promise<GetTaskOutput> =>
  withSpan(context, "getTask", async () => {
    const task = await findVisibleTask(context, actor, input.task_id);
    if (!task)
      throw new NotFoundError(
        "The task does not exist or the user cannot see it",
      );

    const now = context.now();
    const unreadWhere = buildUnreadWhere(actor, ReadMarkerSubject.Task);
    const [isNew, requiredRoles] = await Promise.all([
      unreadWhere
        ? findNewTaskIds(context.prisma, [task.id], unreadWhere, now).then(
            (newTaskIds) => newTaskIds.length > 0,
          )
        : false,
      findReadableRequiredRoles(context, actor, task),
    ]);

    return {
      ...toTaskListItem(task, { actor, now, isNew }),
      completionists: toCitizenReferences(task.completionists),
      required_roles: requiredRoles,
      has_required_role: task.hasCurrentUserRequiredRole,
      can_manage: isAllowedToManageTask(actor, task),
      is_updatable: isTaskUpdatable(task, now),
      repeatable: task.repeatable,
      hidden_for_other_roles: task.hiddenForOtherRoles,
      assignment_limit: task.assignmentLimit,
    };
  });
