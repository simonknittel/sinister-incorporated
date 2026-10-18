import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";

/**
 * A new booking goes only to citizens that are not deleted: all lists hide a
 * deleted citizen, thus nobody could see the booking. The ledger keeps the
 * bookings that a citizen got before the delete.
 */
export const areActiveReceivers = async (
  prisma: ApplicationContext["prisma"],
  receiverIds: readonly string[],
): Promise<boolean> => {
  const uniqueReceiverIds = [...new Set(receiverIds)];
  const activeCount = await prisma.citizen.count({
    where: { id: { in: uniqueReceiverIds }, ...ACTIVE_CITIZEN_WHERE },
  });

  return activeCount === uniqueReceiverIds.length;
};

/**
 * Notifies the receivers of new SILC transactions. Call it after the commit
 * of the ledger write.
 *
 * @returns `true` without transactions, `false` if the notifications failed
 * (see `triggerNotificationsAfterSave()`)
 */
export const announceSilcTransactions = async (
  context: ApplicationContext,
  transactionIds: readonly string[],
): Promise<boolean> => {
  if (transactionIds.length === 0) return true;

  return triggerNotificationsAfterSave(context, [
    {
      type: "SilcTransactionsCreated",
      payload: { transactionIds },
    },
  ]);
};
