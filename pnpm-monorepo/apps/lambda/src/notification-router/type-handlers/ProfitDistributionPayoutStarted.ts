import {
  findPayoutStartedRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { publishNotifications } from "../publish";

interface Payload {
  cycleId: string;
}

export const ProfitDistributionPayoutStartedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findPayoutStartedRecipients(context, {
    cycleId: payload.cycleId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "sincome_payout_started" as const,
      payload: { cycleId: result.cycle.id, cycleTitle: result.cycle.title },
      title: "SINcome-Auszahlung gestartet",
      body: `Die Auszahlungsphase für den Zeitraum ${result.cycle.title} wurde gestartet. Bitte stimme der Auszahlung zu.`,
      url: `/app/sincome/${result.cycle.id}`,
    })),
  );
};
