import {
  findPayoutDisbursedRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { publishNotifications } from "../publish";

interface Change {
  citizenId: string;
  attribute: string;
  enabled: boolean;
}

interface Payload {
  cycleId: string;
  changes: Change[];
}

export const ProfitDistributionPayoutDisbursedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findPayoutDisbursedRecipients(context, {
    cycleId: payload.cycleId,
    changes: payload.changes,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "sincome_payout_disbursed" as const,
      payload: {
        cycleId: result.cycle.id,
        cycleTitle: result.cycle.title,
        auecAmount: recipient.auecAmount,
      },
      title: "SINcome-Auszahlung erhalten",
      body: `Für den Zeitraum ${result.cycle.title} hast du eine Auszahlung in Höhe von ${recipient.auecAmount.toLocaleString("de-DE")} aUEC erhalten.`,
      url: `/app/sincome/${result.cycle.id}`,
    })),
  );
};
