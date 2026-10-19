import {
  findSilcTransactionRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type SilcTransaction } from "@sam-monorepo/database";
import { publishNotifications } from "../publish";

interface Payload {
  transactionIds: SilcTransaction["id"][];
}

export const SilcTransactionsCreatedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const recipients = await findSilcTransactionRecipients(context, {
    transactionIds: payload.transactionIds,
  });

  await publishNotifications(
    context,
    recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "silc_transaction_created" as const,
      payload: {
        transactionId: recipient.transactionId,
        value: recipient.value,
        description: recipient.description,
      },
      title: "SILC-Transaktion erhalten",
      body: `${recipient.value.toLocaleString("de", { signDisplay: "always" })} SILC - ${recipient.description}`,
    })),
  );
};
