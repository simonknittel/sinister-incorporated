import {
  findWebPushSubscription,
  pruneWebPushSubscriptions,
  WebPushPruneReason,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type WebPushSubscription } from "@sam-monorepo/database";
import { sendNotification, setVapidDetails, WebPushError } from "web-push";
import { log } from "../../common/logger";
import { env } from "../setup";
import { toLoggableWebPushError } from "../toLoggableWebPushError";

setVapidDetails(env.BASE_URL, env.PUBLIC_VAPID_KEY, env.PRIVATE_VAPID_KEY);

interface Payload {
  subscriptionId: WebPushSubscription["id"];
}

export const WebPushSubscribedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const subscription = await findWebPushSubscription(context, {
    subscriptionId: payload.subscriptionId,
  });

  if (!subscription) {
    log.warn("Subscription not found", {
      subscriptionId: payload.subscriptionId,
    });
    return;
  }

  /**
   * Send a test notification directly to the newly subscribed device
   * This bypasses the notification settings check since it's a confirmation notification
   */
  const notificationPayload = JSON.stringify({
    title: "Browser-Benachrichtigungen aktiviert | SAM",
    body: "Du erhältst ab sofort Benachrichtigungen auf diesem Gerät.",
  });

  try {
    await sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      notificationPayload,
      {
        TTL: 60 * 60 * 24, // 1 day
        urgency: "high",
      },
    );

    log.info("Test notification sent successfully", {
      subscriptionId: subscription.id,
    });
  } catch (error) {
    if (
      error instanceof WebPushError &&
      (error.statusCode === 410 || error.statusCode === 404)
    ) {
      log.warn("Subscription is no longer valid, removing from database", {
        subscriptionId: subscription.id,
        statusCode: error.statusCode,
      });

      await pruneWebPushSubscriptions(context, {
        subscriptionIds: [subscription.id],
        reason: WebPushPruneReason.Invalid,
      });
    } else {
      log.error("Error sending test notification", {
        error: toLoggableWebPushError(error),
        subscriptionId: subscription.id,
      });
    }
  }
};
