import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { getEvents } from "@/discord/utils/getEvents";
import { getEventUsers } from "@/discord/utils/getEventUsers";
import type { eventSchema } from "@/discord/utils/schemas";
import { env } from "@/env";
import { publishNotification } from "@/pusher/utils/publishNotification";
import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { type z } from "zod";

export async function POST(request: NextRequest) {
  try {
    if (
      env.CRON_SECRET &&
      request.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`
    )
      throw new Error("Unauthorized");

    const { data: events } = await getEvents();

    for (const event of events) {
      await setTimeout(5000); // Cheap way to avoid rate limiting

      const hash = createHash("md5");
      hash.update(
        JSON.stringify({
          name: event.name,
          scheduled_start_time: event.scheduled_start_time,
          scheduled_end_time: event.scheduled_end_time,
          description: event.description,
          location: event.entity_metadata.location,
        }),
      );
      const hashHex = hash.digest("hex");

      const existingEvent = await prisma.discordEvent.findUnique({
        where: {
          discordId: event.id,
        },
      });

      if (existingEvent && existingEvent.hash !== hashHex) {
        await prisma.discordEvent.update({
          where: {
            id: existingEvent.id,
          },
          data: {
            hash: hashHex,
          },
        });

        await publishNotification(
          ["updatedDiscordEvent"],
          "Event aktualisiert",
          event.name,
          `/app/events/${event.id}`,
        );
      } else if (!existingEvent) {
        await prisma.discordEvent.create({
          data: {
            discordId: event.id,
            hash: hashHex,
          },
        });

        await publishNotification(
          ["newDiscordEvent"],
          "Neues Event",
          event.name,
          `/app/events/${event.id}`,
        );
      } else {
        // Do nothing if event already exists and hash is the same (event details have not changed)
      }

      await updateParticipants(event);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

const updateParticipants = async (
  discordEvent: z.infer<typeof eventSchema>,
) => {
  const databaseEvent = await prisma.discordEvent.findUnique({
    where: {
      discordId: discordEvent.id,
    },
  });
  if (!databaseEvent) return;

  const participants: { create: string[]; delete: string[] } = {
    create: [],
    delete: [],
  };
  const discordEventUserIds = (await getEventUsers(discordEvent.id)).map(
    (user) => user.user_id,
  );
  const existingDatabaseParticipantIds = (
    await prisma.discordEventParticipant.findMany({
      where: {
        event: {
          discordId: discordEvent.id,
        },
      },
    })
  ).map((participant) => participant.discordUserId);

  // Collect new participants
  for (const userId of discordEventUserIds) {
    if (!existingDatabaseParticipantIds.includes(userId)) {
      participants.create.push(userId);
    }
  }

  // Collect removed participants
  for (const userId of existingDatabaseParticipantIds) {
    if (!discordEventUserIds.includes(userId)) {
      participants.delete.push(userId);
    }
  }

  // Save to database
  await prisma.$transaction([
    prisma.discordEventParticipant.deleteMany({
      where: {
        eventId: discordEvent.id,
        discordUserId: {
          in: participants.delete,
        },
      },
    }),

    prisma.discordEventParticipant.createMany({
      data: participants.create.map((participantId) => ({
        eventId: databaseEvent.id,
        discordUserId: participantId,
      })),
    }),
  ]);
};
