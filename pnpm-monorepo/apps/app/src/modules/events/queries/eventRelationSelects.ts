import type { EVENT_PAGE_RELATIONS_SELECT } from "@sam-monorepo/application";
import type { Event, Prisma, Ship } from "@sam-monorepo/database/client";

/*
 * The prop types every event surface states, derived from the relation
 * shapes that the event detail query and the event list query share (see
 * `EVENT_PAGE_RELATIONS_SELECT` of the application package) — the layout,
 * the seven subpages, the list tiles and their client components all declare
 * these. Deriving rather than restating them keeps a narrowed query and the
 * props it feeds from drifting apart.
 */

export type EventCitizenReference = Prisma.CitizenGetPayload<{
  select: (typeof EVENT_PAGE_RELATIONS_SELECT)["managers"]["select"];
}>;

export type EventCoverImage = Prisma.UploadGetPayload<{
  select: (typeof EVENT_PAGE_RELATIONS_SELECT)["coverImage"]["select"];
}>;

export type EventParticipantRow = Prisma.EventParticipantGetPayload<{
  select: (typeof EVENT_PAGE_RELATIONS_SELECT)["participants"]["select"];
}>;

/**
 * The ships that the requirement check of the lineup compares with the
 * required variants: the ships that are not deleted, of a variant that a
 * position of the event requires. The check of the signed-in citizen and the
 * check of the participants use the same rule, thus they cannot disagree.
 */
export const buildRequiredVariantShipWhere = (eventId: Event["id"]) =>
  ({
    deletedAt: null,
    variant: {
      eventPositionRequiredVariants: {
        some: {
          position: {
            eventId,
          },
        },
      },
    },
  }) satisfies Prisma.ShipWhereInput;

/**
 * One event participant with the ships the lineup matches against a
 * position's required variants, see `buildRequiredVariantShipWhere()`
 */
export interface EventCitizenWithShips {
  readonly citizen: EventCitizenReference;
  readonly ships: Pick<Ship, "variantId">[];
}
