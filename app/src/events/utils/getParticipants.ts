import { prisma } from "@/db";
import type { getEvent } from "@/discord/utils/getEvent";
import { getEventUsers } from "@/discord/utils/getEventUsers";
import { type memberSchema, type userSchema } from "@/discord/utils/schemas";
import { cache } from "react";
import type { z } from "zod";

export const getParticipants = cache(
  async (discordEvent: Awaited<ReturnType<typeof getEvent>>["data"]) => {
    const discordEventUsers: {
      user: z.infer<typeof userSchema>;
      member?: z.infer<typeof memberSchema>;
    }[] = await getEventUsers(discordEvent.id);

    if (
      discordEventUsers.some(
        (user) => user.user.id === discordEvent.creator_id,
      ) === false
    ) {
      discordEventUsers.push({ user: discordEvent.creator });
    }

    const [citizenEntities, databaseEventParticipants] =
      await prisma.$transaction([
        prisma.entity.findMany({
          where: {
            discordId: {
              in: discordEventUsers.map((user) => user.user.id),
            },
          },
        }),

        prisma.discordEventParticipant.findMany({
          where: {
            event: {
              discordId: discordEvent.id,
            },
          },
        }),
      ]);

    const resolvedUsers = discordEventUsers
      .map((user) => {
        const entity = citizenEntities.find(
          (entity) => entity.discordId === user.user.id,
        );

        const databaseEventParticipant = databaseEventParticipants.find(
          (participant) => participant.discordUserId === user.user.id,
        );

        return {
          entity,
          discord: user,
          databaseEventParticipant,
        };
      })
      .toSorted((a, b) => {
        return (
          a.entity?.handle ||
          a.discord.member?.nick ||
          a.discord.user.global_name ||
          a.discord.user.username
        ).localeCompare(
          b.entity?.handle ||
            b.discord.member?.nick ||
            b.discord.user.global_name ||
            b.discord.user.username,
        );
      });

    const discordCreator = resolvedUsers.find(
      (user) => user.discord.user.id === discordEvent.creator_id,
    )!;
    const discordParticipants = resolvedUsers.filter(
      (user) => user.discord.user.id !== discordEvent.creator_id,
    );
    const spynetCitizen = resolvedUsers.filter((user) => Boolean(user.entity));

    return {
      resolvedUsers,
      discordCreator,
      discordParticipants,
      spynetCitizen,
    };
  },
);
