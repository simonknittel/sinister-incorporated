import { prisma } from "@/db";
import type { Event } from "@prisma/client";
import { cache } from "react";

export const getEventCitizen = cache(async (eventId: Event["id"]) => {
  const databaseParticipants = await prisma.eventDiscordParticipant.findMany({
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
