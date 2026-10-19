import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";

export const archiveOnSiteNotificationInputSchema = z.object({
  notification_id: idSchema,
});

export type ArchiveOnSiteNotificationInput = z.output<
  typeof archiveOnSiteNotificationInputSchema
>;

export interface ArchiveOnSiteNotificationOutput {
  readonly notification_id: string;
  /**
   * False when the notification is not an own notification or is archived
   * already
   */
  readonly changed: boolean;
}

/**
 * Moves an own notification from the inbox to the archive. The read state
 * does not change.
 *
 * @throws ForbiddenError for a user without a citizen
 */
export const archiveOnSiteNotification = async (
  context: ApplicationContext,
  actor: Actor,
  input: ArchiveOnSiteNotificationInput,
): Promise<ArchiveOnSiteNotificationOutput> => {
  const citizenId = requireCitizen(actor).id;

  const { count } = await context.prisma.onSiteNotification.updateMany({
    where: {
      id: input.notification_id,
      citizenId,
      archivedAt: null,
    },
    data: {
      archivedAt: context.now(),
    },
  });

  if (count > 0)
    await context.audit.create([
      {
        type: AuditEventType.ON_SITE_NOTIFICATION_ARCHIVED,
        data: {
          citizenId,
          notificationId: input.notification_id,
        },
        createdById: actor.userId,
      },
    ]);

  return { notification_id: input.notification_id, changed: count > 0 };
};
