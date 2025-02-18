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

export const deleteEventPositionApplicationForCurrentUser = async (
  formData: FormData,
) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction(
      "deleteEventPositionApplicationForCurrentUser",
    );
    if (!authentication.session.entityId) throw new Error("Forbidden");

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
    const deletedApplication = await prisma.eventPositionApplication.delete({
      where: {
        positionId_citizenId: {
          citizenId: authentication.session.entityId,
          positionId: result.data.positionId,
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
      `/app/events/${deletedApplication.position.event.discordId}/lineup`,
    );

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
