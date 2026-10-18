import {
  AuditEventType,
  CyclePhase,
  getCurrentPhase,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { ProfitDistributionErrorMessage } from "./profitDistributionErrors.js";

export const setOwnParticipationInputSchema = z.object({
  cycle_id: idSchema,
  enabled: z
    .boolean()
    .describe("True: set the state for the own citizen. False: remove it."),
});

export type SetOwnParticipationInput = z.infer<
  typeof setOwnParticipationInputSchema
>;

export interface SetOwnParticipationOutput {
  readonly cycle_id: string;
  readonly citizen_id: string;
  readonly enabled: boolean;
}

interface Configuration {
  readonly requiredPhase: CyclePhase;
  readonly auditEventType:
    | AuditEventType.PROFIT_DISTRIBUTION_MY_ACCEPTED_TOGGLED
    | AuditEventType.PROFIT_DISTRIBUTION_MY_CEDED_TOGGLED;
  readonly toParticipantData: (
    enabled: boolean,
    citizenId: string,
    now: Date,
  ) =>
    | { acceptedAt: Date | null; acceptedById: string }
    | { cededAt: Date | null; cededById: string };
}

/**
 * Sets or removes one state of the own participation in a cycle. The two
 * use cases below differ only in the phase, the columns and the audit event.
 * Requires only a citizen: each member decides about their own share.
 */
const setOwnParticipation = async (
  context: ApplicationContext,
  actor: Actor,
  input: SetOwnParticipationInput,
  configuration: Configuration,
): Promise<SetOwnParticipationOutput> => {
  const citizen = requireCitizen(actor);

  const cycle = await context.prisma.profitDistributionCycle.findUnique({
    where: { id: input.cycle_id },
    select: {
      collectionEndedAt: true,
      payoutStartedAt: true,
      payoutEndedAt: true,
    },
  });
  if (!cycle)
    throw new NotFoundError(ProfitDistributionErrorMessage.CycleNotFound);
  // A manager or the midnight job changed the phase
  if (getCurrentPhase(cycle) !== configuration.requiredPhase)
    throw new ConflictError(ProfitDistributionErrorMessage.WrongPhase);

  const participantData = configuration.toParticipantData(
    input.enabled,
    citizen.id,
    context.now(),
  );
  await context.prisma.profitDistributionCycleParticipant.upsert({
    where: {
      cycleId_citizenId: { cycleId: input.cycle_id, citizenId: citizen.id },
    },
    update: participantData,
    create: {
      cycleId: input.cycle_id,
      citizenId: citizen.id,
      ...participantData,
    },
  });

  await context.audit.create([
    {
      type: configuration.auditEventType,
      data: {
        cycleId: input.cycle_id,
        citizenId: citizen.id,
        value: input.enabled,
      },
      createdById: actor.userId,
    },
  ]);

  return {
    cycle_id: input.cycle_id,
    citizen_id: citizen.id,
    enabled: input.enabled,
  };
};

/**
 * Accepts the own payout of a cycle, or takes the acceptance back. Requires
 * a citizen.
 *
 * @throws NotFoundError when the cycle does not exist
 * @throws ConflictError when the cycle is not in its payout phase
 */
export const setOwnPayoutAccepted = (
  context: ApplicationContext,
  actor: Actor,
  input: SetOwnParticipationInput,
): Promise<SetOwnParticipationOutput> =>
  withSpan(context, "setOwnPayoutAccepted", () =>
    setOwnParticipation(context, actor, input, {
      requiredPhase: CyclePhase.Payout,
      auditEventType: AuditEventType.PROFIT_DISTRIBUTION_MY_ACCEPTED_TOGGLED,
      toParticipantData: (enabled, citizenId, now) => ({
        acceptedAt: enabled ? now : null,
        acceptedById: citizenId,
      }),
    }),
  );

/**
 * Cedes the own share of a cycle to the other participants, or takes the
 * cession back. Requires a citizen.
 *
 * @throws NotFoundError when the cycle does not exist
 * @throws ConflictError when the cycle is not in its collection phase
 */
export const setOwnShareCeded = (
  context: ApplicationContext,
  actor: Actor,
  input: SetOwnParticipationInput,
): Promise<SetOwnParticipationOutput> =>
  withSpan(context, "setOwnShareCeded", () =>
    setOwnParticipation(context, actor, input, {
      requiredPhase: CyclePhase.Collection,
      auditEventType: AuditEventType.PROFIT_DISTRIBUTION_MY_CEDED_TOGGLED,
      toParticipantData: (enabled, citizenId, now) => ({
        cededAt: enabled ? now : null,
        cededById: citizenId,
      }),
    }),
  );
