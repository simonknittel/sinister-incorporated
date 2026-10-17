import type {
  PenaltyEntryCitizenOutput,
  PenaltyEntryOutput,
} from "@sam-monorepo/application";
import type { Citizen } from "@sam-monorepo/database/client";

type PenaltyEntryCitizen = Pick<Citizen, "id" | "handle" | "deletedAt">;

/** A penalty entry as the table shows it */
export interface PenaltyEntryRow {
  readonly id: string;
  readonly points: number;
  readonly reason: string | null;
  readonly createdAt: Date;
  readonly expiresAt: Date | null;
  readonly deletedAt: Date | null;
  readonly citizen: PenaltyEntryCitizen;
  /** Null when the author is not known */
  readonly createdBy: PenaltyEntryCitizen | null;
}

const toDate = (value: string | null) =>
  value === null ? null : new Date(value);

const toPenaltyEntryCitizen = (
  citizen: PenaltyEntryCitizenOutput,
): PenaltyEntryCitizen => ({
  id: citizen.id,
  handle: citizen.handle,
  deletedAt: toDate(citizen.deleted_at),
});

export const toPenaltyEntryRow = (
  entry: PenaltyEntryOutput,
): PenaltyEntryRow => ({
  id: entry.id,
  points: entry.points,
  reason: entry.reason,
  createdAt: new Date(entry.created_at),
  expiresAt: toDate(entry.expires_at),
  deletedAt: toDate(entry.deleted_at),
  citizen: toPenaltyEntryCitizen(entry.citizen),
  createdBy: entry.created_by && toPenaltyEntryCitizen(entry.created_by),
});
