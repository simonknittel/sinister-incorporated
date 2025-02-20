import { prisma } from "@/db";
import type { DiscordEvent } from "@prisma/client";
import { cache } from "react";

export const getEventCitizen = cache(async (eventId: DiscordEvent["id"]) => {
  const databaseParticipants = await prisma.discordEventParticipant.findMany({
    where: {
      event: {
        id: eventId,
      },
    },
  });

  return await prisma.entity.findMany({
    where: {
      discordId: {
        in: databaseParticipants.map(
          (participant) => participant.discordUserId,
        ),
      },
    },
  });
});
