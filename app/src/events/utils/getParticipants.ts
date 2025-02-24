import { prisma } from "@/db";
import type { DiscordEvent, DiscordEventParticipant } from "@prisma/client";
import { cache } from "react";

export const getParticipants = cache(
  async (
    event: DiscordEvent & {
      participants: DiscordEventParticipant[];
    },
  ) => {
    const discordUserIds = event.participants.map((user) => user.discordUserId);

    const citizens = await prisma.entity.findMany({
      where: {
        discordId: {
          in: discordUserIds,
        },
      },
    });

    const resolvedParticipants = citizens.map((citizen) => {
      const discordEventParticipant = event.participants.find(
        (participant) => participant.discordUserId === citizen.discordId,
      );

      return {
        participant: discordEventParticipant!,
        citizen,
      };
    });

    return resolvedParticipants;
  },
);
