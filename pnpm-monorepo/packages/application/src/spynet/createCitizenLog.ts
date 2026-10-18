import { isPrismaError, PrismaErrorCode } from "@sam-monorepo/database/client";
import {
  ACTIVE_CITIZEN_WHERE,
  AuditEventType,
  lockCitizen,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import {
  CitizenErrorMessage,
  CitizenLogErrorMessage,
} from "./citizenErrors.js";
import { IDENTITY_LOG_TYPES } from "./identityLogTypes.js";

/**
 * An identity log holds a short value, for example a handle or an ID. The
 * column has no limit, thus the schema sets one.
 */
const IDENTITY_LOG_CONTENT_MAX_LENGTH = 255;

export const createCitizenLogInputSchema = z.discriminatedUnion("type", [
  z.object({
    citizen_id: idSchema,
    type: z.enum(IDENTITY_LOG_TYPES),
    content: z.string().trim().min(1).max(IDENTITY_LOG_CONTENT_MAX_LENGTH),
  }),
  z.object({
    citizen_id: idSchema,
    type: z.literal("note"),
    content: z.string().trim().min(1),
    note_type_id: idSchema,
    classification_level_id: idSchema,
  }),
]);

export type CreateCitizenLogInput = z.infer<typeof createCitizenLogInputSchema>;

export interface CreateCitizenLogOutput {
  readonly log_id: string;
  readonly citizen_id: string;
  readonly type: string;
}

/**
 * Adds an identity log or a note to an active citizen. An identity log
 * needs the create permission of its type, a note `note;create` for its note
 * type and classification level.
 *
 * @throws NotFoundError when the citizen, the note type or the
 * classification level does not exist or is deleted
 */
export const createCitizenLog = (
  context: ApplicationContext,
  actor: Actor,
  input: CreateCitizenLogInput,
): Promise<CreateCitizenLogOutput> =>
  withSpan(context, "createCitizenLog", async () => {
    if (input.type === "note")
      requirePermission(actor, "note", "create", [
        { key: "noteTypeId", value: input.note_type_id },
        { key: "classificationLevelId", value: input.classification_level_id },
      ]);
    else requirePermission(actor, input.type, "create");

    let createdLog;
    try {
      createdLog = await context.prisma.$transaction(async (transaction) => {
        await lockCitizen(transaction, input.citizen_id);

        const citizen = await transaction.citizen.findFirst({
          where: { id: input.citizen_id, ...ACTIVE_CITIZEN_WHERE },
          select: { id: true },
        });
        if (!citizen) return null;

        return transaction.citizenLog.create({
          data: {
            type: input.type,
            content: input.content,
            submittedBy: { connect: { id: actor.userId } },
            citizen: { connect: { id: citizen.id } },
            ...(input.type === "note"
              ? {
                  noteType: { connect: { id: input.note_type_id } },
                  classificationLevel: {
                    connect: { id: input.classification_level_id },
                  },
                }
              : {}),
          },
          select: { id: true, type: true, citizenId: true },
        });
      });
    } catch (error) {
      /**
       * A different user deleted the note type or the classification level
       * of the note
       */
      if (isPrismaError(error, PrismaErrorCode.RecordNotFound))
        throw new NotFoundError(
          CitizenLogErrorMessage.NoteClassificationNotFound,
          { cause: error },
        );
      throw error;
    }
    /** A different user deleted the citizen */
    if (!createdLog) throw new NotFoundError(CitizenErrorMessage.NotFound);

    await context.audit.create([
      {
        type: AuditEventType.ENTITY_LOG_CREATED,
        data: {
          entityId: createdLog.citizenId,
          logId: createdLog.id,
          logType: createdLog.type,
        },
        createdById: actor.userId,
      },
    ]);

    return {
      log_id: createdLog.id,
      citizen_id: createdLog.citizenId,
      type: createdLog.type,
    };
  });
