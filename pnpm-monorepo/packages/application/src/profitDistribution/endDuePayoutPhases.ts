import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { endPayoutOfCycles } from "./payoutEnd.js";

export interface EndDuePayoutPhasesOutput {
  readonly endedCycleCount: number;
}

/** Ends the payout phases whose planned end is due */
export const endDuePayoutPhases = (
  context: ApplicationContext,
): Promise<EndDuePayoutPhasesOutput> =>
  withSpan(context, "endDuePayoutPhases", async () => {
    const endedCycleIds = await endPayoutOfCycles(context, {
      where: { payoutEndsAt: { lte: context.now() } },
      endedById: null,
      createdById: null,
    });

    return { endedCycleCount: endedCycleIds.length };
  });
