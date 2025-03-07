import { env } from "@/env";
import { log } from "@/logging";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { setTimeout } from "node:timers/promises";
import { cache } from "react";
import { z } from "zod";
import { checkResponseForError } from "./checkResponseForError";
import { memberSchema, userSchema } from "./schemas";

export const getEventUsers = cache(async (discordId: string) => {
  return getTracer().startActiveSpan("getEventUsers", async (span) => {
    try {
      let response;
      const maxRetries = 5;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        response = await fetch(
          `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events/${discordId}/users?with_member=true`,
          {
            headers: new Headers({
              Authorization: `Bot ${env.DISCORD_TOKEN}`,
            }),
            cache: "no-store",
          },
        );
        if (response.status !== 429) break;
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfterSeconds = retryAfterHeader
          ? Number.parseInt(retryAfterHeader, 10)
          : 1;
        void log.warn("Hit rate limit of Discord", {
          endpoint: "getEventUsers",
          retryAfter: retryAfterSeconds,
          attempt,
          maxRetries,
        });
        await setTimeout(retryAfterSeconds * 1000);
      }
      if (!response) throw new Error("Failed to fetch");

      const body: unknown = await response.json();
      const data = schema.parse(body);

      checkResponseForError(data);

      return data as z.infer<typeof successSchema>;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});

const successSchema = z.array(
  z.object({
    user_id: z.string(),
    user: userSchema,
    member: memberSchema,
  }),
);

const errorSchema = z.object({
  message: z.string(),
});

const schema = z.union([successSchema, errorSchema]);
