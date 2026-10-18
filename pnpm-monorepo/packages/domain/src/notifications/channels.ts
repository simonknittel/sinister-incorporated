/**
 * Realtime channel/event vocabulary, shared between the notification-router
 * Lambda (publisher) and the app (subscriber + channel authorization).
 */
export const CITIZEN_CHANNEL_PREFIX = "private-citizen-";

export const getCitizenChannelName = (citizenId: string) =>
  `${CITIZEN_CHANNEL_PREFIX}${citizenId}`;

export const ON_SITE_NOTIFICATION_CREATED_EVENT =
  "on-site-notification-created";
