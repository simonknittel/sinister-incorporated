import { createEventBridgeNotificationTrigger } from "@sam-monorepo/infrastructure";
import { emitEvents } from "../common/eventbridge";

export const { trigger: triggerNotifications } =
  createEventBridgeNotificationTrigger({
    emitEvents,
    source: "scrape-discord-events",
  });
