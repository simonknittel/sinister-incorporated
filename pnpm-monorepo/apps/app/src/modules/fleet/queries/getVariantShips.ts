import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import { CursorDirection } from "@/modules/common/CursorPagination/cursorPaginationParsers";
import {
  sortAscWithAndNullLast,
  sortDescAndNullLast,
} from "@/modules/common/utils/sorting";
import { getActiveOrganizationMemberships } from "@/modules/organizations/queries/getActiveOrganizationMemberships";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  buildVariantFilterWhere,
  paginateByCursor,
  UnknownCursorBehavior,
} from "@sam-monorepo/application";
import { ORG_ID } from "@sam-monorepo/domain";
import { forbidden } from "next/navigation";
import { cache } from "react";
import { toFlightReadyFilter } from "../utils/fleetListMapping";
import {
  FleetSortParameter,
  FlightReadyParameter,
  type ShipSortParameter,
} from "../utils/fleetSearchParameters";
import { FLEET_PAGE_SIZE } from "./shipQuery";

export const getVariantShips = cache(
  withTrace(
    "getVariantShips",
    async (
      variantId: string,
      {
        flightReady = FlightReadyParameter.All,
        variantTagIds = [],
        sort = FleetSortParameter.NameAscending,
        cursor,
        direction = CursorDirection.Next,
      }: {
        flightReady?: FlightReadyParameter;
        variantTagIds?: string[];
        sort?: ShipSortParameter;
        cursor?: string | null;
        direction?: CursorDirection;
      } = {},
    ) => {
      const authentication = await requireAuthentication();
      if (!(await authentication.authorize("otherShips", "read"))) forbidden();

      /**
       * The list only ever shows ships of the organization's members, thus
       * their permission gates it as well. It runs before the variant lookup
       * so that no filter in the query parameters can decide whether the
       * permission is checked.
       */
      const memberships = await getActiveOrganizationMemberships(ORG_ID);
      const citizenIds = memberships.map((membership) => membership.citizen.id);

      // Unknown variants and variants outside the filters both end here
      const matchingVariant = await prisma.variant.findFirst({
        where: {
          id: variantId,
          ...buildVariantFilterWhere({
            flightReady: toFlightReadyFilter(flightReady),
            variantTagIds,
          }),
        },
        select: { name: true },
      });
      if (!matchingVariant) {
        return {
          ships: [],
          total: 0,
          nextCursor: null,
          prevCursor: null,
          variantName: null,
        };
      }

      const allShips = await prisma.ship.findMany({
        where: {
          ownerId: { in: citizenIds },
          variantId,
          deletedAt: null,
        },
        select: {
          id: true,
          ownerId: true,
          name: true,
          owner: {
            select: { handle: true, deletedAt: true },
          },
        },
      });

      const sortedShips = allShips.toSorted((first, second) =>
        sort === FleetSortParameter.NameAscending
          ? sortAscWithAndNullLast(
              first.owner.handle || first.ownerId,
              second.owner.handle || second.ownerId,
            )
          : sortDescAndNullLast(
              first.owner.handle || first.ownerId,
              second.owner.handle || second.ownerId,
            ),
      );

      const {
        items: ships,
        nextCursor,
        previousCursor,
      } = paginateByCursor(sortedShips, {
        cursor,
        direction,
        unknownCursor: UnknownCursorBehavior.FirstPage,
        pageSize: FLEET_PAGE_SIZE,
        getCursor: (ship) => ship.id,
      });

      return {
        ships,
        total: sortedShips.length,
        nextCursor,
        prevCursor: previousCursor,
        variantName: matchingVariant.name,
      };
    },
  ),
);
