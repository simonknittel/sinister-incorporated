import type {
  EVENT_PAGE_RELATIONS_SELECT,
  EventLineupCitizen,
} from "@sam-monorepo/application";
import type { Prisma } from "@sam-monorepo/database/client";

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
 * One event participant with the ships the lineup matches against a
 * position's required variants
 */
export type EventCitizenWithShips = EventLineupCitizen;
