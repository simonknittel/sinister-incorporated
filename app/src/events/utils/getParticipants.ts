import { prisma } from "@/db";
import type { getEvent } from "@/discord/getEvent";
import { getEventUsersDeduped } from "@/discord/getEventUsers";
import { cache } from "react";

export const getParticipants = cache(
  async (event: Awaited<ReturnType<typeof getEvent>>["data"]) => {
    const discordEventUsers = await getEventUsersDeduped(event.id);

    const citizenEntities = await prisma.entity.findMany({
      where: {
        discordId: {
          in: discordEventUsers.map((user) => user.user.id),
        },
      },
    });

    const resolvedUsers = discordEventUsers
      .map((user) => {
        const entity = citizenEntities.find(
          (entity) => entity.discordId === user.user.id,
        );

        return {
          entity,
          discord: user,
        };
      })
      .toSorted((a, b) => {
        return (
          a.entity?.handle ||
          a.discord.member.nick ||
          a.discord.user.global_name ||
          a.discord.user.username
        ).localeCompare(
          b.entity?.handle ||
            b.discord.member.nick ||
            b.discord.user.global_name ||
            b.discord.user.username,
        );
      });

    const discordCreator = resolvedUsers.find(
      (user) => user.discord.user.id === event.creator_id,
    )!;
    const discordParticipants = resolvedUsers.filter(
      (user) => user.discord.user.id !== event.creator_id,
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
