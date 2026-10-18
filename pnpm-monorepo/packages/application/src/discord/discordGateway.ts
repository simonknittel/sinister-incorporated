import {
  DiscordOutcome,
  type ApplicationContext,
  type DiscordGateway,
  type DiscordResult,
} from "../context.js";

/**
 * Calls the Discord gateway of the context. A host without a bot token has
 * no gateway: then the result is Failed, as when Discord cannot be reached.
 */
export const callDiscord = async <Data>(
  context: ApplicationContext,
  call: (gateway: DiscordGateway) => Promise<DiscordResult<Data>>,
): Promise<DiscordResult<Data>> => {
  if (!context.discord) {
    context.log.warn("The Discord gateway is not configured");
    return { outcome: DiscordOutcome.Failed };
  }

  return call(context.discord);
};
