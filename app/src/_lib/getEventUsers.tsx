import { cache } from "react";
import { z } from "zod";
import { env } from "~/env.mjs";

export const getEventUsers = cache(async (id: string) => {
  if (env.NODE_ENV === "development") {
    const body = [
      {
        user: {
          id: "117890449187930113",
        },
      },
    ];

    const data = scheduledEventUsersResponseSchema.parse(body);

    if ("message" in data) throw new Error(data.message);

    return data;
  } else {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/scheduled-events/${id}/users`,
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
  }
});

const scheduledEventUsersResponseSchema = z.union([
  z.array(
    z.object({
      user: z.object({
        id: z.string(),
      }),
    }),
  ),

  z.object({
    message: z.string(),
  }),
]);
