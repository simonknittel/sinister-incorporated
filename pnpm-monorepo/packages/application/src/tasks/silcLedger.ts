import type { Prisma, SilcTransaction } from "@sam-monorepo/database/client";
import {
  ACTIVE_CITIZEN_WHERE,
  lockSilcLedger,
  updateSilcBalances,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";

/**
 * The largest SILC value of a manual booking, a task reward and a role
 * salary. The largest booking that comes from such a value is the payer
 * booking of a SILC task: the reward for each of up to 250 completionists
 * (the limit of `completeTask`), thus at most 250,000,000. This stays in the
 * 32-bit integer range of the value and balance columns (2,147,483,647).
 */
export const MAX_SILC_VALUE = 1_000_000;

export interface NewSilcTransaction {
  readonly receiverId: SilcTransaction["receiverId"];
  readonly value: SilcTransaction["value"];
  readonly description?: SilcTransaction["description"];
  readonly createdById?: SilcTransaction["createdById"];
  readonly taskId?: SilcTransaction["taskId"];
}

/**
 * Creates SILC transactions and rebuilds the balances of their receivers in
 * the transaction of the caller, so that the cached balances can never
 * differ from the ledger. After the commit, send the notification
 * `SilcTransactionsCreated` with the returned ids.
 *
 * It takes the ledger lock (see `lockSilcLedger()`). A caller that does more
 * in the same transaction takes the lock first itself, before its other
 * statements.
 *
 * @returns The ids of the created transactions
 */
export const createSilcTransactionsInTransaction = async (
  transaction: Prisma.TransactionClient,
  transactions: readonly NewSilcTransaction[],
): Promise<string[]> => {
  await lockSilcLedger(transaction);

  const createdTransactions =
    await transaction.silcTransaction.createManyAndReturn({
      data: [...transactions],
      select: { id: true },
    });

  await updateSilcBalances(
    transaction,
    transactions.map((newTransaction) => newTransaction.receiverId),
  );

  return createdTransactions.map((created) => created.id);
};

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
