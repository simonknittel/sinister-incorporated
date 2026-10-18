import { CYCLE_PHASE_WHERE, CyclePhase } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { endCollectionPhaseOfCycle } from "./collectionEnd.js";

export interface EndDueCollectionPhasesOutput {
  /** The cycles whose planned end of the collection phase is due */
  readonly dueCycleCount: number;
  /** The due cycles that this run ended. A parallel end can take the rest. */
  readonly endedCycleCount: number;
  readonly bookingCount: number;
}

/**
 * Ends the collection phases whose planned end is due, and books the
 * balances away. It sends no notification for the bookings; the manual end
 * sends one (an open decision).
 */
export const endDueCollectionPhases = (
  context: ApplicationContext,
): Promise<EndDueCollectionPhasesOutput> =>
  withSpan(context, "endDueCollectionPhases", async () => {
    const dueCycles = await context.prisma.profitDistributionCycle.findMany({
      where: {
        ...CYCLE_PHASE_WHERE[CyclePhase.Collection],
        collectionEndsAt: { lte: context.now() },
      },
      /**
       * The first cycle books all balances away. Thus the cycle that was due
       * first gets them.
       */
      orderBy: { collectionEndsAt: "asc" },
      select: { id: true },
    });

    let endedCycleCount = 0;
    let bookingCount = 0;
    for (const cycle of dueCycles) {
      const transactionIds = await endCollectionPhaseOfCycle(context, {
        cycleId: cycle.id,
        endedById: null,
        createdById: null,
      });
      // A manager or a parallel run ended the phase before
      if (transactionIds === null) continue;

      endedCycleCount += 1;
      bookingCount += transactionIds.length;
    }

    return {
      dueCycleCount: dueCycles.length,
      endedCycleCount,
      bookingCount,
    };
  });
