import type { Prisma } from "@sam-monorepo/database/client";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { paginateByCursor, type PageOptions } from "../pagination.js";
import { withSpan } from "../withSpan.js";

/** The page size of the table of the ship changes */
const SHIP_CHANGES_PAGE_SIZE = 100;

export enum ShipChangeType {
  Creation = "creation",
  Deletion = "deletion",
}

/** The filter of the table of the ship changes */
export enum ShipChangeFilter {
  Both = "both",
  Creation = "creation",
  Deletion = "deletion",
}

/** What one row of the changes table renders */
const CHANGED_SHIP_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  createdById: true,
  deletedAt: true,
  deletedById: true,
  variant: {
    select: {
      id: true,
      name: true,
      status: true,
      series: {
        select: {
          manufacturer: {
            select: {
              name: true,
              image: { select: { id: true, mimeType: true } },
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.ShipSelect;

export interface ShipChangeRow {
  readonly changeDate: Date;
  readonly changeType: ShipChangeType;
  readonly ship: Prisma.ShipGetPayload<{ select: typeof CHANGED_SHIP_SELECT }>;
  /** The citizen that created or deleted the ship */
  readonly actorId: string | null;
  readonly actorHandle: string | null;
  readonly actorDeletedAt: Date | null;
}

export interface ShipChangePage {
  readonly changes: ShipChangeRow[];
  readonly nextCursor: string | null;
  readonly prevCursor: string | null;
}

export interface FindShipChangePageInput {
  readonly changeType: ShipChangeFilter;
  /** The id of a ship and the type of its change, see `getChangeCursor()` */
  readonly cursor?: string | null;
}

const ACTOR_SELECT = {
  handle: true,
  deletedAt: true,
} as const satisfies Prisma.CitizenSelect;

const getChangeCursor = (change: ShipChangeRow) =>
  `${change.ship.id}:${change.changeType}`;

/**
 * One page of the creations and the deletions of the ships of all owners,
 * the newest first
 */
export const findShipChangePage = (
  context: Pick<ApplicationContext, "prisma" | "tracer">,
  actor: Actor,
  { changeType, cursor }: FindShipChangePageInput,
  { direction, unknownCursor }: PageOptions = {},
): Promise<ShipChangePage> =>
  withSpan(context, "findShipChangePage", async () => {
    requirePermission(actor, "otherShips", "read");

    /**
     * Without a cursor the answer is the newest page of the merged
     * streams, and a row can only reach it by being among the newest
     * page of its own stream — so each query stops there. A cursor page
     * can sit arbitrarily deep in either stream, and the composite
     * cursor (`shipId:changeType`) addresses the merged list rather than
     * one stream, so those still merge the full set in memory.
     */
    const streamTake = cursor ? undefined : SHIP_CHANGES_PAGE_SIZE + 1;

    const [createdShips, deletedShips] = await Promise.all([
      changeType === ShipChangeFilter.Deletion
        ? []
        : context.prisma.ship.findMany({
            where: {
              deletedAt: null,
              /**
               * Old ships have no known creation date. The log cannot put
               * their creation in the timeline, thus it does not show it.
               */
              createdAt: { not: null },
            },
            orderBy: { createdAt: "desc" },
            take: streamTake,
            select: {
              ...CHANGED_SHIP_SELECT,
              createdBy: { select: ACTOR_SELECT },
            },
          }),
      changeType === ShipChangeFilter.Creation
        ? []
        : context.prisma.ship.findMany({
            where: { deletedAt: { not: null } },
            orderBy: { deletedAt: "desc" },
            take: streamTake,
            select: {
              ...CHANGED_SHIP_SELECT,
              deletedBy: { select: ACTOR_SELECT },
            },
          }),
    ]);

    /**
     * The queries only load ships with a date. The checks below tell this
     * to TypeScript without an assertion.
     */
    const changes: ShipChangeRow[] = [
      ...createdShips.flatMap(({ createdBy, ...ship }) =>
        ship.createdAt
          ? [
              {
                changeDate: ship.createdAt,
                changeType: ShipChangeType.Creation,
                ship,
                actorId: ship.createdById,
                actorHandle: createdBy?.handle ?? null,
                actorDeletedAt: createdBy?.deletedAt ?? null,
              },
            ]
          : [],
      ),
      ...deletedShips.flatMap(({ deletedBy, ...ship }) =>
        ship.deletedAt
          ? [
              {
                changeDate: ship.deletedAt,
                changeType: ShipChangeType.Deletion,
                ship,
                actorId: ship.deletedById,
                actorHandle: deletedBy?.handle ?? null,
                actorDeletedAt: deletedBy?.deletedAt ?? null,
              },
            ]
          : [],
      ),
    ];

    const sortedChanges = changes.toSorted(
      (first, second) =>
        second.changeDate.getTime() - first.changeDate.getTime(),
    );

    const page = paginateByCursor(sortedChanges, {
      cursor,
      direction,
      unknownCursor,
      pageSize: SHIP_CHANGES_PAGE_SIZE,
      getCursor: getChangeCursor,
    });

    return {
      changes: page.items,
      nextCursor: page.nextCursor,
      prevCursor: page.previousCursor,
    };
  });
