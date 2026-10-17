import { CursorDirection } from "@/modules/common/CursorPagination/cursorPaginationParsers";
import {
  FlightReadyFilter,
  PageDirection,
  ShipSort,
  type listMyShips,
  type ListShipsOutput,
  type ShipVariantOutput,
} from "@sam-monorepo/application";
import { FLEET_PAGE_SIZE, type ShipVariant } from "../queries/shipQuery";

/** The values of the `flight_ready` search parameter of the fleet filters */
export type FlightReadyParameter = "all" | "flight_ready";

export const toFlightReadyFilter = (flightReady: FlightReadyParameter) =>
  flightReady === "flight_ready"
    ? FlightReadyFilter.Yes
    : FlightReadyFilter.All;

export const toPageDirection = (direction: CursorDirection) =>
  direction === CursorDirection.Prev
    ? PageDirection.Previous
    : PageDirection.Next;

/** Gives the variant of a use case the form that the fleet tables use */
export const toShipVariant = (variant: ShipVariantOutput): ShipVariant => ({
  id: variant.id,
  name: variant.name,
  status: variant.status,
  series: {
    id: variant.series.id,
    name: variant.series.name,
    manufacturer: {
      id: variant.manufacturer.id,
      name: variant.manufacturer.name,
      image: variant.manufacturer.logo && {
        id: variant.manufacturer.logo.upload_id,
        mimeType: variant.manufacturer.logo.mime_type,
      },
    },
  },
  tags: variant.tags,
});

/** The search parameters of the ship list of one citizen */
export interface OwnerFleetOptions {
  readonly flightReady?: FlightReadyParameter;
  readonly variantTagIds?: string[];
  readonly manufacturerIds?: string[];
  readonly sort?: "name-asc" | "name-desc";
  readonly showDeleted?: "all" | "deleted";
  readonly searchQuery?: string | null;
  readonly cursor?: string | null;
  readonly direction?: CursorDirection;
}

export const toOwnerShipsInput = ({
  flightReady = "all",
  variantTagIds = [],
  manufacturerIds = [],
  sort = "name-asc",
  showDeleted = "all",
  searchQuery,
  cursor,
  direction = CursorDirection.Next,
}: OwnerFleetOptions): Parameters<typeof listMyShips>[2] => ({
  flight_ready: toFlightReadyFilter(flightReady),
  variant_tag_ids: variantTagIds,
  manufacturer_ids: manufacturerIds,
  query: searchQuery || undefined,
  // "all" of the filter means all ships that are not deleted
  deleted: showDeleted === "deleted",
  sort: sort === "name-desc" ? ShipSort.NameDescending : ShipSort.NameAscending,
  limit: FLEET_PAGE_SIZE,
  cursor: cursor ?? undefined,
  direction: toPageDirection(direction),
});

/** Gives a ship list of a use case the form that the ships table uses */
export const toShipsPage = (output: ListShipsOutput) => ({
  ships: output.ships.map((ship) => ({
    id: ship.id,
    name: ship.name,
    deletedAt: ship.deleted_at === null ? null : new Date(ship.deleted_at),
    variant: toShipVariant(ship.variant),
  })),
  total: output.total,
  nextCursor: output.next_cursor,
  prevCursor: output.previous_cursor,
});
