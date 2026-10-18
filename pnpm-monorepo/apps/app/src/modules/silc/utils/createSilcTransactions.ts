import { triggerNotificationsAfterSave } from "@/modules/notifications/utils/triggerNotification";

/**
 * Notifies the receivers of the transactions that
 * `createSilcTransactionsInTransaction()` of the domain package created
 *
 * @returns `false` if the notifications failed (see
 * `triggerNotificationsAfterSave()`)
 */
export const announceSilcTransactions = async (
  transactionIds: readonly string[],
) => {
  if (transactionIds.length <= 0) return true;

  return triggerNotificationsAfterSave([
    {
      type: "SilcTransactionsCreated",
      payload: {
        transactionIds: [...transactionIds],
      },
    },
  ]);
};
