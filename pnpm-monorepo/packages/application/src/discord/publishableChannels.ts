import {
  getEntityTypeForChannelType,
  type PublishableGuildChannel,
} from "@sam-monorepo/domain";
import { DiscordOutcome, type ApplicationContext } from "../context.js";
import { callDiscord } from "./discordGateway.js";

/**
 * The voice and stage channels of the guild — the only ones Discord accepts
 * as the location of a guild scheduled event. Deliberately unfiltered by the
 * viewer's own Discord permissions: the app would have to mirror Discord's
 * permission model to do that, and the bot only ever sees channels it may
 * see itself.
 *
 * Gives null when Discord could not be reached, which the UI shows as
 * "channel picking unavailable" rather than as an empty guild. No permission
 * check: the callers check the permission.
 */
export const findPublishableDiscordChannels = async (
  context: ApplicationContext,
): Promise<PublishableGuildChannel[] | null> => {
  const result = await callDiscord(context, (gateway) =>
    gateway.listChannels(),
  );
  if (result.outcome !== DiscordOutcome.Success) return null;

  return result.data
    .flatMap((channel) => {
      const entityType = getEntityTypeForChannelType(channel.type);
      if (entityType === null) return [];

      return [
        {
          id: channel.id,
          name: channel.name,
          entityType,
          position: channel.position ?? 0,
        },
      ];
    })
    .toSorted(
      (first, second) =>
        first.position - second.position ||
        first.name.localeCompare(second.name, "de"),
    )
    .map(({ id, name, entityType }) => ({ id, name, entityType }));
};
