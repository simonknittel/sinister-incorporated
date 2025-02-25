import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { getEvents } from "@/discord/utils/getEvents";
import { getEventUsers } from "@/discord/utils/getEventUsers";
import type { eventSchema } from "@/discord/utils/schemas";
import { env } from "@/env";
import { publishNotification } from "@/pusher/utils/publishNotification";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import { NextResponse, type NextRequest } from "next/server";
import { type z } from "zod";

export async function POST(request: NextRequest) {
  try {
    if (
      env.CRON_SECRET &&
      request.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`
    )
      throw new Error("Unauthorized");

    const { data: currentEvents } = await getEvents();

    for (const currentEvent of currentEvents) {
      const existingEvent = await prisma.event.findUnique({
        where: {
          discordId: currentEvent.id,
        },
      });

      if (existingEvent) {
        const hasAnyChanges =
          existingEvent.name !== currentEvent.name ||
          existingEvent.startTime.getTime() !==
            currentEvent.scheduled_start_time.getTime() ||
          existingEvent.endTime?.getTime() !=
            currentEvent.scheduled_end_time?.getTime() ||
          existingEvent.description != currentEvent.description ||
          existingEvent.location != currentEvent.entity_metadata.location ||
          existingEvent.discordImage != currentEvent.image;

        if (hasAnyChanges) {
          await prisma.event.update({
            where: {
              id: existingEvent.id,
            },
            data: {
              name: currentEvent.name,
              startTime: currentEvent.scheduled_start_time,
              endTime: currentEvent.scheduled_end_time,
              description: currentEvent.description,
              location: currentEvent.entity_metadata.location,
              discordImage: currentEvent.image,
            },
          });
        }

        const hasChangesForNotification =
          existingEvent.name !== currentEvent.name ||
          existingEvent.startTime.getTime() !==
            currentEvent.scheduled_start_time.getTime() ||
          existingEvent.endTime?.getTime() !=
            currentEvent.scheduled_end_time?.getTime() ||
          existingEvent.description != currentEvent.description ||
          existingEvent.location != currentEvent.entity_metadata.location;

        if (hasChangesForNotification) {
          await publishNotification(
            ["updatedDiscordEvent"],
            "Event aktualisiert",
            currentEvent.name,
            `/app/events/${existingEvent.id}`,
          );
        }
      } else {
        const newEvent = await prisma.event.create({
          data: {
            discordId: currentEvent.id,
            discordCreatorId: currentEvent.creator_id,
            name: currentEvent.name,
            startTime: currentEvent.scheduled_start_time,
            endTime: currentEvent.scheduled_end_time,
            description: currentEvent.description,
            location: currentEvent.entity_metadata.location,
            discordImage: currentEvent.image,
            discordGuildId: currentEvent.guild_id,
          },
        });

        await publishNotification(
          ["newDiscordEvent"],
          "Neues Event",
          newEvent.name,
          `/app/events/${newEvent.id}`,
        );
      }

      await updateParticipants(currentEvent);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

const updateParticipants = async (
  discordEvent: z.infer<typeof eventSchema>,
) => {
  return getTracer().startActiveSpan("updateParticipants", async (span) => {
    try {
      const databaseEvent = await prisma.event.findUnique({
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
        await prisma.eventDiscordParticipant.findMany({
          where: {
            event: {
              discordId: discordEvent.id,
            },
          },
        })
      ).map((participant) => participant.discordUserId);

      // Collect new participants
      for (const userId of discordEventUserIds) {
        if (existingDatabaseParticipantIds.includes(userId)) continue;
        participants.create.push(userId);
      }

      // Collect removed participants
      for (const userId of existingDatabaseParticipantIds) {
        if (discordEventUserIds.includes(userId)) continue;
        participants.delete.push(userId);
      }

      // Save to database
      if (participants.delete.length > 0) {
        await prisma.eventDiscordParticipant.deleteMany({
          where: {
            eventId: databaseEvent.id,
            discordUserId: {
              in: participants.delete,
            },
          },
        });
      }
      if (participants.create.length > 0) {
        await prisma.eventDiscordParticipant.createMany({
          data: participants.create.map((participantId) => ({
            eventId: databaseEvent.id,
            discordUserId: participantId,
          })),
        });
      }
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
};
