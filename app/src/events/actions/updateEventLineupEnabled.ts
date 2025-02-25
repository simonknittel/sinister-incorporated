"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { canEditEvent } from "../utils/canEditEvent";

const schema = z.object({
  eventId: z.string().cuid(),
  value: z.boolean(),
});

export const updateEventLineupEnabled = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    const authentication = await authenticateAction("updateEventLineupEnabled");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      eventId: formData.get("eventId"),
      value: formData.get("value"),
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };

    /**
     * Authorize the request
     */
    const event = await prisma.event.findUnique({
      where: {
        id: result.data.eventId,
      },
    });
    if (!event) return { error: "Event nicht gefunden" };
    if (!canEditEvent(event)) return { error: "Das Event ist bereits vorbei." };
    if (
      authentication.session.discordId !== event.discordCreatorId &&
      !(await authentication.authorize("othersEventPosition", "update"))
    )
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Create entry
     */
    await prisma.event.update({
      where: {
        id: result.data.eventId,
      },
      data: {
        lineupEnabled: result.data.value,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/events/${event.discordId}/lineup`);

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gespeichert.",
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
