import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { PenaltyEntryErrorMessage } from "./penaltyEntryErrors.js";
import {
  PENALTY_ENTRY_SELECT,
  toPenaltyEntryOutput,
  type PenaltyEntryOutput,
} from "./penaltyEntryOutput.js";

export const deletePenaltyEntryInputSchema = z.object({
  penalty_entry_id: idSchema.describe("The id of the penalty entry."),
});

/**
 * Soft-deletes a penalty entry and gives the entry after the deletion.
 * Requires `penaltyEntry;delete` and a citizen.
 *
 * @throws NotFoundError when the entry does not exist or is deleted already
 */
export const deletePenaltyEntry = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof deletePenaltyEntryInputSchema>,
): Promise<PenaltyEntryOutput> =>
  withSpan(context, "deletePenaltyEntry", async () => {
    requirePermission(actor, "penaltyEntry", "delete");
    const citizen = requireCitizen(actor);

    /**
     * The condition on `deletedAt` lets only one of two parallel requests
     * (a double click, a different tab) delete the entry. The other request
     * stops here and writes no audit event.
     */
    const [entry] = await context.prisma.penaltyEntry.updateManyAndReturn({
      where: { id: input.penalty_entry_id, deletedAt: null },
      data: { deletedAt: context.now(), deletedById: citizen.id },
      select: PENALTY_ENTRY_SELECT,
    });
    if (!entry) throw new NotFoundError(PenaltyEntryErrorMessage.NotFound);

    await context.audit.create([
      {
        type: AuditEventType.PENALTY_ENTRY_DELETED,
        data: {
          penaltyEntryId: entry.id,
          citizenId: entry.citizen.id,
          points: entry.points,
          reason: entry.reason,
        },
        createdById: actor.userId,
      },
    ]);

    return toPenaltyEntryOutput(entry);
  });
