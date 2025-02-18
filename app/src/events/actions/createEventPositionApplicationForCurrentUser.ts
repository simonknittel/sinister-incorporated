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
    if (!authentication.session.entityId)
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
            id: authentication.session.entityId,
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
      `/app/events/${createdApplication.position.event.discordId}/lineup`,
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
