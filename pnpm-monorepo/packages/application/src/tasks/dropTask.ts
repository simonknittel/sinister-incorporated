import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError } from "../errors.js";
import { withSpan } from "../withSpan.js";
import { taskIdSchema } from "./getTask.js";
import { findTaskOutput, type TaskWriteOutput } from "./taskDetails.js";
import { TaskErrorMessage } from "./taskErrors.js";
import { requireSelfAssignableTask } from "./taskGuards.js";

export const dropTaskInputSchema = z.object({
  task_id: taskIdSchema,
});

export type DropTaskInput = z.infer<typeof dropTaskInputSchema>;

/**
 * Removes the assignment of the citizen of the actor from an open public
 * task. Requires `task;read` and a citizen.
 */
export const dropTask = (
  context: ApplicationContext,
  actor: Actor,
  input: DropTaskInput,
): Promise<TaskWriteOutput> =>
  withSpan(context, "dropTask", async () => {
    const citizen = requireCitizen(actor);
    const task = await requireSelfAssignableTask(context, actor, input.task_id);

    const { count } = await context.prisma.taskAssignment.deleteMany({
      where: { taskId: task.id, citizenId: citizen.id },
    });
    // For example a different tab of the user dropped the task before
    if (count === 0) throw new ConflictError(TaskErrorMessage.NotAccepted);

    await context.audit.create([
      {
        type: AuditEventType.TASK_SELF_ASSIGNMENT_DELETED,
        data: { taskId: task.id, citizenId: citizen.id },
        createdById: actor.userId,
      },
    ]);

    return { task: await findTaskOutput(context, actor, task.id) };
  });
