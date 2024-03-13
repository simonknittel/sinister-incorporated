import { cache } from "react";
import { z } from "zod";
import { env } from "~/env.mjs";

export const getEvent = cache(async (id: string) => {
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
  const data = scheduledEventResponseSchema.parse(body);

  if ("message" in data) {
    if (data.message === "You are being rate limited.") {
      throw new Error("Rate Limiting der Discord API");
    } else if (data.message === "Unknown Guild") {
      throw new Error(
        `Der Discord Server "${env.DISCORD_GUILD_ID}" existiert nicht.`,
      );
    } else if (data.message === "Missing Access") {
      throw new Error(
        `Diese Anwendung hat keinen Zugriff auf den Discord Server "${env.DISCORD_GUILD_ID}".`,
      );
    } else {
      throw new Error(data.message);
    }
  }

  return { date: response.headers.get("Date"), data };
});

const scheduledEventResponseSchema = z.union([
  z.object({
    id: z.string(),
    guild_id: z.string(),
    name: z.string(),
    image: z.string().optional().nullable(),
    scheduled_start_time: z.coerce.date(),
    scheduled_end_time: z.coerce.date(),
    user_count: z.number(),
    description: z.string().optional(),
  }),

  z.object({
    message: z.string(),
  }),
]);
