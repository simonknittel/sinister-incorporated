import { cache } from "react";
import { z } from "zod";
import { env } from "../env.mjs";
import { checkResponseForError } from "./checkResponseForError";

export const getEvents = cache(async () => {
  // https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
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
});

const successSchema = z.array(
  z.object({
    id: z.string(),
    guild_id: z.string(),
    name: z.string(),
    image: z.string().optional().nullable(),
    scheduled_start_time: z.coerce.date(),
    scheduled_end_time: z.coerce.date(),
    user_count: z.number(),
  }),
);

const errorSchema = z.object({
  message: z.string(),
});

const responseSchema = z.union([successSchema, errorSchema]);
