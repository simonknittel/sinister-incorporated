import {
  DiscordOutcome,
  withSpan,
  type ApplicationContext,
  type DiscordGateway,
  type DiscordResult,
} from "@sam-monorepo/application";
import { setTimeout } from "node:timers/promises";
import type * as z from "zod";
import {
  channelsResponseSchema,
  createdScheduledEventResponseSchema,
  DISCORD_ERROR_UNKNOWN_GUILD_SCHEDULED_EVENT,
  errorResponseSchema,
  scheduledEventsResponseSchema,
  scheduledEventUserIdsResponseSchema,
} from "./discordSchemas.js";
import {
  buildCreateGuildScheduledEventPayload,
  buildModifyGuildScheduledEventPayload,
} from "./guildScheduledEventPayload.js";

/** The maximum `limit` of the endpoint that lists the users of an event */
const USER_PAGE_SIZE = 100;

/**
 * 10,000 users, far more than the interested users of an event of the guild.
 * The limit only stops an endless loop when Discord does not return what its
 * documentation says.
 */
const MAXIMUM_USER_PAGE_COUNT = 100;

/**
 * The one error that means this event is gone from the guild, as opposed to
 * the guild itself being out of reach.
 */
const NOT_FOUND_ERROR_CODES = [DISCORD_ERROR_UNKNOWN_GUILD_SCHEDULED_EVENT];

export interface DiscordGatewayOptions {
  /** With its path, for example `https://discord.com/api/v10` */
  readonly apiBaseUrl: string;
  readonly botToken: string;
  readonly guildId: string;
  /**
   * Discord requires this exact shape and may block requests without it at
   * the Cloudflare layer: `DiscordBot (<URL>, <version>)`. Without it, the
   * gateway sends no `User-Agent` header.
   * https://discord.com/developers/docs/reference#user-agent
   */
  readonly userAgent?: string;
  /** The maximum time of one request, also of a retry */
  readonly requestTimeoutMilliseconds: number;
  /**
   * Discord answers a rate limit with the seconds to wait. The gateway waits
   * and sends the request again, when the wait is not longer than
   * `maximumWaitSeconds` and the request has not been retried
   * `maximumRetryCount` times. Otherwise the result is Failed. A rate limit
   * without a wait value is never retried.
   */
  readonly rateLimitRetry: {
    readonly maximumRetryCount: number;
    readonly maximumWaitSeconds: number;
  };
  readonly log: ApplicationContext["log"];
  readonly tracer: ApplicationContext["tracer"];
}

enum DiscordRequestMethod {
  Get = "GET",
  Post = "POST",
  Patch = "PATCH",
  Delete = "DELETE",
}

interface DiscordRequest<Schema extends z.ZodType | undefined> {
  readonly method: DiscordRequestMethod;
  /** The path below the API base, starting with a slash. Encoded IDs only. */
  readonly path: string;
  readonly query?: URLSearchParams;
  readonly body?: unknown;
  /**
   * Absent where the response carries nothing that the gateway needs:
   * Discord answers a DELETE with an empty 204, and a modified event is
   * fully described by what the gateway just sent.
   */
  readonly responseSchema?: Schema;
  /**
   * Discord JSON error codes that mean "the resource this call addresses no
   * longer exists" and nothing broader. Without them, every error is a plain
   * failure.
   */
  readonly notFoundErrorCodes?: readonly number[];
}

type ResponseData<Schema extends z.ZodType | undefined> =
  Schema extends z.ZodType ? z.infer<Schema> : null;

/**
 * Seconds that Discord asks to wait, from the error body or from the header,
 * or null when it names neither.
 */
const getRetryAfterSeconds = (
  response: Response,
  retryAfterFromBody: number | undefined,
) => {
  if (retryAfterFromBody !== undefined) return retryAfterFromBody;

  const header = response.headers.get("Retry-After");
  if (header === null) return null;

  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds : null;
};

const readErrorBody = async (response: Response) => {
  try {
    const body: unknown = await response.json();
    const parsed = errorResponseSchema.safeParse(body);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/**
 * The bot of the guild, on the REST API of Discord. No method throws: every
 * failure mode is a `DiscordResult`, so a caller can decide between healing
 * its own state (the event is gone) and warning the user, and a Discord
 * outage never takes the mutation of the app with it.
 */
export const createDiscordGateway = (
  options: DiscordGatewayOptions,
): DiscordGateway => {
  const { log } = options;

  const guildPath = `/guilds/${encodeURIComponent(options.guildId)}`;
  const scheduledEventsPath = `${guildPath}/scheduled-events`;
  const getScheduledEventPath = (scheduledEventId: string) =>
    `${scheduledEventsPath}/${encodeURIComponent(scheduledEventId)}`;

  /**
   * `new URL(path, base)` would drop the `/api/v10` path of the base, so the
   * two are concatenated before the URL is built.
   */
  const buildUrl = (path: string, query: URLSearchParams | undefined) => {
    const url = new URL(`${options.apiBaseUrl.replace(/\/+$/, "")}${path}`);
    if (query) url.search = query.toString();
    return url;
  };

  const sendRequest = async <Schema extends z.ZodType | undefined = undefined>(
    request: DiscordRequest<Schema>,
  ): Promise<DiscordResult<ResponseData<Schema>>> => {
    const { method, path, query, body, responseSchema, notFoundErrorCodes } =
      request;

    for (let retryCount = 0; ; retryCount++) {
      let response: Response;

      try {
        response = await fetch(buildUrl(path, query), {
          method,
          headers: {
            Authorization: `Bot ${options.botToken}`,
            ...(options.userAgent === undefined
              ? {}
              : { "User-Agent": options.userAgent }),
            ...(body === undefined
              ? {}
              : { "Content-Type": "application/json" }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(options.requestTimeoutMilliseconds),
          // The Next.js fetch must not cache a call to the API of Discord
          cache: "no-store",
        });
      } catch (error) {
        log.error("Discord API request failed", { path, method, error });
        return { outcome: DiscordOutcome.Failed };
      }

      if (!response.ok) {
        const errorBody = await readErrorBody(response);

        /**
         * Keyed on the error code of Discord rather than on the status: a 404
         * alone can just as well mean that the bot lost the guild, and
         * callers act destructively on this outcome.
         */
        if (
          errorBody?.code !== undefined &&
          notFoundErrorCodes?.includes(errorBody.code)
        ) {
          log.warn("Discord API reported the resource as gone", {
            path,
            method,
            discordErrorCode: errorBody.code,
          });
          return { outcome: DiscordOutcome.NotFound };
        }

        const retryAfterSeconds =
          response.status === 429
            ? getRetryAfterSeconds(response, errorBody?.retry_after)
            : null;
        const willRetry =
          retryAfterSeconds !== null &&
          retryCount < options.rateLimitRetry.maximumRetryCount &&
          retryAfterSeconds <= options.rateLimitRetry.maximumWaitSeconds;

        log.warn("Discord API rejected the request", {
          path,
          method,
          status: response.status,
          discordErrorCode: errorBody?.code,
          discordErrorMessage: errorBody?.message,
          willRetry,
        });

        if (!willRetry) return { outcome: DiscordOutcome.Failed };

        await setTimeout(Math.max(retryAfterSeconds, 0) * 1000);
        continue;
      }

      if (!responseSchema)
        return {
          outcome: DiscordOutcome.Success,
          data: null as ResponseData<Schema>,
        };

      try {
        const responseBody: unknown = await response.json();
        return {
          outcome: DiscordOutcome.Success,
          data: responseSchema.parse(responseBody) as ResponseData<Schema>,
        };
      } catch (error) {
        log.error("Discord API returned an unexpected response body", {
          path,
          method,
          error,
        });
        return { outcome: DiscordOutcome.Failed };
      }
    }
  };

  const send = <Schema extends z.ZodType | undefined = undefined>(
    request: DiscordRequest<Schema>,
  ) =>
    withSpan(options, `discord ${request.method}`, () => sendRequest(request));

  /**
   * Discord returns the users in ascending order of their ID. `after` is the
   * last user ID of the previous page.
   * https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users
   */
  const listScheduledEventUserIds: DiscordGateway["listScheduledEventUserIds"] =
    async (scheduledEventId) => {
      const userIds: string[] = [];

      for (
        let pageIndex = 0;
        pageIndex < MAXIMUM_USER_PAGE_COUNT;
        pageIndex++
      ) {
        const query = new URLSearchParams({
          with_member: "true",
          limit: String(USER_PAGE_SIZE),
        });
        const after = userIds.at(-1);
        if (after !== undefined) query.set("after", after);

        const page = await send({
          method: DiscordRequestMethod.Get,
          path: `${getScheduledEventPath(scheduledEventId)}/users`,
          query,
          responseSchema: scheduledEventUserIdsResponseSchema,
        });
        if (page.outcome !== DiscordOutcome.Success) return page;

        userIds.push(...page.data);
        if (page.data.length < USER_PAGE_SIZE)
          return { outcome: DiscordOutcome.Success, data: userIds };
      }

      log.error("Discord returned more users for the event than expected", {
        scheduledEventId,
        maximumUserCount: MAXIMUM_USER_PAGE_COUNT * USER_PAGE_SIZE,
      });
      return { outcome: DiscordOutcome.Failed };
    };

  return {
    listScheduledEvents: () =>
      send({
        method: DiscordRequestMethod.Get,
        path: scheduledEventsPath,
        // https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild
        query: new URLSearchParams({ with_user_count: "true" }),
        responseSchema: scheduledEventsResponseSchema,
      }),

    listScheduledEventUserIds,

    listChannels: () =>
      send({
        method: DiscordRequestMethod.Get,
        path: `${guildPath}/channels`,
        responseSchema: channelsResponseSchema,
      }),

    createScheduledEvent: (content, target) =>
      send({
        method: DiscordRequestMethod.Post,
        path: scheduledEventsPath,
        body: buildCreateGuildScheduledEventPayload(content, target),
        responseSchema: createdScheduledEventResponseSchema,
      }),

    modifyScheduledEvent: (scheduledEventId, change) =>
      send({
        method: DiscordRequestMethod.Patch,
        path: getScheduledEventPath(scheduledEventId),
        body: buildModifyGuildScheduledEventPayload(change),
        notFoundErrorCodes: NOT_FOUND_ERROR_CODES,
      }),

    deleteScheduledEvent: (scheduledEventId) =>
      send({
        method: DiscordRequestMethod.Delete,
        path: getScheduledEventPath(scheduledEventId),
        notFoundErrorCodes: NOT_FOUND_ERROR_CODES,
      }),
  };
};
