import { EventActivityType } from "@sam-monorepo/database/browser";
import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { cancelParticipation } from "./cancelParticipation.js";
import { createEventActivity } from "./eventActivity.js";
import { EventConflict, EventConflictError } from "./eventErrors.js";
import { participationTextSchema } from "./eventInputSchemas.js";
import { requireManageableEvent } from "./eventManageGuard.js";
import { isAllowedToManageEvent } from "./eventManageRules.js";
import { loadEventOutput, type GetEventOutput } from "./getEvent.js";
import { findActiveParticipation } from "./ownParticipation.js";
import { requireParticipatableAppEvent } from "./participatableAppEvent.js";

export const removeEventParticipantInputSchema = z.object({
  event_id: idSchema,
  citizen_id: idSchema,
  reason: participationTextSchema
    .optional()
    .describe(
      "Why the citizen is removed. The citizen gets it in the notification.",
    ),
});

export type RemoveEventParticipantInput = z.infer<
  typeof removeEventParticipantInputSchema
>;

export interface RemoveEventParticipantOutput {
  readonly event: GetEventOutput;
  /**
   * False when the participant is removed, but the notification failed. The
   * removal stands.
   */
  readonly notifications_sent: boolean;
}

/**
 * A manager cancels the sign-up of a citizen for an app event. The position
 * applications and the lineup assignments of the citizen at the event go
 * with it, and the citizen gets a notification.
 */
export const removeEventParticipant = (
  context: ApplicationContext,
  actor: Actor,
  input: RemoveEventParticipantInput,
): Promise<RemoveEventParticipantOutput> =>
  withSpan(context, "removeEventParticipant", async () => {
    requirePermission(actor, "event", "read");

    /**
     * Authorize the request
     */
    const event = await requireParticipatableAppEvent(
      context,
      actor,
      input.event_id,
    );
    requireManageableEvent(context, actor, event, isAllowedToManageEvent);

    const managerId = actor.citizen?.id ?? null;

    const participant = await findActiveParticipation(
      context,
      event.id,
      input.citizen_id,
    );

    /**
     * The manager as the canceller is the only thing on the row telling a
     * manager removal from a self-cancel.
     */
    const reason = input.reason || null;

    const isCancelled =
      participant !== null &&
      (await context.prisma.$transaction(async (transaction) => {
        if (
          !(await cancelParticipation(transaction, {
            participantId: participant.id,
            eventId: event.id,
            citizenId: input.citizen_id,
            cancelledById: managerId,
            cancelledAt: context.now(),
          }))
        )
          return false;

        await createEventActivity(transaction, {
          eventId: event.id,
          citizenId: managerId,
          type: EventActivityType.PARTICIPATION_REMOVED_BY_MANAGER,
          payload: { citizenId: input.citizen_id, reason },
        });
        return true;
      }));

    /**
     * The citizen or a different manager cancelled the participation before
     */
    if (!isCancelled)
      throw new EventConflictError(EventConflict.CitizenNotSignedUp);

    await context.audit.create([
      {
        type: AuditEventType.EVENT_PARTICIPANT_REMOVED_BY_MANAGER,
        data: {
          eventId: event.id,
          citizenId: input.citizen_id,
        },
        createdById: actor.userId,
      },
    ]);

    const notificationsSent = await triggerNotificationsAfterSave(context, [
      {
        type: "EventParticipationRemoved",
        payload: {
          eventId: event.id,
          citizenId: input.citizen_id,
          reason,
        },
      },
    ]);

    return {
      event: await loadEventOutput(context, actor, event.id),
      notifications_sent: notificationsSent,
    };
  });
