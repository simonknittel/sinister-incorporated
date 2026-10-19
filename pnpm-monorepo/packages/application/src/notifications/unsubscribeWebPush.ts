import { AuditEventType } from "@sam-monorepo/domain";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export interface UnsubscribeWebPushOutput {
  readonly deleted_count: number;
}

/**
 * Deletes all web push subscriptions of the citizen (all devices). The use
 * case cannot take back the permission of a browser, but without the stored
 * subscriptions no push notification goes out anymore.
 *
 * @throws ForbiddenError for a user without a citizen
 */
export const unsubscribeWebPush = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<UnsubscribeWebPushOutput> => {
  const citizenId = requireCitizen(actor).id;

  const { count } = await context.prisma.webPushSubscription.deleteMany({
    where: {
      citizenId,
    },
  });

  if (count > 0)
    await context.audit.create([
      {
        type: AuditEventType.WEB_PUSH_UNSUBSCRIBED,
        data: {
          citizenId,
          count,
        },
        createdById: actor.userId,
      },
    ]);

  return { deleted_count: count };
};
