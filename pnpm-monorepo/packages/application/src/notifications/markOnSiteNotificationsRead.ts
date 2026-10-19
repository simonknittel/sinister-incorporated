import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";

/**
 * The read-on-view tracking of the notification center sends the ids of the
 * viewed notifications in small batches. The limit bounds one write.
 */
export const MAXIMUM_ON_SITE_NOTIFICATIONS_PER_READ = 100;

export const markOnSiteNotificationsReadInputSchema = z.object({
  notification_ids: z
    .array(idSchema)
    .min(1)
    .max(MAXIMUM_ON_SITE_NOTIFICATIONS_PER_READ),
});

export type MarkOnSiteNotificationsReadInput = z.output<
  typeof markOnSiteNotificationsReadInputSchema
>;

export interface MarkOnSiteNotificationsReadOutput {
  /** The number of notifications that were unread before */
  readonly count: number;
}

/**
 * Marks a batch of own notifications as read. The read-on-view tracking of
 * the notification center calls it, thus the input is a batch.
 *
 * @throws ForbiddenError for a user without a citizen
 */
export const markOnSiteNotificationsRead = async (
  context: ApplicationContext,
  actor: Actor,
  input: MarkOnSiteNotificationsReadInput,
): Promise<MarkOnSiteNotificationsReadOutput> => {
  const citizenId = requireCitizen(actor).id;

  const { count } = await context.prisma.onSiteNotification.updateMany({
    where: {
      id: { in: input.notification_ids },
      citizenId,
      readAt: null,
    },
    data: {
      readAt: context.now(),
    },
  });

  /** Read-on-view sends read ids again; only real changes are logged */
  if (count > 0)
    await context.audit.create([
      {
        type: AuditEventType.ON_SITE_NOTIFICATIONS_READ,
        data: {
          citizenId,
          count,
        },
        createdById: actor.userId,
      },
    ]);

  return { count };
};
