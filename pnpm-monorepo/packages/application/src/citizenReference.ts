import type { Citizen } from "@sam-monorepo/database/client";

/** A citizen in the output of a use case */
export interface CitizenReference {
  readonly id: string;
  /** Display text. It can change and it does not identify the citizen. */
  readonly handle: string | null;
}

/**
 * A deleted citizen stays hidden, like the UI shows only a "deleted citizen"
 * label for it: the reference is null.
 */
export const toCitizenReference = (
  citizen: Pick<Citizen, "id" | "handle" | "deletedAt"> | null,
): CitizenReference | null =>
  citizen && citizen.deletedAt === null
    ? { id: citizen.id, handle: citizen.handle }
    : null;

/** The citizens that are not deleted, as references */
export const toCitizenReferences = (
  citizens: readonly Pick<Citizen, "id" | "handle" | "deletedAt">[],
): CitizenReference[] =>
  citizens.flatMap((citizen) => toCitizenReference(citizen) ?? []);
