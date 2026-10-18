import type { PrismaClientType } from "@sam-monorepo/database";
import type {
  Prisma,
  ProfitDistributionCycleParticipant,
} from "@sam-monorepo/database/client";

/**
 * A state of a participant. The values are also the attributes in the audit
 * events and in the notifications.
 */
export enum ParticipantAttribute {
  Ceded = "ceded",
  Accepted = "accepted",
  Disbursed = "disbursed",
}

/** The column of the time of an attribute, and the column of its author */
export const getAttributeColumns = (attribute: ParticipantAttribute) => {
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

type AttributeColumns = ReturnType<typeof getAttributeColumns>;

type ParticipantAttributeData = Partial<
  Record<AttributeColumns["changedAt"], Date | null> &
    Record<AttributeColumns["changedById"], string>
>;

/**
 * The columns that set (`enabled`) or remove an attribute of a participant,
 * with the citizen who made the change
 */
export const getAttributeData = (
  attribute: ParticipantAttribute,
  enabled: boolean,
  changedById: string,
  now: Date,
): ParticipantAttributeData => {
  const columns = getAttributeColumns(attribute);

  return {
    [columns.changedAt]: enabled ? now : null,
    [columns.changedById]: changedById,
  };
};

/**
 * Writes the data into the participant row of a citizen in a cycle, and
 * creates the row when it is missing.
 *
 * The function is not `async`: it gives the `PrismaPromise`, thus a batch
 * `$transaction([...])` accepts it.
 */
export const upsertParticipant = (
  prisma: Pick<PrismaClientType, "profitDistributionCycleParticipant">,
  cycleId: string,
  citizenId: string,
  data: ParticipantAttributeData,
): Prisma.PrismaPromise<ProfitDistributionCycleParticipant> =>
  prisma.profitDistributionCycleParticipant.upsert({
    where: { cycleId_citizenId: { cycleId, citizenId } },
    update: data,
    create: { cycleId, citizenId, ...data },
  });
