import { prisma } from "@/db";
import type { Entity } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSilcTransactionsOfAllCitizens } from "../queries";

export const updateCitizensSilcBalances = async (
  citizenIds: Entity["id"][],
) => {
  const _transactions = await getSilcTransactionsOfAllCitizens();
  const transactions = _transactions.filter((transaction) =>
    citizenIds.includes(transaction.receiverId),
  );

  const silcBalancePerCitizen = new Map<
    string,
    { balance: number; totalEarned: number }
  >(citizenIds.map((citizenId) => [citizenId, { balance: 0, totalEarned: 0 }]));

  for (const transaction of transactions) {
    const { receiverId, value } = transaction;

    const balance = silcBalancePerCitizen.get(receiverId)!.balance;
    const totalEarned = silcBalancePerCitizen.get(receiverId)!.totalEarned;

    silcBalancePerCitizen.set(receiverId, {
      balance: balance + value,
      totalEarned: value > 0 ? totalEarned + value : totalEarned,
    });
  }

  for (const [receiverId, { balance, totalEarned }] of silcBalancePerCitizen) {
    await prisma.entity.update({
      where: {
        id: receiverId,
      },
      data: {
        silcBalance: balance,
        totalEarnedSilc: totalEarned,
      },
    });
  }

  revalidatePath("/app/silc");
  revalidatePath("/app/dashboard");
};
