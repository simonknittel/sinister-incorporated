import { cache } from "react";
import { z } from "zod";
import { env } from "../env.mjs";
import { checkResponseForError } from "./checkResponseForError";

export const getEventUsersDeduped = cache(async (id: string) => {
  // https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events/${id}/users?with_member=true`,
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
  const data = schema.parse(body);

  checkResponseForError(data);

  return data;
});

const schema = z.union([
  z.array(
    z.object({
      user: z.object({
        id: z.string(),
        username: z.string(),
        global_name: z.string().optional().nullable(),
        avatar: z.string().optional().nullable(),
      }),
      member: z.object({
        nick: z.string().optional().nullable(),
        avatar: z.string().optional().nullable(),
      }),
    }),
  ),

  z.object({
    message: z.string(),
  }),
]);
