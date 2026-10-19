import type { NotificationChannel } from "@sam-monorepo/database/browser";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/**
 * The number of unread notifications in the inbox of the citizen of the
 * actor, or 0 for a user without a citizen. An archived notification does
 * not count, also when it is unread.
 */
export const countOwnUnreadOnSiteNotifications = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<number> => {
  if (!actor.citizen) return 0;

  return context.prisma.onSiteNotification.count({
    where: {
      citizenId: actor.citizen.id,
      readAt: null,
      archivedAt: null,
    },
  });
};

/** A notification type that the citizen switched off for a channel */
export interface OwnNotificationSetting {
  readonly notificationType: string;
  readonly channel: NotificationChannel;
}

/**
 * The notification types that the citizen of the actor switched off, or
 * null for a user without a citizen
 */
export const findOwnNotificationSettings = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<OwnNotificationSetting[] | null> => {
  if (!actor.citizen) return null;

  return context.prisma.notificationSetting.findMany({
    where: {
      citizenId: actor.citizen.id,
    },
    select: {
      notificationType: true,
      channel: true,
    },
  });
};

/**
 * The number of devices with web push of the citizen of the actor, or 0 for
 * a user without a citizen
 */
export const countOwnWebPushSubscriptions = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<number> => {
  if (!actor.citizen) return 0;

  return context.prisma.webPushSubscription.count({
    where: {
      citizenId: actor.citizen.id,
    },
  });
};
