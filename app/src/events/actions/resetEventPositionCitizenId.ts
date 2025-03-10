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
  positionId: z.string().cuid(),
});

export const resetEventPositionCitizenId = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    const authentication = await authenticateAction(
      "resetEventPositionCitizenId",
    );

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

    /**
     * Authorize the request
     */
    const position = await prisma.eventPosition.findUnique({
      where: {
        id: result.data.positionId,
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
        id: position.id,
      },
      data: {
        citizen: {
          disconnect: true,
        },
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
