import type { Role, Task } from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";

export enum TaskStatus {
  Open = "open",
  Completed = "completed",
  Cancelled = "cancelled",
  Expired = "expired",
}

/** The creator of a task and `task;manage` can change it */
export const isAllowedToManageTask = (
  actor: Actor,
  task: Pick<Task, "createdById">,
) =>
  task.createdById === actor.citizen?.id || actor.authorize("task", "manage");

/**
 * A task with required roles is only for the citizens who have one of them as
 * an effective role. A task without required roles is for each citizen.
 */
export const hasRequiredRole = (
  requiredRoles: readonly Pick<Role, "id">[],
  roleIds: ReadonlySet<string>,
) =>
  requiredRoles.length === 0 ||
  requiredRoles.some((role) => roleIds.has(role.id));

/** Only an open task can change */
export const isTaskUpdatable = (
  task: Pick<Task, "completedAt" | "deletedAt" | "cancelledAt" | "expiresAt">,
  now: Date,
) => {
  if (task.completedAt) return false;
  if (task.deletedAt || task.cancelledAt) return false;
  if (task.expiresAt && task.expiresAt < now) return false;

  return true;
};

/**
 * The status of a task that is not deleted. The order of the checks is the
 * order of the closed tasks list: the completion, then the cancellation, then
 * the expiry.
 */
export const getTaskStatus = (
  task: Pick<Task, "completedAt" | "cancelledAt" | "expiresAt">,
  now: Date,
): TaskStatus => {
  if (task.completedAt) return TaskStatus.Completed;
  if (task.cancelledAt) return TaskStatus.Cancelled;
  if (task.expiresAt && task.expiresAt < now) return TaskStatus.Expired;

  return TaskStatus.Open;
};
