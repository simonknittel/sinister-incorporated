import { emitEvents } from "@/modules/eventbridge/utils";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { createEventBridgeNotificationTrigger } from "@sam-monorepo/infrastructure";

/** The `trigger` of the notifications port of the app */
export const triggerNotifications = withTrace(
  "triggerNotifications",
  createEventBridgeNotificationTrigger({ emitEvents, source: "App" }).trigger,
);
