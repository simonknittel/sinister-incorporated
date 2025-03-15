"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { isAllowedToManagePositions } from "../utils/isAllowedToManagePositions";
import { isEventUpdatable } from "../utils/isEventUpdatable";

const schema = z.object({
  eventId: z.string().cuid(),
  value: z.coerce.boolean(),
});

export const updateEventLineupEnabled = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    await authenticateAction("updateEventLineupEnabled");

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
      include: {
        managers: true,
      },
    });
    if (!event) return { error: "Event nicht gefunden" };
    if (!isEventUpdatable(event))
      return { error: "Das Event ist bereits vorbei." };
    if (!(await isAllowedToManagePositions(event)))
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
    revalidatePath(`/app/events/${event.id}/lineup`);

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
