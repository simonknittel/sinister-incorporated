import { env } from "@/env";

/**
 * The forms run in the browser and cannot import the application package,
 * thus they have a copy of its limit. The use cases check the limit of the
 * package (`EVENT_NAME_MAX_LENGTH` in `packages/application/src/events`).
 * Change both together.
 */
export const EVENT_NAME_MAX_LENGTH = 128;

/** A copy of the limit of the application package, see `EVENT_NAME_MAX_LENGTH` */
export const EVENT_MAX_VISIBILITY_ROLES = 50;

export const getEventPath = (eventId: string) => `/app/events/${eventId}`;

/**
 * The event's page as an absolute address, for a reader outside the app —
 * the location of an external guild scheduled event, and the link in the
 * sign-up note (see `discordEventDescription`).
 */
export const getEventUrl = (eventId: string) =>
  new URL(getEventPath(eventId), env.NEXT_PUBLIC_BASE_URL).toString();

/**
 * Search param the create action redirects with when the new event could not
 * be published to Discord. Its own response has no room for a warning — the
 * action redirects to the created event — so the event page says it instead.
 */
export const DISCORD_PUBLISH_FAILED_PARAM = "discordPublishFailed";

/**
 * Search param the create action redirects with when the notifications about
 * the new event could not be sent, for the same reason as
 * DISCORD_PUBLISH_FAILED_PARAM.
 */
export const NOTIFICATIONS_FAILED_PARAM = "notificationsFailed";
