import { isTaskUpdatable as isTaskUpdatableAt } from "@sam-monorepo/application";
import type { Task } from "@sam-monorepo/database/client";

/** Whether the task is still open now (see the rule of the application package) */
export const isTaskUpdatable = (
  task: Pick<Task, "completedAt" | "deletedAt" | "cancelledAt" | "expiresAt">,
) => isTaskUpdatableAt(task, new Date());
