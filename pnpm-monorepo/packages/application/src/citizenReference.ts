import type { Prisma } from "@sam-monorepo/database/client";

/** A citizen in the output of a use case */
export interface CitizenReference {
  readonly id: string;
  /** Display text. It can change and it does not identify the citizen. */
  readonly handle: string | null;
}

/** The fields of a citizen that `toCitizenReference()` needs */
export const CITIZEN_REFERENCE_SELECT = {
  id: true,
  handle: true,
  deletedAt: true,
} as const satisfies Prisma.CitizenSelect;

export type CitizenReferenceRow = Prisma.CitizenGetPayload<{
  select: typeof CITIZEN_REFERENCE_SELECT;
}>;

/**
 * A deleted citizen stays hidden, like the UI shows only a "deleted citizen"
 * label for it: the reference is null.
 */
export const toCitizenReference = (
  citizen: CitizenReferenceRow | null,
): CitizenReference | null =>
  citizen && citizen.deletedAt === null
    ? { id: citizen.id, handle: citizen.handle }
    : null;

/** The citizens that are not deleted, as references */
export const toCitizenReferences = (
  citizens: readonly CitizenReferenceRow[],
): CitizenReference[] =>
  citizens.flatMap((citizen) => toCitizenReference(citizen) ?? []);
