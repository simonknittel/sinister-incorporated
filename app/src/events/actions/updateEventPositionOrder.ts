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
  id: z.string().cuid(),
  name: z.string().trim().max(256),
});

export const updateEventPositionOrder = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    const authentication = await authenticateAction("updateEventPositionOrder");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
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
    if (!canEditEvent(position.event))
      return { error: "Das Event ist bereits vorbei." };
    if (
      authentication.session.discordId !== position.event.discordCreatorId &&
      !(await authentication.authorize("othersEventPosition", "update"))
    )
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Update position
     */
    await prisma.eventPosition.update({
      where: {
        id: result.data.id,
      },
      data: {
        name: result.data.name,
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
