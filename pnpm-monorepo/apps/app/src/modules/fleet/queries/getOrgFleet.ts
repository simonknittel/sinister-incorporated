import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { CursorDirection } from "@/modules/common/CursorPagination/cursorPaginationParsers";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listOrgFleet, OrgFleetSort } from "@sam-monorepo/application";
import { cache } from "react";
import {
  toFlightReadyFilter,
  toPageDirection,
  toShipVariant,
  type FlightReadyParameter,
} from "../utils/fleetListMapping";
import { FLEET_PAGE_SIZE } from "./shipQuery";

/** The values of the `sort` search parameter of the organization fleet */
type OrgFleetSortParameter =
  "name-asc" | "name-desc" | "count-asc" | "count-desc";

const toOrgFleetSort = (sort: OrgFleetSortParameter) => {
  switch (sort) {
    case "name-asc":
      return OrgFleetSort.NameAscending;

    case "name-desc":
      return OrgFleetSort.NameDescending;

    case "count-asc":
      return OrgFleetSort.CountAscending;

    case "count-desc":
      return OrgFleetSort.CountDescending;

    default:
      throw new Error(`Unknown sort: ${sort satisfies never}`);
  }
};

interface OrgFleetOptions {
  readonly flightReady?: FlightReadyParameter;
  readonly variantTagIds?: string[];
  readonly manufacturerIds?: string[];
  readonly sort?: OrgFleetSortParameter;
  readonly searchQuery?: string | null;
  readonly cursor?: string | null;
  readonly direction?: CursorDirection;
}

export const getOrgFleet = cache(
  withTrace(
    "getOrgFleet",
    async ({
      flightReady = "all",
      variantTagIds = [],
      manufacturerIds = [],
      sort = "count-desc",
      searchQuery,
      cursor,
      direction = CursorDirection.Next,
    }: OrgFleetOptions) => {
      const { session } = await requireAuthentication();

      try {
        const output = await listOrgFleet(
          getApplicationContext(),
          await toActor(session),
          {
            flight_ready: toFlightReadyFilter(flightReady),
            variant_tag_ids: variantTagIds,
            manufacturer_ids: manufacturerIds,
            query: searchQuery || undefined,
            sort: toOrgFleetSort(sort),
            limit: FLEET_PAGE_SIZE,
            cursor: cursor ?? undefined,
            direction: toPageDirection(direction),
          },
        );

        return {
          fleet: output.fleet.map((entry) => ({
            variant: toShipVariant(entry.variant),
            count: entry.count,
          })),
          totalCitizens: output.total_citizens,
          totalShips: output.total_ships,
          nextCursor: output.next_cursor,
          prevCursor: output.previous_cursor,
        };
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
