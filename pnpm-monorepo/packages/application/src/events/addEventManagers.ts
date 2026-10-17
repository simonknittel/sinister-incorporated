import { EventActivityType } from "@sam-monorepo/database/browser";
import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { createEventActivity } from "./eventActivity.js";
import { EVENT_MAX_CITIZENS_PER_REQUEST } from "./eventConstraints.js";
import { EventValidationError, EventValidationProblem } from "./eventErrors.js";
import {
  requireManageableEvent,
  VISIBLE_EVENT_MANAGE_GUARD_SELECT,
} from "./eventManageGuard.js";
import { isAllowedToManageEvent } from "./eventManageRules.js";
import { canActorSeeEvent } from "./eventVisibility.js";
import { loadEventOutput, type GetEventOutput } from "./getEvent.js";
import { isPrismaError, PrismaErrorCode } from "./prismaErrors.js";

export const addEventManagersInputSchema = z.object({
  event_id: idSchema,
  citizen_ids: z
    .array(idSchema)
    .max(EVENT_MAX_CITIZENS_PER_REQUEST)
    .describe(
      "The citizens who become managers. Managers can change the event, its participants, its managers and its lineup. Citizens who already manage the event are skipped.",
    ),
});

export type AddEventManagersInput = z.infer<typeof addEventManagersInputSchema>;

/** Makes citizens managers of an event */
export const addEventManagers = (
  context: ApplicationContext,
  actor: Actor,
  input: AddEventManagersInput,
): Promise<GetEventOutput> =>
  withSpan(context, "addEventManagers", async () => {
    /**
     * Authorize the request
     */
    const event = await context.prisma.event.findUnique({
      where: {
        id: input.event_id,
        deletedAt: null,
      },
      select: VISIBLE_EVENT_MANAGE_GUARD_SELECT,
    });
    if (!event || !canActorSeeEvent(actor, event))
      throw new NotFoundError("The event does not exist");
    requireManageableEvent(context, actor, event, isAllowedToManageEvent);

    const actingManagerId = actor.citizen?.id ?? null;

    /**
     * `connect` is idempotent, so a citizen who already manages the event
     * would otherwise get an activity entry for a change that never happened.
     */
    const existingManagerIds = new Set(
      event.managers.map((manager) => manager.id),
    );
    const managerIdsToAdd = Array.from(new Set(input.citizen_ids)).filter(
      (managerId) => !existingManagerIds.has(managerId),
    );

    /**
     * Create managers. One transaction, so the activity entries cannot get
     * lost while the assignment goes through.
     */
    try {
      await context.prisma.$transaction(async (transaction) => {
        await transaction.event.update({
          where: {
            id: event.id,
          },
          data: {
            managers: {
              connect: managerIdsToAdd.map((managerId) => ({
                id: managerId,
              })),
            },
          },
        });

        for (const managerId of managerIdsToAdd)
          await createEventActivity(transaction, {
            eventId: event.id,
            citizenId: actingManagerId,
            type: EventActivityType.MANAGER_ADDED,
            payload: { citizenId: managerId },
          });
      });
    } catch (error) {
      // A `connect` to a citizen that does not exist
      if (isPrismaError(error, PrismaErrorCode.RecordNotFound))
        throw new EventValidationError(EventValidationProblem.UnknownCitizen);
      throw error;
    }

    await context.audit.create([
      {
        type: AuditEventType.EVENT_MANAGERS_ASSIGNED,
        data: {
          eventId: event.id,
          managerIds: input.citizen_ids,
        },
        createdById: actor.userId,
      },
    ]);

    return loadEventOutput(context, actor, event.id);
  });
