import { AuditEventType, lockCitizen } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { CitizenLogErrorMessage } from "./citizenErrors.js";
import { syncCitizenIdentityAfterLogChange } from "./citizenIdentitySync.js";
import {
  authorizeCitizenLogOperation,
  getCheckedLogWhere,
  requireActiveCitizenLog,
} from "./citizenLogGuard.js";

export const deleteCitizenLogInputSchema = z.object({
  log_id: idSchema,
});

export type DeleteCitizenLogInput = z.infer<typeof deleteCitizenLogInputSchema>;

export interface DeleteCitizenLogOutput {
  readonly log_id: string;
  readonly citizen_id: string;
}

/**
 * Deletes a log of an active citizen. An identity log needs the delete
 * permission of its type, a note `note;delete` for its classification.
 *
 * @throws NotFoundError when the log does not exist, its citizen is deleted,
 * or a different user changed the log after the check
 * @throws ValidationError for a log type that nobody deletes
 */
export const deleteCitizenLog = (
  context: ApplicationContext,
  actor: Actor,
  input: DeleteCitizenLogInput,
): Promise<DeleteCitizenLogOutput> =>
  withSpan(context, "deleteCitizenLog", async () => {
    const citizenLog = await requireActiveCitizenLog(context, input.log_id);
    authorizeCitizenLogOperation(actor, citizenLog, "delete");

    const isDeleted = await context.prisma.$transaction(async (transaction) => {
      await lockCitizen(transaction, citizenLog.citizenId);

      const { count } = await transaction.citizenLog.deleteMany({
        where: {
          ...getCheckedLogWhere(citizenLog),
          confirmed: citizenLog.confirmed,
        },
      });
      if (count === 0) return false;

      /** The copies of the confirmed values change in the same transaction */
      await syncCitizenIdentityAfterLogChange(transaction, citizenLog);
      return true;
    });
    if (!isDeleted) throw new NotFoundError(CitizenLogErrorMessage.NotFound);

    await context.audit.create([
      {
        type: AuditEventType.ENTITY_LOG_DELETED,
        data: {
          entityId: citizenLog.citizenId,
          logId: citizenLog.id,
          logType: citizenLog.type,
        },
        createdById: actor.userId,
      },
    ]);

    return { log_id: citizenLog.id, citizen_id: citizenLog.citizenId };
  });
