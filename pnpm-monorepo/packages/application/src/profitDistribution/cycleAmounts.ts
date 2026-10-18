import type { ProfitDistributionCycleParticipant } from "@sam-monorepo/database/client";

/** The aUEC share of a SILC balance */
export const getMyShare = (mySilcBalance: number, auecPerSilc: number) => {
  return mySilcBalance * auecPerSilc;
};

/** The aUEC of the participants that did not cede and are not paid yet */
export const getOpenAuecPayout = (
  participants: readonly Pick<
    ProfitDistributionCycleParticipant,
    "silcBalanceSnapshot" | "cededAt" | "disbursedAt"
  >[],
  auecPerSilc: number,
) => {
  return participants
    .filter(
      (participant) =>
        !participant.disbursedAt &&
        !participant.cededAt &&
        participant.silcBalanceSnapshot,
    )
    .reduce(
      (total, participant) =>
        total + participant.silcBalanceSnapshot! * auecPerSilc,
      0,
    );
};

/** The aUEC of the participants that are paid */
export const getPaidAuec = (
  participants: readonly Pick<
    ProfitDistributionCycleParticipant,
    "silcBalanceSnapshot" | "disbursedAt"
  >[],
  auecPerSilc: number,
) => {
  return participants
    .filter(
      (participant) =>
        participant.disbursedAt && participant.silcBalanceSnapshot,
    )
    .reduce(
      (total, participant) =>
        total + participant.silcBalanceSnapshot! * auecPerSilc,
      0,
    );
};
