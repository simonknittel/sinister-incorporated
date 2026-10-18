import type { ProfitDistributionCycleParticipant } from "@sam-monorepo/database/client";

const sumAuec = (
  participants: readonly Pick<
    ProfitDistributionCycleParticipant,
    "silcBalanceSnapshot"
  >[],
  auecPerSilc: number,
) =>
  participants.reduce(
    (total, participant) =>
      total + (participant.silcBalanceSnapshot ?? 0) * auecPerSilc,
    0,
  );

/** The aUEC of the participants that did not cede and are not paid yet */
export const getOpenAuecPayout = (
  participants: readonly Pick<
    ProfitDistributionCycleParticipant,
    "silcBalanceSnapshot" | "cededAt" | "disbursedAt"
  >[],
  auecPerSilc: number,
) =>
  sumAuec(
    participants.filter(
      (participant) => !participant.disbursedAt && !participant.cededAt,
    ),
    auecPerSilc,
  );

/** The aUEC of the participants that are paid */
export const getPaidAuec = (
  participants: readonly Pick<
    ProfitDistributionCycleParticipant,
    "silcBalanceSnapshot" | "disbursedAt"
  >[],
  auecPerSilc: number,
) =>
  sumAuec(
    participants.filter((participant) => participant.disbursedAt),
    auecPerSilc,
  );
