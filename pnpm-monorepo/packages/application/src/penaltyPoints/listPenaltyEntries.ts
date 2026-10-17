import type { Prisma } from "@sam-monorepo/database/client";
import { CursorDirection } from "@sam-monorepo/domain";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError } from "../errors.js";
import {
  cursorSchema,
  idSchema,
  pageLimitSchema,
  type PageOptions,
} from "../pagination.js";
import { buildActivePenaltyEntryWhere } from "./activePenaltyEntryWhere.js";
import {
  PENALTY_ENTRY_SELECT,
  toPenaltyEntryOutput,
  type PenaltyEntryOutput,
} from "./penaltyEntryOutput.js";

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
  status: z
    .enum(PenaltyEntryStatus)
    .default(PenaltyEntryStatus.Active)
    .describe(
      "active: not expired and not deleted. inactive: expired and not deleted. not_deleted: active and inactive. deleted: only the deleted entries.",
    ),
  citizen_id: idSchema.optional().describe("Only the entries of this citizen."),
  limit: pageLimitSchema,
  cursor: cursorSchema.optional(),
});

export interface ListPenaltyEntriesOutput {
  readonly entries: PenaltyEntryOutput[];
  readonly next_cursor: string | null;
  readonly previous_cursor: string | null;
}

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
 * are not deleted (`ownPenaltyEntry;read`). The app shows them on the
 * penalty points tab of the citizen, which also needs `citizen;read`.
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
    !actor.authorize("ownPenaltyEntry", "read") ||
    !actor.authorize("citizen", "read")
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
  { direction = CursorDirection.Next }: PageOptions = {},
): Promise<ListPenaltyEntriesOutput> => {
  authorizeList(actor, input);

  // One more entry than the page size tells if there is a further page. A
  // negative `take` reads the entries before the cursor.
  const take =
    direction === CursorDirection.Prev ? -(input.limit + 1) : input.limit + 1;

  const rows = await context.prisma.penaltyEntry.findMany({
    where: {
      ...buildStatusWhere(input.status, context.now()),
      ...(input.citizen_id ? { citizenId: input.citizen_id } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: PENALTY_ENTRY_SELECT,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    take,
  });

  const hasMore = rows.length > input.limit;

  let pageRows = rows;
  if (hasMore)
    pageRows =
      direction === CursorDirection.Prev
        ? rows.slice(1)
        : rows.slice(0, input.limit);

  const hasNextPage =
    direction === CursorDirection.Next ? hasMore : Boolean(input.cursor);
  const hasPreviousPage =
    direction === CursorDirection.Prev ? hasMore : Boolean(input.cursor);
  const firstRow = pageRows.at(0);
  const lastRow = pageRows.at(-1);

  return {
    entries: pageRows.map(toPenaltyEntryOutput),
    next_cursor: hasNextPage && lastRow ? lastRow.id : null,
    previous_cursor: hasPreviousPage && firstRow ? firstRow.id : null,
  };
};
