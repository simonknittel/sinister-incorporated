import { AuditEventType } from "@sam-monorepo/domain";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export interface MarkAllOnSiteNotificationsReadOutput {
  /** The number of notifications that were unread before */
  readonly count: number;
}

/**
 * Marks all unread notifications of the inbox as read. The archive does not
 * change.
 *
 * @throws ForbiddenError for a user without a citizen
 */
export const markAllOnSiteNotificationsRead = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<MarkAllOnSiteNotificationsReadOutput> => {
  const citizenId = requireCitizen(actor).id;

  const { count } = await context.prisma.onSiteNotification.updateMany({
    where: {
      citizenId,
      readAt: null,
      archivedAt: null,
    },
    data: {
      readAt: context.now(),
    },
  });

  if (count > 0)
    await context.audit.create([
      {
        type: AuditEventType.ON_SITE_NOTIFICATIONS_ALL_READ,
        data: {
          citizenId,
          count,
        },
        createdById: actor.userId,
      },
    ]);

  return { count };
};
