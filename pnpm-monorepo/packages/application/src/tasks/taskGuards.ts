import { TaskVisibility } from "@sam-monorepo/database/browser";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors.js";
import { findVisibleTask } from "./getTask.js";
import type { VisibleTask } from "./taskDetails.js";
import { TaskErrorMessage } from "./taskErrors.js";
import { isAllowedToManageTask, isTaskUpdatable } from "./taskRules.js";

/**
 * The guard of the task writes against a task that is gone or not open
 * anymore, for example because a different user deleted or completed it.
 * Requires `task;read` and a citizen.
 */
export const requireOpenTask = async (
  context: ApplicationContext,
  actor: Actor,
  taskId: string,
): Promise<VisibleTask> => {
  const task = await findVisibleTask(context, actor, taskId);
  if (!task) throw new NotFoundError(TaskErrorMessage.NotFound);
  if (!isTaskUpdatable(task, context.now()))
    throw new ConflictError(TaskErrorMessage.NotOpen);

  return task;
};

/**
 * The guard of the management writes: an open task (see `requireOpenTask()`)
 * that the actor can manage
 */
export const requireManageableTask = async (
  context: ApplicationContext,
  actor: Actor,
  taskId: string,
): Promise<VisibleTask> => {
  const task = await requireOpenTask(context, actor, taskId);
  if (!isAllowedToManageTask(actor, task))
    throw new ForbiddenError(
      "Only the creator of the task and task;manage can change it",
    );

  return task;
};

/**
 * The guard of the own assignment: an open public task. The creator assigns
 * the citizens of a group or personalized task.
 */
export const requireSelfAssignableTask = async (
  context: ApplicationContext,
  actor: Actor,
  taskId: string,
): Promise<VisibleTask> => {
  const task = await requireOpenTask(context, actor, taskId);
  if (task.visibility !== TaskVisibility.PUBLIC)
    throw new ValidationError(TaskErrorMessage.NotSelfAssignable);

  return task;
};
