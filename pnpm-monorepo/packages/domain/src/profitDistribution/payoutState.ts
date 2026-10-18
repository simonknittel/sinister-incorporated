import type {
  ProfitDistributionCycle,
  ProfitDistributionCycleParticipant,
} from "@sam-monorepo/database/client";
import { CyclePhase, getCurrentPhase } from "./cyclePhase.js";

/** The payout state of one participant of a profit distribution cycle */
export enum PayoutState {
  NotParticipating,
  PayoutNotYetStarted,
  AwaitingAcceptance,
  AwaitingPayout,
  Disbursed,
  Expired,
  PayoutOverdue,
  Ceded,
}

/**
 * The payout state of a participant in the current phase of the cycle. A
 * citizen without a participant row does not participate.
 */
export const getPayoutState = (
  cycle: Pick<
    ProfitDistributionCycle,
    "collectionEndedAt" | "payoutStartedAt" | "payoutEndedAt"
  >,
  participant:
    | Pick<
        ProfitDistributionCycleParticipant,
        "cededAt" | "acceptedAt" | "disbursedAt"
      >
    | null
    | undefined,
) => {
  if (!participant) return PayoutState.NotParticipating;

  if (participant.disbursedAt) return PayoutState.Disbursed;

  if (participant.cededAt) return PayoutState.Ceded;

  const phase = getCurrentPhase(cycle);
  switch (phase) {
    case CyclePhase.Collection:
    case CyclePhase.PayoutPreparation:
      return PayoutState.PayoutNotYetStarted;

    case CyclePhase.Payout:
      return participant.acceptedAt
        ? PayoutState.AwaitingPayout
        : PayoutState.AwaitingAcceptance;

    case CyclePhase.Completed:
      return participant.acceptedAt
        ? PayoutState.PayoutOverdue
        : PayoutState.Expired;

    default:
      throw new Error(`Unknown cycle phase: ${phase satisfies never}`);
  }
};
