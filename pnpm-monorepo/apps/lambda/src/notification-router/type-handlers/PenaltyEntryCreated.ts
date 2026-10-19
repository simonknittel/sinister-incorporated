import {
  findPenaltyEntryRecipient,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type PenaltyEntry } from "@sam-monorepo/database";
import { publishNotifications } from "../publish";

interface Payload {
  penaltyEntryId: PenaltyEntry["id"];
}

export const PenaltyEntryCreatedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findPenaltyEntryRecipient(context, {
    penaltyEntryId: payload.penaltyEntryId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "penalty_entry_created" as const,
      payload: {
        points: result.penaltyEntry.points,
        reason: result.penaltyEntry.reason,
      },
      title: "Strafpunkte erhalten",
      body: `Du hast ${result.penaltyEntry.points} Strafpunkte erhalten für ${result.penaltyEntry.reason}`,
    })),
  );
};
