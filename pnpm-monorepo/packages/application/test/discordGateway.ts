import {
  DiscordOutcome,
  type DiscordGateway,
  type DiscordResult,
  type DiscordScheduledEvent,
} from "../src/context.js";

interface TestDiscordGatewayOptions {
  /** The scheduled events that `listScheduledEvents` gives */
  readonly scheduledEvents?: readonly DiscordScheduledEvent[];
  /**
   * The users of each scheduled event. A scheduled event without an entry
   * has no users.
   */
  readonly userIdsByScheduledEventId?: Readonly<
    Record<string, readonly string[]>
  >;
  /** The scheduled events whose user list gives Failed */
  readonly failsUserListFor?: readonly string[];
}

export interface TestDiscordGatewayCall {
  readonly operation: keyof DiscordGateway;
  readonly arguments: readonly unknown[];
}

const FAILED = { outcome: DiscordOutcome.Failed } as const;

const succeed = <Data>(data: Data): DiscordResult<Data> => ({
  outcome: DiscordOutcome.Success,
  data,
});

/**
 * The Discord gateway of the tests. The reads give the fixtures, and the
 * operations without a fixture (the channels and the writes) give Failed.
 * `calls` records each call in the sequence of the calls.
 */
export const createTestDiscordGateway = ({
  scheduledEvents = [],
  userIdsByScheduledEventId = {},
  failsUserListFor = [],
}: TestDiscordGatewayOptions = {}): DiscordGateway & {
  readonly calls: TestDiscordGatewayCall[];
} => {
  const calls: TestDiscordGatewayCall[] = [];

  const record = (
    operation: keyof DiscordGateway,
    ...callArguments: unknown[]
  ) => {
    calls.push({ operation, arguments: callArguments });
  };

  return {
    calls,
    listScheduledEvents: async () => {
      record("listScheduledEvents");
      return succeed([...scheduledEvents]);
    },
    listScheduledEventUserIds: async (scheduledEventId) => {
      record("listScheduledEventUserIds", scheduledEventId);
      if (failsUserListFor.includes(scheduledEventId)) return FAILED;

      return succeed([...(userIdsByScheduledEventId[scheduledEventId] ?? [])]);
    },
    listChannels: async () => {
      record("listChannels");
      return FAILED;
    },
    createScheduledEvent: async (content, target) => {
      record("createScheduledEvent", content, target);
      return FAILED;
    },
    modifyScheduledEvent: async (scheduledEventId, change) => {
      record("modifyScheduledEvent", scheduledEventId, change);
      return FAILED;
    },
    deleteScheduledEvent: async (scheduledEventId) => {
      record("deleteScheduledEvent", scheduledEventId);
      return FAILED;
    },
  };
};
