import type { ConfirmationStatus } from "@sam-monorepo/database/client";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { IDENTITY_LOG_TYPES } from "./identityLogTypes.js";
import { getReadableCitizenLogWhere } from "./readableCitizenLogWhere.js";

export const listCitizenLogHistoryInputSchema = z.object({
  type: z.enum(IDENTITY_LOG_TYPES),
  citizen_id: idSchema,
});

export type ListCitizenLogHistoryInput = z.infer<
  typeof listCitizenLogHistoryInputSchema
>;

interface AuthorName {
  readonly name: string | null;
}

/** One entry of the history modal. Only the app uses it, thus camelCase. */
export interface CitizenLogHistoryEntry {
  readonly id: string;
  readonly citizenId: string;
  readonly type: string;
  readonly content: string | null;
  readonly createdAt: Date;
  readonly confirmed: ConfirmationStatus | null;
  readonly confirmedBy: AuthorName | null;
  readonly submittedBy: AuthorName | null;
}

/**
 * The logs of one identity type of a citizen, from the newest to the
 * oldest, with the same visibility as the Spynet log tables
 * (`getReadableCitizenLogWhere`). The history modal of the Spynet shows them.
 */
export const listCitizenLogHistory = async (
  context: ApplicationContext,
  actor: Actor,
  input: ListCitizenLogHistoryInput,
): Promise<CitizenLogHistoryEntry[]> => {
  const readableWhere = await getReadableCitizenLogWhere(context, actor, [
    input.type,
  ]);

  return context.prisma.citizenLog.findMany({
    where: { AND: [{ citizenId: input.citizen_id }, readableWhere] },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      citizenId: true,
      type: true,
      content: true,
      createdAt: true,
      confirmed: true,
      confirmedBy: { select: { name: true } },
      submittedBy: { select: { name: true } },
    },
  });
};
