import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { taskIdSchema } from "./getTask.js";
import { findTaskOutput, type GetTaskOutput } from "./taskDetails.js";
import { requireManageableTask } from "./taskGuards.js";

export const cancelTaskInputSchema = z.object({
  task_id: taskIdSchema,
});

export type CancelTaskInput = z.infer<typeof cancelTaskInputSchema>;

/**
 * Cancels an open task. Requires `task;read`, a citizen, and that the actor
 * created the task or has `task;manage`.
 */
export const cancelTask = (
  context: ApplicationContext,
  actor: Actor,
  input: CancelTaskInput,
): Promise<GetTaskOutput> =>
  withSpan(context, "cancelTask", async () => {
    const citizen = requireCitizen(actor);
    const task = await requireManageableTask(context, actor, input.task_id);

    await context.prisma.task.update({
      where: { id: task.id },
      data: { cancelledAt: context.now(), cancelledById: citizen.id },
    });

    await context.audit.create([
      {
        type: AuditEventType.TASK_CANCELLED,
        data: { taskId: task.id, title: task.title },
        createdById: actor.userId,
      },
    ]);

    return findTaskOutput(context, actor, task.id);
  });
