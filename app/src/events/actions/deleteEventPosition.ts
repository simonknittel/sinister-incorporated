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
  id: z.string().cuid(),
});

export const deleteEventPosition = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    await authenticateAction("createEventPosition");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };

    /**
     * Authorize the request
     */
    const position = await prisma.eventPosition.findUnique({
      where: {
        id: result.data.id,
      },
      include: {
        event: true,
      },
    });
    if (!position) return { error: "Posten nicht gefunden" };
    if (!isEventUpdatable(position.event))
      return { error: "Das Event ist bereits vorbei." };
    if (!(await isAllowedToManagePositions(position.event)))
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Delete position
     */
    await prisma.eventPosition.delete({
      where: {
        id: result.data.id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/events/${position.event.discordId}/lineup`);

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gelöscht.",
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
