import type { ProfitDistributionCycle } from "@prisma/client";

export const getCurrentPhase = (cycle: ProfitDistributionCycle) => {
  let currentPhase = 1;
  const now = new Date();
  if (cycle.collectionEndedAt < now) currentPhase = 2;
  if (cycle.payoutStartedAt && cycle.payoutStartedAt < now) currentPhase = 3;
  if (cycle.payoutEndedAt && cycle.payoutEndedAt < now) currentPhase = 4;
  return currentPhase;
};
