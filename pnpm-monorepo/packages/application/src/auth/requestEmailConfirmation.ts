import { AuditEventType } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { withSpan } from "../withSpan.js";

export interface RequestEmailConfirmationOutput {
  /** False when the user has no email address or the email did not go out */
  readonly notifications_sent: boolean;
}

/**
 * Sends the email with the confirmation link to the email address of the
 * actor. The gate of the app lets an actor without a confirmed email call
 * it, because this is how the actor gets the email confirmed. The caller
 * checks that the email is not confirmed yet.
 */
export const requestEmailConfirmation = (
  context: ApplicationContext,
  actor: Actor,
): Promise<RequestEmailConfirmationOutput> =>
  withSpan(context, "requestEmailConfirmation", async () => {
    const user = await context.prisma.user.findUnique({
      where: {
        id: actor.userId,
      },
      select: {
        email: true,
      },
    });
    if (!user?.email) {
      context.log.warn("The user has no email address to confirm", {
        userId: actor.userId,
      });

      return { notifications_sent: false };
    }

    // The app handles this type itself until the notification Lambda sends
    // the email
    const notificationsSent = await triggerNotificationsAfterSave(context, [
      {
        type: "EmailConfirmation",
        payload: {
          userId: actor.userId,
          userEmail: user.email,
        },
      },
    ]);

    if (notificationsSent)
      await context.audit.create([
        {
          type: AuditEventType.EMAIL_CONFIRMATION_REQUESTED,
          data: {
            userId: actor.userId,
            email: user.email,
          },
          createdById: actor.userId,
        },
      ]);

    return { notifications_sent: notificationsSent };
  });
