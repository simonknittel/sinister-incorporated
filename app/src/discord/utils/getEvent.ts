import { env } from "@/env";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { cache } from "react";
import { z } from "zod";
import { checkResponseForError } from "./checkResponseForError";
import { eventSchema } from "./schemas";

export const getEvent = cache(async (id: string) => {
  return getTracer().startActiveSpan("getEvent", async (span) => {
    try {
      // https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events/${id}?with_user_count=true`,
        {
          headers: new Headers({
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
          }),
          next: {
            revalidate: 30,
          },
        },
      );

      const body: unknown = await response.json();
      const data = responseSchema.parse(body);

      checkResponseForError(data);

      return {
        date: response.headers.get("Date"),
        data: data as z.infer<typeof successSchema>,
      };
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

const successSchema = eventSchema;

const errorSchema = z.object({
  message: z.string(),
});

const responseSchema = z.union([successSchema, errorSchema]);
