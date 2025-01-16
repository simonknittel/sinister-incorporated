import { env } from "@/env";
import { cache } from "react";
import { z } from "zod";
import { checkResponseForError } from "./checkResponseForError";
import { memberSchema, userSchema } from "./schemas";

export const getEventUsers = cache(async (id: string) => {
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

  return data as z.infer<typeof successSchema>;
});

const successSchema = z.array(
  z.object({
    user: userSchema,
    member: memberSchema,
  }),
);

const errorSchema = z.object({
  message: z.string(),
});

const schema = z.union([successSchema, errorSchema]);
