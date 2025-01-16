import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { getEvents } from "@/discord/utils/getEvents";
import { env } from "@/env";
import { beamsClient } from "@/pusher/utils/beamsClient";
import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    if (
      env.CRON_SECRET &&
      request.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`
    )
      throw new Error("Unauthorized");

    const { data: events } = await getEvents();

    for (const event of events) {
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

        if (beamsClient) {
          await beamsClient.publishToInterests(["updatedDiscordEvent"], {
            web: {
              notification: {
                title: "Event aktualisiert | Sinister Incorporated",
                body: event.name,
                deep_link: `${env.BASE_URL}/app/events/${event.id}`,
              },
            },
          });
        }
      } else if (!existingEvent) {
        await prisma.discordEvent.create({
          data: {
            discordId: event.id,
            hash: hashHex,
          },
        });

        if (beamsClient) {
          await beamsClient.publishToInterests(["newDiscordEvent"], {
            web: {
              notification: {
                title: "Neues Event | Sinister Incorporated",
                body: event.name,
                deep_link: `${env.BASE_URL}/app/events/${event.id}`,
              },
            },
          });
        }
      } else {
        // Do nothing if event already exists and hash is the same (event details have not changed)
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
