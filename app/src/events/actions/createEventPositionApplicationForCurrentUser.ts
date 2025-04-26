"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { isEventUpdatable } from "../utils/isEventUpdatable";

const schema = z.object({
  positionId: z.string().cuid(),
});

export const createEventPositionApplicationForCurrentUser = async (
  formData: FormData,
) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction(
      "createEventPositionApplicationForCurrentUser",
    );
    if (!authentication.session.entity)
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      positionId: formData.get("positionId"),
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };

    const position = await prisma.eventPosition.findUnique({
      where: {
        id: result.data.positionId,
      },
      include: {
        event: true,
      },
    });
    if (!position) return { error: "Posten nicht gefunden" };
    if (!isEventUpdatable(position.event))
      return { error: "Das Event ist bereits vorbei." };

    const participant = await prisma.eventDiscordParticipant.findUnique({
      where: {
        eventId_discordUserId: {
          eventId: position.event.id,
          discordUserId: authentication.session.discordId,
        },
      },
    });
    if (!participant)
      return { error: "Du bist nicht für dieses Event angemeldet." };

    /**
     * Create application
     */
    const createdApplication = await prisma.eventPositionApplication.create({
      data: {
        position: {
          connect: {
            id: result.data.positionId,
          },
        },
        citizen: {
          connect: {
            id: authentication.session.entity.id,
          },
        },
      },
      include: {
        position: {
          include: {
            event: true,
          },
        },
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(
      `/app/events/${createdApplication.position.event.id}/lineup`,
    );

    /**
     * Respond with the result
     */
    return {
      success:
        "Erfolgreich gespeichert. Die Anmeldung muss vom Organisator des Events bestätigt werden.",
    };
  } catch (error) {
    unstable_rethrow(error);
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error:
        "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
};
