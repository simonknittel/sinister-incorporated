import { ACTIVE_CITIZEN_WHERE, AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { LineupErrorMessage } from "./lineupErrors.js";
import {
  requirePositionManager,
  requireUpdatableEventPosition,
} from "./lineupGuards.js";
import { toLineupPositionOutput, type LineupPosition } from "./lineupOutput.js";

export const assignEventPositionInputSchema = z.object({
  position_id: idSchema.describe(
    "A position of the lineup of an event (from get_event_lineup).",
  ),
  citizen_id: idSchema
    .nullable()
    .describe(
      "The citizen for the position, for example an applicant or a participant (from get_event). Null removes the assigned citizen.",
    ),
});

export type AssignEventPositionInput = z.infer<
  typeof assignEventPositionInputSchema
>;

/**
 * Assigns a citizen to a position of the lineup of an event that the actor
 * manages, or removes the assigned citizen. Like the lineup page, it does
 * not require that the citizen participates or applied.
 */
export const assignEventPosition = (
  context: ApplicationContext,
  actor: Actor,
  input: AssignEventPositionInput,
): Promise<LineupPosition> =>
  withSpan(context, "assignEventPosition", async () => {
    const position = await requireUpdatableEventPosition(
      context,
      input.position_id,
    );
    requirePositionManager(actor, position.event);

    if (input.citizen_id === null) {
      await context.prisma.eventPosition.update({
        where: { id: position.id },
        data: { citizen: { disconnect: true } },
      });

      if (position.citizenId)
        await context.audit.create([
          {
            type: AuditEventType.EVENT_POSITION_CITIZEN_REMOVED,
            data: {
              eventId: position.event.id,
              positionId: position.id,
              previousCitizenId: position.citizenId,
            },
            createdById: actor.userId,
          },
        ]);
    } else {
      const citizen = await context.prisma.citizen.findFirst({
        where: { id: input.citizen_id, ...ACTIVE_CITIZEN_WHERE },
        select: { id: true },
      });
      if (!citizen)
        throw new ValidationError(LineupErrorMessage.CitizenNotFound);

      await context.prisma.eventPosition.update({
        where: { id: position.id },
        data: { citizen: { connect: { id: citizen.id } } },
      });

      await context.audit.create([
        {
          type: AuditEventType.EVENT_POSITION_CITIZEN_ASSIGNED,
          data: {
            eventId: position.event.id,
            positionId: position.id,
            citizenId: citizen.id,
          },
          createdById: actor.userId,
        },
      ]);
    }

    return toLineupPositionOutput(context, position.id, true);
  });
