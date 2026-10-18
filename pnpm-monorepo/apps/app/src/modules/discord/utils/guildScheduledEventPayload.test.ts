import {
  DiscordScheduledEventEntityType,
  type GuildScheduledEventContent,
  type GuildScheduledEventTarget,
} from "@sam-monorepo/domain";
import { describe, expect, it } from "vitest";
import {
  buildCreateGuildScheduledEventPayload,
  buildModifyGuildScheduledEventPayload,
  DiscordScheduledEventPrivacyLevel,
} from "./guildScheduledEventPayload";

const NOW = new Date("2027-03-01T12:00:00.000Z");

const content = (
  overrides: Partial<GuildScheduledEventContent> = {},
): GuildScheduledEventContent => ({
  name: "Operation Nachtwache",
  description: "Wir treffen uns am Sammelpunkt.",
  startTime: new Date("2027-03-05T19:00:00.000Z"),
  endTime: new Date("2027-03-05T21:00:00.000Z"),
  imageDataUri: null,
  ...overrides,
});

const CHANNEL_TARGET: GuildScheduledEventTarget = {
  entityType: DiscordScheduledEventEntityType.Voice,
  channelId: "1234567890",
};

const EXTERNAL_TARGET: GuildScheduledEventTarget = {
  entityType: DiscordScheduledEventEntityType.External,
  location: "https://sam.example/app/events/abc",
};

describe("buildCreateGuildScheduledEventPayload", () => {
  it("sends channel_id and no entity_metadata for a channel event", () => {
    const payload = buildCreateGuildScheduledEventPayload(
      content(),
      CHANNEL_TARGET,
    );

    expect(payload).toEqual({
      name: "Operation Nachtwache",
      description: "Wir treffen uns am Sammelpunkt.",
      scheduled_start_time: "2027-03-05T19:00:00.000Z",
      scheduled_end_time: "2027-03-05T21:00:00.000Z",
      image: null,
      privacy_level: DiscordScheduledEventPrivacyLevel.GuildOnly,
      entity_type: DiscordScheduledEventEntityType.Voice,
      channel_id: "1234567890",
    });
  });

  it("sends entity_metadata and no channel_id for an external event", () => {
    const payload = buildCreateGuildScheduledEventPayload(
      content(),
      EXTERNAL_TARGET,
    );

    expect(payload).not.toHaveProperty("channel_id");
    expect(payload).toMatchObject({
      entity_type: DiscordScheduledEventEntityType.External,
      entity_metadata: { location: "https://sam.example/app/events/abc" },
    });
  });

  it("omits the image when the cover could not be read", () => {
    const payload = buildCreateGuildScheduledEventPayload(
      content({ imageDataUri: undefined }),
      CHANNEL_TARGET,
    );

    expect(payload).not.toHaveProperty("image");
  });
});

describe("buildModifyGuildScheduledEventPayload", () => {
  it("re-asserts name, description, schedule and cover", () => {
    const payload = buildModifyGuildScheduledEventPayload(
      content({ imageDataUri: "data:image/png;base64,AAA" }),
      NOW,
    );

    expect(payload).toEqual({
      name: "Operation Nachtwache",
      description: "Wir treffen uns am Sammelpunkt.",
      scheduled_start_time: "2027-03-05T19:00:00.000Z",
      scheduled_end_time: "2027-03-05T21:00:00.000Z",
      image: "data:image/png;base64,AAA",
    });
  });

  it("clears the cover on Discord when the app has none", () => {
    const payload = buildModifyGuildScheduledEventPayload(content(), NOW);

    expect(payload.image).toBeNull();
  });

  it("keeps Discord's cover when the app's one could not be read", () => {
    const payload = buildModifyGuildScheduledEventPayload(
      content({ imageDataUri: undefined }),
      NOW,
    );

    expect(payload).not.toHaveProperty("image");
  });

  it("sends no schedule keys for an event that already began", () => {
    const payload = buildModifyGuildScheduledEventPayload(
      content({
        startTime: new Date("2027-02-28T19:00:00.000Z"),
        endTime: new Date("2027-03-01T19:00:00.000Z"),
      }),
      NOW,
    );

    expect(payload).not.toHaveProperty("scheduled_start_time");
    expect(payload).not.toHaveProperty("scheduled_end_time");
  });
});
