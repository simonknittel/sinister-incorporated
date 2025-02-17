"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  positionId: z.string().cuid(),
});

export const resetEventPositionAcceptedApplication = async (
  formData: FormData,
) => {
  try {
    /**
     * Authenticate
     */
    const authentication = await authenticateAction(
      "resetEventPositionAcceptedApplication",
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
    if (
      authentication.session.discordId !== position.event.discordCreatorId &&
      !(await authentication.authorize("othersEventPosition", "update"))
    )
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Update position
     */
    const updatedPosition = await prisma.eventPosition.update({
      where: {
        id: position.id,
      },
      data: {
        acceptedApplication: {
          disconnect: true,
        },
      },
      include: {
        event: true,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/events/${updatedPosition.event.discordId}/lineup`);

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
