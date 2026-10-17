import type { Prisma } from "@sam-monorepo/database/client";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";
import { PageDirection, pageInputShape } from "../fleet/pagination.js";
import { buildActivePenaltyEntryWhere } from "./activePenaltyEntryWhere.js";

export enum PenaltyEntryStatus {
  /** Not deleted and not expired */
  Active = "active",
  /** Expired, but not deleted */
  Inactive = "inactive",
  /** Active and inactive */
  NotDeleted = "not_deleted",
  Deleted = "deleted",
}

export const listPenaltyEntriesInputSchema = z.object({
  status: z.enum(PenaltyEntryStatus).default(PenaltyEntryStatus.Active),
  /** Only the entries of this citizen */
  citizen_id: z.cuid().optional(),
  ...pageInputShape,
});

export interface PenaltyEntryCitizenOutput {
  readonly id: string;
  /** Null for a deleted citizen: the app does not show its handle */
  readonly handle: string | null;
  readonly deleted_at: string | null;
}

export interface PenaltyEntryOutput {
  readonly id: string;
  readonly citizen: PenaltyEntryCitizenOutput;
  readonly points: number;
  readonly reason: string | null;
  readonly created_at: string;
  /** Null when the author is not known */
  readonly created_by: PenaltyEntryCitizenOutput | null;
  /** Null for an entry that never expires */
  readonly expires_at: string | null;
  readonly deleted_at: string | null;
}

export interface ListPenaltyEntriesOutput {
  readonly entries: PenaltyEntryOutput[];
  readonly next_cursor: string | null;
  readonly previous_cursor: string | null;
}

const CITIZEN_SELECT = {
  id: true,
  handle: true,
  deletedAt: true,
} as const satisfies Prisma.CitizenSelect;

const toCitizenOutput = (
  citizen: Prisma.CitizenGetPayload<{ select: typeof CITIZEN_SELECT }>,
): PenaltyEntryCitizenOutput => ({
  id: citizen.id,
  handle: citizen.deletedAt ? null : citizen.handle,
  deleted_at: citizen.deletedAt?.toISOString() ?? null,
});

const buildStatusWhere = (
  status: PenaltyEntryStatus,
  now: Date,
): Prisma.PenaltyEntryWhereInput => {
  switch (status) {
    case PenaltyEntryStatus.Active:
      return buildActivePenaltyEntryWhere(now);

    case PenaltyEntryStatus.Inactive:
      return { deletedAt: null, expiresAt: { lt: now } };

    case PenaltyEntryStatus.NotDeleted:
      return { deletedAt: null };

    case PenaltyEntryStatus.Deleted:
      return { deletedAt: { not: null } };

    default:
      throw new Error(
        `Unknown penalty entry status: ${status satisfies never}`,
      );
  }
};

/**
 * Without `penaltyEntry;read`, a citizen can read only the own entries that
 * are not deleted (`ownPenaltyEntry;read`).
 */
const authorizeList = (
  actor: Actor,
  input: z.infer<typeof listPenaltyEntriesInputSchema>,
) => {
  if (actor.authorize("penaltyEntry", "read")) return;

  const isOwnCitizen =
    input.citizen_id !== undefined && input.citizen_id === actor.citizen?.id;

  if (
    !isOwnCitizen ||
    input.status === PenaltyEntryStatus.Deleted ||
    !actor.authorize("ownPenaltyEntry", "read")
  )
    throw new ForbiddenError("The permission penaltyEntry;read is missing");
};

/**
 * The penalty entries, the newest first. The cursor is the id of an entry.
 */
export const listPenaltyEntries = async (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof listPenaltyEntriesInputSchema>,
): Promise<ListPenaltyEntriesOutput> => {
  authorizeList(actor, input);

  // One more entry than the page size tells if there is a further page. A
  // negative `take` reads the entries before the cursor.
  const take =
    input.direction === PageDirection.Previous
      ? -(input.limit + 1)
      : input.limit + 1;

  const rows = await context.prisma.penaltyEntry.findMany({
    where: {
      ...buildStatusWhere(input.status, context.now()),
      ...(input.citizen_id ? { citizenId: input.citizen_id } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      points: true,
      reason: true,
      createdAt: true,
      expiresAt: true,
      deletedAt: true,
      citizen: { select: CITIZEN_SELECT },
      createdBy: { select: CITIZEN_SELECT },
    },
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    take,
  });

  const hasMore = rows.length > input.limit;

  let pageRows = rows;
  if (hasMore)
    pageRows =
      input.direction === PageDirection.Previous
        ? rows.slice(1)
        : rows.slice(0, input.limit);

  const hasNextPage =
    input.direction === PageDirection.Next ? hasMore : Boolean(input.cursor);
  const hasPreviousPage =
    input.direction === PageDirection.Previous
      ? hasMore
      : Boolean(input.cursor);
  const firstRow = pageRows.at(0);
  const lastRow = pageRows.at(-1);

  return {
    entries: pageRows.map((row) => ({
      id: row.id,
      citizen: toCitizenOutput(row.citizen),
      points: row.points,
      reason: row.reason,
      created_at: row.createdAt.toISOString(),
      created_by: row.createdBy && toCitizenOutput(row.createdBy),
      expires_at: row.expiresAt?.toISOString() ?? null,
      deleted_at: row.deletedAt?.toISOString() ?? null,
    })),
    next_cursor: hasNextPage && lastRow ? lastRow.id : null,
    previous_cursor: hasPreviousPage && firstRow ? firstRow.id : null,
  };
};
