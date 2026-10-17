import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { requireManageableEventPosition } from "./lineupGuards.js";
import { toLineupPositionOutput, type LineupPosition } from "./lineupOutput.js";
import { deleteLineupPosition } from "./lineupWrites.js";

export const deleteEventPositionInputSchema = z.object({
  position_id: idSchema.describe(
    "A position of the lineup of an event (from get_event_lineup).",
  ),
});

export type DeleteEventPositionInput = z.infer<
  typeof deleteEventPositionInputSchema
>;

/**
 * Deletes a position and its children from the lineup of an event that the
 * actor manages. Gives the deleted position as it was before the deletion.
 */
export const deleteEventPosition = (
  context: ApplicationContext,
  actor: Actor,
  input: DeleteEventPositionInput,
): Promise<LineupPosition> =>
  withSpan(context, "deleteEventPosition", async () => {
    const { position, event } = await requireManageableEventPosition(
      context,
      actor,
      input.position_id,
    );

    const deletedPosition = await toLineupPositionOutput(
      context,
      position.id,
      true,
    );

    await deleteLineupPosition(context, position.id);

    await context.audit.create([
      {
        type: AuditEventType.EVENT_POSITION_DELETED,
        data: {
          eventId: event.id,
          positionId: position.id,
          name: position.name,
        },
        createdById: actor.userId,
      },
    ]);

    return deletedPosition;
  });
