import {
  PutEventsCommand,
  type PutEventsCommandOutput,
  type PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";
import type { Logger } from "@sam-monorepo/application";

/** `PutEvents` accepts at most ten entries per call */
const BATCH_SIZE = 10;

/** An entry without the event bus: the emitter sets it */
export type EventBridgeEntry = Omit<PutEventsRequestEntry, "EventBusName">;

export type EmitEvents = (entries: EventBridgeEntry[]) => Promise<void>;

export interface EventBridgeEmitterOptions {
  /** Null when the host has no credentials for AWS */
  readonly client: {
    readonly send: (
      command: PutEventsCommand,
    ) => Promise<PutEventsCommandOutput>;
  } | null;
  readonly eventBusArn: string | null | undefined;
  readonly log: Logger;
}

/** EventBridge did not take one or more entries of a batch */
export class EventBridgeFailedEntriesError extends Error {
  override readonly name = "EventBridgeFailedEntriesError";

  constructor(response: PutEventsCommandOutput) {
    super("Failed to send events to EventBridge", { cause: response });
  }
}

/**
 * Sends the entries to the event bus, in batches of ten entries. Without a
 * client or an event bus, EventBridge is not configured (for example in
 * local development): then the emitter logs this and sends nothing.
 *
 * @throws EventBridgeFailedEntriesError when EventBridge does not take an
 * entry. The batches after the failed batch are not sent.
 */
export const createEventBridgeEmitter =
  ({ client, eventBusArn, log }: EventBridgeEmitterOptions): EmitEvents =>
  async (entries) => {
    if (!client || !eventBusArn) {
      log.info("EventBridge is not configured. The events are not sent.");
      return;
    }

    if (entries.length === 0) {
      log.info("No entries to send to EventBridge");
      return;
    }

    for (let index = 0; index < entries.length; index += BATCH_SIZE) {
      const response = await client.send(
        new PutEventsCommand({
          Entries: entries
            .slice(index, index + BATCH_SIZE)
            .map((entry) => ({ ...entry, EventBusName: eventBusArn })),
        }),
      );

      if (response.FailedEntryCount)
        throw new EventBridgeFailedEntriesError(response);
    }
  };
