import type { PutEventsCommandOutput } from "@aws-sdk/client-eventbridge";
import { describe, expect, test, vi } from "vitest";
import {
  createEventBridgeEmitter,
  EventBridgeFailedEntriesError,
  type EventBridgeEmitterOptions,
  type EventBridgeEntry,
} from "./createEventBridgeEmitter.js";

type Send = NonNullable<EventBridgeEmitterOptions["client"]>["send"];

const EVENT_BUS_ARN =
  "arn:aws:events:eu-central-1:123456789012:event-bus/default";

const createEntries = (count: number): EventBridgeEntry[] =>
  Array.from({ length: count }, (unused, index) => ({
    Source: "test",
    DetailType: "NotificationRequested",
    Detail: JSON.stringify({ index }),
  }));

const createEmitter = (response: PutEventsCommandOutput) => {
  const send = vi.fn<Send>(async () => response);
  const emitEvents = createEventBridgeEmitter({
    client: { send },
    eventBusArn: EVENT_BUS_ARN,
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  });

  return { emitEvents, send };
};

describe("createEventBridgeEmitter", () => {
  test("sends the entries in batches of ten to the event bus", async () => {
    const { emitEvents, send } = createEmitter({
      $metadata: {},
      FailedEntryCount: 0,
    });

    await emitEvents(createEntries(23));

    const batches = send.mock.calls.map(([command]) => command.input.Entries);
    expect(batches.map((batch) => batch?.length)).toEqual([10, 10, 3]);
    expect(
      batches.flat().every((entry) => entry?.EventBusName === EVENT_BUS_ARN),
    ).toBe(true);
  });

  test("throws when EventBridge does not take an entry", async () => {
    const response = { $metadata: {}, FailedEntryCount: 1 };
    const { emitEvents, send } = createEmitter(response);

    const error = await emitEvents(createEntries(15)).catch(
      (thrown: unknown) => thrown,
    );

    expect(error).toBeInstanceOf(EventBridgeFailedEntriesError);
    expect((error as Error).cause).toBe(response);
    expect(send).toHaveBeenCalledOnce();
  });
});
