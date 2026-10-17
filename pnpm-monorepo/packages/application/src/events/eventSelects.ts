import type { Prisma } from "@sam-monorepo/database/client";

/*
 * Event pages serialize these shapes into the browser, so a full Citizen or
 * Upload row here would ship a citizen's Discord id, Teamspeak id and SILC
 * balances with every event.
 */

/** A citizen as the event surfaces render them: a `CitizenLink`, no more */
const EVENT_CITIZEN_SELECT = {
  id: true,
  handle: true,
  deletedAt: true,
} as const satisfies Prisma.CitizenSelect;

/** A cover image as `getPublicUploadUrl()` and `next/image` need it */
const EVENT_COVER_IMAGE_SELECT = {
  id: true,
  mimeType: true,
} as const satisfies Prisma.UploadSelect;

/** The participation columns the event surfaces read */
const EVENT_PARTICIPANT_SELECT = {
  id: true,
  citizenId: true,
  discordUserId: true,
  comment: true,
  createdAt: true,
} as const satisfies Prisma.EventParticipantSelect;

/**
 * Spread into every query that loads an event for a page: the active
 * participants, the managers and the cover image.
 */
export const EVENT_PAGE_RELATIONS_SELECT = {
  participants: {
    where: { cancelledAt: null },
    select: EVENT_PARTICIPANT_SELECT,
  },
  managers: { select: EVENT_CITIZEN_SELECT },
  coverImage: { select: EVENT_COVER_IMAGE_SELECT },
} as const satisfies Prisma.EventSelect;

/**
 * One event with everything its layout and its subpages share. The position
 * tree is deliberately not part of it: only the lineup renders it.
 */
export const EVENT_DETAILS_INCLUDE = {
  ...EVENT_PAGE_RELATIONS_SELECT,
  visibilityRoles: { select: { roleId: true } },
  createdBy: { select: EVENT_CITIZEN_SELECT },
} as const satisfies Prisma.EventInclude;

export type EventDetails = Prisma.EventGetPayload<{
  include: typeof EVENT_DETAILS_INCLUDE;
}>;
