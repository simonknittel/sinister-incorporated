import { Prisma } from "@sam-monorepo/database/client";
import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, ForbiddenError } from "../errors.js";
import { withSpan } from "../withSpan.js";
import { taskIdSchema } from "./getTask.js";
import { findTaskOutput, type TaskWriteOutput } from "./taskDetails.js";
import { TaskErrorMessage } from "./taskErrors.js";
import { requireSelfAssignableTask } from "./taskGuards.js";

/** The Prisma error code of a failed unique constraint */
const UNIQUE_CONSTRAINT_FAILED = "P2002";

export const acceptTaskInputSchema = z.object({
  task_id: taskIdSchema,
});

export type AcceptTaskInput = z.infer<typeof acceptTaskInputSchema>;

/**
 * Assigns the citizen of the actor to an open public task. Requires
 * `task;read`, a citizen, a free place and one of the required roles.
 */
export const acceptTask = (
  context: ApplicationContext,
  actor: Actor,
  input: AcceptTaskInput,
): Promise<TaskWriteOutput> =>
  withSpan(context, "acceptTask", async () => {
    const citizen = requireCitizen(actor);
    const task = await requireSelfAssignableTask(context, actor, input.task_id);

    if (task.assignmentLimit && task.assignments.length >= task.assignmentLimit)
      throw new ConflictError(TaskErrorMessage.AssignmentLimitReached);

    if (!task.hasCurrentUserRequiredRole)
      throw new ForbiddenError(TaskErrorMessage.MissingRequiredRole);

    try {
      await context.prisma.taskAssignment.create({
        data: {
          taskId: task.id,
          citizenId: citizen.id,
          createdById: citizen.id,
        },
      });
    } catch (error) {
      // For example a different tab of the user accepted the task before
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_FAILED
      )
        throw new ConflictError(TaskErrorMessage.AlreadyAccepted, {
          cause: error,
        });

      throw error;
    }

    await context.audit.create([
      {
        type: AuditEventType.TASK_SELF_ASSIGNMENT_CREATED,
        data: { taskId: task.id, citizenId: citizen.id },
        createdById: actor.userId,
      },
    ]);

    return { task: await findTaskOutput(context, actor, task.id) };
  });
