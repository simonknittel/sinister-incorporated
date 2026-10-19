import { findCitizenIdsWithPermissions } from "../../auth/effectivePermissionsOfCitizens.js";
import type { ApplicationContext } from "../../context.js";
import type { Recipient } from "./recipient.js";

export interface FindPenaltyEntryRecipientInput {
  readonly penaltyEntryId: string;
}

export interface PenaltyEntryRecipients {
  readonly penaltyEntry: {
    readonly points: number;
    readonly reason: string | null;
  };
  readonly recipients: Recipient[];
}

/**
 * The citizen of the penalty entry, when the citizen can log in and read the
 * own penalty entries. Null when the penalty entry does not exist.
 */
export const findPenaltyEntryRecipient = async (
  context: ApplicationContext,
  input: FindPenaltyEntryRecipientInput,
): Promise<PenaltyEntryRecipients | null> => {
  const penaltyEntry = await context.prisma.penaltyEntry.findUnique({
    where: {
      id: input.penaltyEntryId,
    },
    select: {
      points: true,
      reason: true,
      citizenId: true,
    },
  });
  if (!penaltyEntry) return null;

  const recipientIds = await findCitizenIdsWithPermissions(
    context,
    { id: penaltyEntry.citizenId },
    [
      { resource: "login", operation: "manage" },
      { resource: "ownPenaltyEntry", operation: "read" },
    ],
  );

  return {
    penaltyEntry: { points: penaltyEntry.points, reason: penaltyEntry.reason },
    recipients: recipientIds.has(penaltyEntry.citizenId)
      ? [{ citizenId: penaltyEntry.citizenId }]
      : [],
  };
};
