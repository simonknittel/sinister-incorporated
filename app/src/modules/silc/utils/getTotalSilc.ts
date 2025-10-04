import type { ProfitDistributionCycleParticipant } from "@prisma/client";

export const getTotalSilc = (
  participants: ProfitDistributionCycleParticipant[],
) => {
  return participants
    .filter(
      (participant) => participant.silcBalanceSnapshot && !participant.cededAt,
    )
    .reduce(
      (total, participant) => total + participant.silcBalanceSnapshot!,
      0,
    );
};
