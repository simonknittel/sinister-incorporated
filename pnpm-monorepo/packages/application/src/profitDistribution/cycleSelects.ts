import type { Prisma } from "@sam-monorepo/database/client";

/** The columns of a cycle that `getCurrentPhase()` reads */
export const CYCLE_PHASE_SELECT = {
  collectionEndedAt: true,
  payoutStartedAt: true,
  payoutEndedAt: true,
} as const satisfies Prisma.ProfitDistributionCycleSelect;

/**
 * The columns of a cycle that the pages show. `auecProfit` stays a BigInt:
 * the page calls `toLocaleString()` on it, and React serializes a BigInt.
 */
const CYCLE_COLUMNS_SELECT = {
  ...CYCLE_PHASE_SELECT,
  id: true,
  title: true,
  collectionEndsAt: true,
  payoutEndsAt: true,
  auecProfit: true,
} as const satisfies Prisma.ProfitDistributionCycleSelect;

const PARTICIPANT_STATE_SELECT = {
  citizenId: true,
  silcBalanceSnapshot: true,
  cededAt: true,
  acceptedAt: true,
  disbursedAt: true,
} as const satisfies Prisma.ProfitDistributionCycleParticipantSelect;

/** A cycle in the list of the cycles */
export const CYCLE_EXCERPT_SELECT = {
  ...CYCLE_COLUMNS_SELECT,
  participants: { select: PARTICIPANT_STATE_SELECT },
} as const satisfies Prisma.ProfitDistributionCycleSelect;

export type CycleExcerptRow = Prisma.ProfitDistributionCycleGetPayload<{
  select: typeof CYCLE_EXCERPT_SELECT;
}>;

/** A cycle on its page and on its management page */
export const CYCLE_DETAILS_SELECT = {
  ...CYCLE_COLUMNS_SELECT,
  participants: {
    select: {
      ...PARTICIPANT_STATE_SELECT,
      citizen: {
        select: {
          id: true,
          handle: true,
          deletedAt: true,
          silcBalance: true,
        },
      },
      disbursedBy: {
        select: {
          id: true,
          handle: true,
          deletedAt: true,
        },
      },
    },
  },
} as const satisfies Prisma.ProfitDistributionCycleSelect;

export type CycleDetailsRow = Prisma.ProfitDistributionCycleGetPayload<{
  select: typeof CYCLE_DETAILS_SELECT;
}>;
