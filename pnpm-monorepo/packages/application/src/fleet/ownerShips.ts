import type { Prisma } from "@sam-monorepo/database/client";
import * as z from "zod";
import type { ApplicationContext } from "../context.js";
import { pageInputShape, paginateByCursor } from "./pagination.js";
import {
  buildVariantFilterWhere,
  SHIP_VARIANT_SELECT,
  toShipVariantOutput,
  variantFilterInputShape,
  type ShipVariantOutput,
} from "./shipVariant.js";

/** The ship lists sort by the name of the variant */
export enum ShipSort {
  NameAscending = "name_asc",
  NameDescending = "name_desc",
}

/** The input fields of the ship list of one citizen */
export const ownerShipsInputShape = {
  ...variantFilterInputShape,
  /** True gives only the deleted ships, false only the ships that are not deleted */
  deleted: z.boolean().default(false),
  sort: z.enum(ShipSort).default(ShipSort.NameAscending),
  ...pageInputShape,
};

const ownerShipsInputSchema = z.object(ownerShipsInputShape);

export interface ShipOutput {
  readonly id: string;
  /** The name that the owner gave the ship */
  readonly name: string | null;
  readonly variant: ShipVariantOutput;
  /** Null for the ships from before the app recorded the time */
  readonly created_at: string | null;
  readonly deleted_at: string | null;
}

export interface ListShipsOutput {
  readonly ships: ShipOutput[];
  /** The ships that agree with the filters */
  readonly total: number;
  readonly next_cursor: string | null;
  readonly previous_cursor: string | null;
}

const SHIP_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  deletedAt: true,
  variant: { select: SHIP_VARIANT_SELECT },
} as const satisfies Prisma.ShipSelect;

const compareShips =
  (sort: ShipSort) => (first: ShipOutput, second: ShipOutput) => {
    switch (sort) {
      case ShipSort.NameAscending:
        return first.variant.name.localeCompare(second.variant.name);

      case ShipSort.NameDescending:
        return second.variant.name.localeCompare(first.variant.name);

      default:
        throw new Error(`Unknown sort: ${sort satisfies never}`);
    }
  };

/**
 * The ship list of one citizen. The own ships and the fleet of a different
 * citizen show the same list; only the permission is different. Thus the
 * use cases check the permission and share this list. The cursor is the id
 * of a ship.
 */
export const listOwnerShips = async (
  context: ApplicationContext,
  ownerId: string,
  input: z.infer<typeof ownerShipsInputSchema>,
): Promise<ListShipsOutput> => {
  const ships = await context.prisma.ship.findMany({
    where: {
      ownerId,
      deletedAt: input.deleted ? { not: null } : null,
      variant: buildVariantFilterWhere({
        flightReady: input.flight_ready,
        variantTagIds: input.variant_tag_ids,
        manufacturerIds: input.manufacturer_ids,
        query: input.query,
      }),
    },
    select: SHIP_SELECT,
    // A stable order for the ships of the same variant, thus the cursor of a
    // page stays valid
    orderBy: { id: "asc" },
  });

  const sortedShips = ships
    .map((ship): ShipOutput => ({
      id: ship.id,
      name: ship.name,
      variant: toShipVariantOutput(ship.variant),
      created_at: ship.createdAt?.toISOString() ?? null,
      deleted_at: ship.deletedAt?.toISOString() ?? null,
    }))
    .sort(compareShips(input.sort));

  const page = paginateByCursor(sortedShips, {
    cursor: input.cursor,
    direction: input.direction,
    pageSize: input.limit,
    getCursor: (ship) => ship.id,
  });

  return {
    ships: page.items,
    total: ships.length,
    next_cursor: page.nextCursor,
    previous_cursor: page.previousCursor,
  };
};
