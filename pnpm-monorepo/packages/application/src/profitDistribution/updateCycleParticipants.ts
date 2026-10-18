import {
  AuditEventType,
  CyclePhase,
  getCurrentPhase,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { ProfitDistributionErrorMessage } from "./profitDistributionErrors.js";

/**
 * A state of a participant that a manager sets. The values are also the
 * attributes in the audit events and in the notifications.
 */
export enum ParticipantAttribute {
  Ceded = "ceded",
  Accepted = "accepted",
  Disbursed = "disbursed",
}

/**
 * The number of citizens has no fixed maximum, thus the limit is an
 * arbitrary number. It keeps the loops of the use case bounded.
 */
const MAXIMUM_ENABLED_ATTRIBUTES = 100;

export const updateCycleParticipantsInputSchema = z.object({
  cycle_id: idSchema,
  enabled_attributes: z
    .array(
      z.object({
        attribute: z.enum(ParticipantAttribute),
        citizen_id: idSchema,
      }),
    )
    .max(MAXIMUM_ENABLED_ATTRIBUTES)
    .describe(
      "All states that are set after the update. A state of a participant that is not in the list is removed.",
    ),
});

export type UpdateCycleParticipantsInput = z.infer<
  typeof updateCycleParticipantsInputSchema
>;

export interface CycleParticipantChange {
  readonly citizen_id: string;
  readonly attribute: ParticipantAttribute;
  readonly enabled: boolean;
}

export interface UpdateCycleParticipantsOutput {
  readonly cycle_id: string;
  readonly changes: CycleParticipantChange[];
  readonly notifications_sent: boolean;
}

/** The column of the time of an attribute, and the column of its author */
const getAttributeColumns = (attribute: ParticipantAttribute) => {
  switch (attribute) {
    case ParticipantAttribute.Ceded:
      return { changedAt: "cededAt", changedById: "cededById" } as const;

    case ParticipantAttribute.Accepted:
      return { changedAt: "acceptedAt", changedById: "acceptedById" } as const;

    case ParticipantAttribute.Disbursed:
      return {
        changedAt: "disbursedAt",
        changedById: "disbursedById",
      } as const;

    default:
      throw new Error(
        `Unknown participant attribute: ${attribute satisfies never}`,
      );
  }
};

/** The attributes that a manager can change in the phase */
const getChangeableAttributes = (phase: CyclePhase) => {
  switch (phase) {
    case CyclePhase.Collection:
    case CyclePhase.PayoutPreparation:
      return [ParticipantAttribute.Ceded];

    case CyclePhase.Payout:
      return [ParticipantAttribute.Accepted, ParticipantAttribute.Disbursed];

    case CyclePhase.Completed:
      return [];

    default:
      throw new Error(`Unknown cycle phase: ${phase satisfies never}`);
  }
};

/**
 * Sets the states of the participants of a cycle that a manager can change
 * in the current phase: ceded in the collection and payout preparation
 * phases, accepted and disbursed in the payout phase. Only the existing
 * participant rows change. Requires a citizen and
 * `profitDistributionCycle;update`.
 *
 * It always sends the notification about the disbursements, also without
 * changes: the notification router filters them.
 *
 * @throws NotFoundError when the cycle does not exist
 */
export const updateCycleParticipants = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateCycleParticipantsInput,
): Promise<UpdateCycleParticipantsOutput> =>
  withSpan(context, "updateCycleParticipants", async () => {
    const citizen = requireCitizen(actor);
    requirePermission(actor, "profitDistributionCycle", "update");

    const cycle = await context.prisma.profitDistributionCycle.findUnique({
      where: { id: input.cycle_id },
      select: {
        id: true,
        collectionEndedAt: true,
        payoutStartedAt: true,
        payoutEndedAt: true,
        participants: {
          select: {
            citizenId: true,
            cededAt: true,
            acceptedAt: true,
            disbursedAt: true,
          },
        },
      },
    });
    if (!cycle)
      throw new NotFoundError(ProfitDistributionErrorMessage.CycleNotFound);

    const enabledKeys = new Set(
      input.enabled_attributes.map(
        ({ attribute, citizen_id }) => `${attribute}:${citizen_id}`,
      ),
    );
    const changeableAttributes = getChangeableAttributes(
      getCurrentPhase(cycle),
    );

    const changes: CycleParticipantChange[] = [];
    for (const participant of cycle.participants) {
      for (const attribute of changeableAttributes) {
        const isEnabled =
          participant[getAttributeColumns(attribute).changedAt] !== null;
        const isRequested = enabledKeys.has(
          `${attribute}:${participant.citizenId}`,
        );
        if (isEnabled === isRequested) continue;

        changes.push({
          citizen_id: participant.citizenId,
          attribute,
          enabled: isRequested,
        });
      }
    }

    const now = context.now();
    await context.prisma.$transaction(
      changes.map((change) => {
        const columns = getAttributeColumns(change.attribute);
        const data = {
          [columns.changedAt]: change.enabled ? now : null,
          [columns.changedById]: citizen.id,
        };

        return context.prisma.profitDistributionCycleParticipant.upsert({
          where: {
            cycleId_citizenId: {
              cycleId: cycle.id,
              citizenId: change.citizen_id,
            },
          },
          update: data,
          create: {
            cycleId: cycle.id,
            citizenId: change.citizen_id,
            ...data,
          },
        });
      }),
    );

    const changesOfPayload = changes.map((change) => ({
      citizenId: change.citizen_id,
      attribute: change.attribute,
      enabled: change.enabled,
    }));
    if (changes.length > 0)
      await context.audit.create([
        {
          type: AuditEventType.PROFIT_CYCLE_PARTICIPANT_UPDATED,
          data: { cycleId: cycle.id, changes: changesOfPayload },
          createdById: actor.userId,
        },
      ]);

    const notificationsSent = await triggerNotificationsAfterSave(context, [
      {
        type: "ProfitDistributionPayoutDisbursed",
        payload: { cycleId: cycle.id, changes: changesOfPayload },
      },
    ]);

    return {
      cycle_id: cycle.id,
      changes,
      notifications_sent: notificationsSent,
    };
  });
