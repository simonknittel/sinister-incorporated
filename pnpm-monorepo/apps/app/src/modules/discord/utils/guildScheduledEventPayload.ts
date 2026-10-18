import {
  DiscordScheduledEventEntityType,
  toGuildScheduledEventChange,
  type GuildScheduledEventContent,
  type GuildScheduledEventTarget,
} from "@sam-monorepo/domain";

/**
 * GUILD_ONLY is the only level Discord still accepts for guild scheduled
 * events.
 * https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level
 */
export enum DiscordScheduledEventPrivacyLevel {
  GuildOnly = 2,
}

/**
 * `POST /guilds/{guild.id}/scheduled-events`. `channel_id` must be absent
 * for EXTERNAL events and `entity_metadata` for the channel-bound ones —
 * Discord rejects the payload otherwise.
 */
export const buildCreateGuildScheduledEventPayload = (
  content: GuildScheduledEventContent,
  target: GuildScheduledEventTarget,
) => ({
  name: content.name,
  description: content.description,
  scheduled_start_time: content.startTime.toISOString(),
  scheduled_end_time: content.endTime.toISOString(),
  ...(content.imageDataUri === undefined
    ? {}
    : { image: content.imageDataUri }),
  privacy_level: DiscordScheduledEventPrivacyLevel.GuildOnly,
  entity_type: target.entityType,
  ...(target.entityType === DiscordScheduledEventEntityType.External
    ? { entity_metadata: { location: target.location } }
    : { channel_id: target.channelId }),
});

/**
 * `PATCH /guilds/{guild.id}/scheduled-events/{id}`. The content of the
 * change comes from `toGuildScheduledEventChange()`, which leaves out the
 * schedule once the event has started.
 */
export const buildModifyGuildScheduledEventPayload = (
  content: GuildScheduledEventContent,
  now: Date,
) => {
  const change = toGuildScheduledEventChange(content, now);

  return {
    name: change.name,
    description: change.description,
    ...(change.schedule
      ? {
          scheduled_start_time: change.schedule.startTime.toISOString(),
          scheduled_end_time: change.schedule.endTime.toISOString(),
        }
      : {}),
    ...(change.imageDataUri === undefined
      ? {}
      : { image: change.imageDataUri }),
  };
};
