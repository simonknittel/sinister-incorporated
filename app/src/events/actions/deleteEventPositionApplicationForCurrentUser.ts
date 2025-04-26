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
    if (!authentication.session.entity) throw new Error("Forbidden");

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

    /**
     * Delete application
     */
    const deletedApplication = await prisma.eventPositionApplication.delete({
      where: {
        positionId_citizenId: {
          citizenId: authentication.session.entity.id,
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
      `/app/events/${deletedApplication.position.event.id}/lineup`,
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
