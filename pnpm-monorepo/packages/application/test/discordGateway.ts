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

const FAILED = { outcome: DiscordOutcome.Failed } as const;

const succeed = <Data>(data: Data): DiscordResult<Data> => ({
  outcome: DiscordOutcome.Success,
  data,
});

/**
 * The Discord gateway of the tests. The reads give the fixtures, and the
 * operations without a fixture (the channels and the writes) give Failed.
 * `calls` records the operation of each call in the sequence of the calls.
 */
export const createTestDiscordGateway = ({
  scheduledEvents = [],
  userIdsByScheduledEventId = {},
  failsUserListFor = [],
}: TestDiscordGatewayOptions = {}): DiscordGateway & {
  readonly calls: (keyof DiscordGateway)[];
} => {
  const calls: (keyof DiscordGateway)[] = [];

  const record = (operation: keyof DiscordGateway) => {
    calls.push(operation);
  };

  return {
    calls,
    listScheduledEvents: async () => {
      record("listScheduledEvents");
      return succeed([...scheduledEvents]);
    },
    listScheduledEventUserIds: async (scheduledEventId) => {
      record("listScheduledEventUserIds");
      if (failsUserListFor.includes(scheduledEventId)) return FAILED;

      return succeed([...(userIdsByScheduledEventId[scheduledEventId] ?? [])]);
    },
    listChannels: async () => {
      record("listChannels");
      return FAILED;
    },
    createScheduledEvent: async () => {
      record("createScheduledEvent");
      return FAILED;
    },
    modifyScheduledEvent: async () => {
      record("modifyScheduledEvent");
      return FAILED;
    },
    deleteScheduledEvent: async () => {
      record("deleteScheduledEvent");
      return FAILED;
    },
  };
};
