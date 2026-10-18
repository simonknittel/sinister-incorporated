import { createId } from "@paralleldrive/cuid2";
import type { ApplicationContext } from "@sam-monorepo/application";
import type { EmitEvents } from "../eventbridge/createEventBridgeEmitter.js";

/** The rule of the notification router matches only this detail type */
const NOTIFICATION_REQUESTED_DETAIL_TYPE = "NotificationRequested";

export interface EventBridgeNotificationTriggerOptions {
  readonly emitEvents: EmitEvents;
  /**
   * The `Source` of the events: the host that requests the notifications,
   * for example "App" or the name of a Lambda function
   */
  readonly source: string;
}

/**
 * Sends each notification as one `NotificationRequested` event to the
 * notification router. The router processes each `requestId` only once.
 */
export const createEventBridgeNotificationTrigger = ({
  emitEvents,
  source,
}: EventBridgeNotificationTriggerOptions): ApplicationContext["notifications"] => ({
  trigger: (notifications) =>
    emitEvents(
      notifications.map((notification) => ({
        Source: source,
        DetailType: NOTIFICATION_REQUESTED_DETAIL_TYPE,
        Detail: JSON.stringify({
          type: notification.type,
          payload: notification.payload,
          requestId: createId(),
        }),
      })),
    ),
});
