import { cache } from "react";
import { z } from "zod";
import { env } from "~/env.mjs";

export const getEventUsers = cache(async (id: string) => {
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
  console.log(body);
  const data = scheduledEventUsersResponseSchema.parse(body);

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

  return data;
});

const scheduledEventUsersResponseSchema = z.union([
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
