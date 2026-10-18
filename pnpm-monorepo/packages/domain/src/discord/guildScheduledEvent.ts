import { DISCORD_EVENT_DESCRIPTION_MAX_LENGTH } from "../events/eventDescription.js";

/*
 * The rules of a guild scheduled event on Discord. The client components of
 * the app use the limits, the types and the path, the use cases use the
 * problems and the modify rule, and the Discord gateway uses the types. The
 * wire format (the payload builders and the privacy level) is not here.
 */

/**
 * The channel types a guild scheduled event can be attached to. Discord has
 * many more; the channel list is filtered to these two.
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export enum DiscordChannelType {
  GuildVoice = 2,
  GuildStageVoice = 13,
}

/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types
 */
export enum DiscordScheduledEventEntityType {
  StageInstance = 1,
  Voice = 2,
  External = 3,
}

/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event. The
 * cap of the description is `DISCORD_EVENT_DESCRIPTION_MAX_LENGTH`.
 */
export const DISCORD_EVENT_NAME_MAX_LENGTH = 100;
export const DISCORD_EVENT_LOCATION_MAX_LENGTH = 100;

/**
 * Discord snowflakes are numeric strings well under this; the bound only
 * keeps an arbitrary client string out of the channel lookup.
 */
export const DISCORD_CHANNEL_ID_MAX_LENGTH = 64;

/**
 * The guild scheduled event's page on Discord, as a path for `DiscordButton`.
 * The event overview (a Server Component) and the settings card (a Client
 * Component) link there.
 */
export const getGuildScheduledEventPath = (
  guildId: string,
  scheduledEventId: string,
) =>
  `events/${encodeURIComponent(guildId)}/${encodeURIComponent(scheduledEventId)}`;

/**
 * Where the published event points on Discord. A channel carries its own
 * entity type — Discord distinguishes voice from stage events — while an
 * external event carries a free-text location instead.
 */
export type GuildScheduledEventTarget =
  | {
      readonly entityType:
        | DiscordScheduledEventEntityType.Voice
        | DiscordScheduledEventEntityType.StageInstance;
      readonly channelId: string;
    }
  | {
      readonly entityType: DiscordScheduledEventEntityType.External;
      readonly location: string;
    };

/** One channel the manager may attach an event to */
export interface PublishableGuildChannel {
  readonly id: string;
  readonly name: string;
  readonly entityType:
    | DiscordScheduledEventEntityType.Voice
    | DiscordScheduledEventEntityType.StageInstance;
}

/**
 * A lookup rather than a switch: the input is one of Discord's many channel
 * types (a plain number from the API), of which only these two carry events.
 */
const ENTITY_TYPE_BY_CHANNEL_TYPE = new Map<
  number,
  | DiscordScheduledEventEntityType.Voice
  | DiscordScheduledEventEntityType.StageInstance
>([
  [DiscordChannelType.GuildVoice, DiscordScheduledEventEntityType.Voice],
  [
    DiscordChannelType.GuildStageVoice,
    DiscordScheduledEventEntityType.StageInstance,
  ],
]);

/**
 * The entity type a guild scheduled event in the given channel gets, or null
 * for channel types Discord does not accept as an event location.
 */
export const getEntityTypeForChannelType = (channelType: number) =>
  ENTITY_TYPE_BY_CHANNEL_TYPE.get(channelType) ?? null;

export interface GuildScheduledEventContent {
  readonly name: string;
  /**
   * Never absent: the app appends the sign-up note to every description it
   * sends, so an event without a description of its own still carries the
   * note. This also avoids the asymmetry of the two endpoints — modify
   * accepts a null, create does not.
   */
  readonly description: string;
  readonly startTime: Date;
  readonly endTime: Date;
  /**
   * A `data:` URI to set as the cover, `null` when the app has no cover (so
   * Discord's is cleared), or `undefined` when the cover could not be read.
   * The last case leaves the key out of the payload — a transient S3 or
   * format problem must not wipe a cover that is already on Discord.
   */
  readonly imageDataUri: string | null | undefined;
}

/**
 * The content that the app sends again to an event that is already
 * published. Only the content of the app is sent: the target is chosen once
 * when publishing, and a change of `entity_type` would have to carry the
 * matching channel or location with it.
 */
export interface GuildScheduledEventChange {
  readonly name: string;
  readonly description: string;
  /** Null when the schedule on Discord must stay as it is */
  readonly schedule: {
    readonly startTime: Date;
    readonly endTime: Date;
  } | null;
  /** The same values as `GuildScheduledEventContent.imageDataUri` */
  readonly imageDataUri: string | null | undefined;
}

/**
 * The change for an event that is already published.
 *
 * The schedule is left out entirely once the event has started. Discord
 * refuses to move an active event's start, and sending only the end would
 * have it validated against the start Discord still holds — a manager who
 * moves a running event's times would then get the whole change rejected,
 * losing the title and description edits in the same save. The times on
 * Discord are left as they are instead (the plan accepts drift).
 */
export const toGuildScheduledEventChange = (
  content: GuildScheduledEventContent,
  now: Date,
): GuildScheduledEventChange => ({
  name: content.name,
  description: content.description,
  schedule:
    content.startTime > now
      ? { startTime: content.startTime, endTime: content.endTime }
      : null,
  imageDataUri: content.imageDataUri,
});

export enum GuildScheduledEventContentProblem {
  /**
   * Checked by the caller before the content is built: Discord requires an
   * end time for EXTERNAL events, and the app has one for every event it
   * creates itself.
   */
  MissingEndTime = "MISSING_END_TIME",
  NameTooLong = "NAME_TOO_LONG",
  DescriptionTooLong = "DESCRIPTION_TOO_LONG",
  LocationTooLong = "LOCATION_TOO_LONG",
  StartInThePast = "START_IN_THE_PAST",
  EndBeforeStart = "END_BEFORE_START",
}

/**
 * Caps Discord enforces on every request that carries the app's content.
 * The app's own name limit is higher, and the description measured here is
 * the composed one — the manager's text plus the sign-up note — so a row
 * written before the app reserved room for the note can exceed the cap.
 * Also the check for a published event's later edits: a start time now in
 * the past is fine there, since the change leaves it out.
 */
export const findContentProblem = (
  content: GuildScheduledEventContent,
): GuildScheduledEventContentProblem | null => {
  if (content.name.length > DISCORD_EVENT_NAME_MAX_LENGTH)
    return GuildScheduledEventContentProblem.NameTooLong;

  if (content.description.length > DISCORD_EVENT_DESCRIPTION_MAX_LENGTH)
    return GuildScheduledEventContentProblem.DescriptionTooLong;

  return null;
};

/**
 * What Discord would reject about publishing this event, checked before the
 * request so the app can explain it instead of surfacing a bare API failure.
 */
export const findPublishProblem = (
  content: GuildScheduledEventContent,
  target: GuildScheduledEventTarget,
  now: Date,
): GuildScheduledEventContentProblem | null => {
  const contentProblem = findContentProblem(content);
  if (contentProblem) return contentProblem;

  if (
    target.entityType === DiscordScheduledEventEntityType.External &&
    target.location.length > DISCORD_EVENT_LOCATION_MAX_LENGTH
  )
    return GuildScheduledEventContentProblem.LocationTooLong;

  if (content.startTime <= now)
    return GuildScheduledEventContentProblem.StartInThePast;

  if (content.endTime <= content.startTime)
    return GuildScheduledEventContentProblem.EndBeforeStart;

  return null;
};
