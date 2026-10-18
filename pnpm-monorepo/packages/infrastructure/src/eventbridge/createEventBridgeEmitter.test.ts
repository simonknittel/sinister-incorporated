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

const TAKEN_RESPONSE: PutEventsCommandOutput = {
  $metadata: {},
  FailedEntryCount: 0,
};

const FAILED_RESPONSE: PutEventsCommandOutput = {
  $metadata: {},
  FailedEntryCount: 1,
};

const createEntries = (count: number): EventBridgeEntry[] =>
  Array.from({ length: count }, (unused, index) => ({
    Source: "test",
    DetailType: "NotificationRequested",
    Detail: JSON.stringify({ index }),
  }));

const createEmitter = (...responses: PutEventsCommandOutput[]) => {
  const send = vi.fn<Send>();
  for (const response of responses) send.mockResolvedValueOnce(response);

  const emitEvents = createEventBridgeEmitter({
    client: { send },
    eventBusArn: EVENT_BUS_ARN,
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  });

  return { emitEvents, send };
};

describe("createEventBridgeEmitter", () => {
  test("sends the entries in batches of ten to the event bus", async () => {
    const { emitEvents, send } = createEmitter(
      TAKEN_RESPONSE,
      TAKEN_RESPONSE,
      TAKEN_RESPONSE,
    );

    await emitEvents(createEntries(23));

    const batches = send.mock.calls.map(([command]) => command.input.Entries);
    expect(batches.map((batch) => batch?.length)).toEqual([10, 10, 3]);
    expect(
      batches.flat().every((entry) => entry?.EventBusName === EVENT_BUS_ARN),
    ).toBe(true);
  });

  test("sends all batches, then throws when EventBridge does not take an entry", async () => {
    const { emitEvents, send } = createEmitter(FAILED_RESPONSE, TAKEN_RESPONSE);

    const error = await emitEvents(createEntries(15)).catch(
      (thrown: unknown) => thrown,
    );

    expect(send).toHaveBeenCalledTimes(2);
    expect(error).toBeInstanceOf(EventBridgeFailedEntriesError);
    expect((error as Error).cause).toEqual([FAILED_RESPONSE]);
  });

  test("sends nothing when EventBridge is not configured", async () => {
    const send = vi.fn<Send>();
    const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await expect(
      createEventBridgeEmitter({
        client: null,
        eventBusArn: EVENT_BUS_ARN,
        log,
      })(createEntries(1)),
    ).resolves.toBeUndefined();
    await expect(
      createEventBridgeEmitter({
        client: { send },
        eventBusArn: undefined,
        log,
      })(createEntries(1)),
    ).resolves.toBeUndefined();

    expect(send).not.toHaveBeenCalled();
  });
});
