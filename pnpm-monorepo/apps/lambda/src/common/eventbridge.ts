import {
  createEventBridgeClient,
  createEventBridgeEmitter,
  EventBridgeFailedEntriesError,
  type EventBridgeEntry,
} from "@sam-monorepo/infrastructure";
import { log } from "./logger";
import { captureAsyncFunc } from "./xray";

export const emitEventsOrThrow = createEventBridgeEmitter({
  client: createEventBridgeClient(),
  eventBusArn: process.env.AWS_EVENT_BUS_ARN,
  log,
});

/**
 * Sends the entries to the event bus. When EventBridge does not take an
 * entry, the function logs the error and does not throw. Other errors go to
 * the caller. This keeps the behavior of the automations until the
 * automations become use cases. Then this wrapper goes away.
 */
export const emitEvents = async (entries: EventBridgeEntry[]) => {
  await captureAsyncFunc("emitEvents", async () => {
    try {
      await emitEventsOrThrow(entries);
    } catch (error) {
      if (!(error instanceof EventBridgeFailedEntriesError)) throw error;

      log.error("Failed to send events to EventBridge", { error });
    }
  });
};
