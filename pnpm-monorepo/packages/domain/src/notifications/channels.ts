/**
 * Realtime channel/event vocabulary, shared between the notification-router
 * Lambda (publisher) and the app (subscriber + channel authorization).
 */
export const CITIZEN_CHANNEL_PREFIX = "private-citizen-";

export const getCitizenChannelName = (citizenId: string) =>
  `${CITIZEN_CHANNEL_PREFIX}${citizenId}`;

/** The channel of one event. The app has no subscriber for it at the moment. */
export const EVENT_CHANNEL_PREFIX = "private-event-";

/** The limit of Pusher Channels for the name of a channel */
export const MAXIMUM_REALTIME_CHANNEL_NAME_LENGTH = 164;

export const ON_SITE_NOTIFICATION_CREATED_EVENT =
  "on-site-notification-created";
