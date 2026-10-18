import { EventActivityType } from "@sam-monorepo/database/browser";
import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { createEventActivity } from "./eventActivity.js";
import { EventErrorMessage } from "./eventErrors.js";
import {
  requireManageableEvent,
  VISIBLE_EVENT_MANAGE_GUARD_SELECT,
} from "./eventManageGuard.js";
import { isAllowedToManageEvent } from "./eventManageRules.js";
import { loadEventOutput, type GetEventOutput } from "./getEvent.js";

export const removeEventManagerInputSchema = z.object({
  event_id: idSchema,
  citizen_id: idSchema.describe("A manager of the event."),
});

export type RemoveEventManagerInput = z.infer<
  typeof removeEventManagerInputSchema
>;

/**
 * Takes the manager role of the event from a citizen. The creator of the
 * event stays its organizer.
 */
export const removeEventManager = (
  context: ApplicationContext,
  actor: Actor,
  input: RemoveEventManagerInput,
): Promise<GetEventOutput> =>
  withSpan(context, "removeEventManager", async () => {
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
    if (!event) throw new NotFoundError(EventErrorMessage.NotFound);
    requireManageableEvent(context, actor, event, isAllowedToManageEvent);

    const actingManagerId = actor.citizen?.id ?? null;

    /**
     * `disconnect` is idempotent, so without this check a repeated removal
     * would get an activity entry for a change that never happened. A
     * different tab or manager removed the citizen before.
     */
    const isManager = event.managers.some(
      (manager) => manager.id === input.citizen_id,
    );
    if (!isManager)
      throw new ConflictError(EventErrorMessage.CitizenNotManager);

    /**
     * Delete manager. One transaction, so the activity entry cannot get lost
     * while the removal goes through.
     */
    await context.prisma.$transaction(async (transaction) => {
      await transaction.event.update({
        where: {
          id: event.id,
        },
        data: {
          managers: {
            disconnect: {
              id: input.citizen_id,
            },
          },
        },
      });

      await createEventActivity(transaction, {
        eventId: event.id,
        citizenId: actingManagerId,
        type: EventActivityType.MANAGER_REMOVED,
        payload: { citizenId: input.citizen_id },
      });
    });

    await context.audit.create([
      {
        type: AuditEventType.EVENT_MANAGER_REMOVED,
        data: {
          eventId: event.id,
          managerId: input.citizen_id,
        },
        createdById: actor.userId,
      },
    ]);

    return loadEventOutput(context, actor, event.id);
  });
