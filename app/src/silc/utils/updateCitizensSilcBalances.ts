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

  const silcBalancePerCitizen = new Map<string, number>(
    transactions.map((transaction) => [transaction.receiverId, 0]),
  );

  for (const transaction of transactions) {
    const { receiverId, value } = transaction;

    silcBalancePerCitizen.set(
      receiverId,
      silcBalancePerCitizen.get(receiverId)! + value,
    );
  }

  for (const [receiverId, balance] of silcBalancePerCitizen) {
    await prisma.entity.update({
      where: {
        id: receiverId,
      },
      data: {
        silcBalance: balance,
      },
    });
  }

  revalidatePath("/app/silc");
  revalidatePath("/app/dashboard");
};
