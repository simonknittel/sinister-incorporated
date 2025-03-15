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
  positionId: z.string().cuid(),
  name: z.string().trim().max(256),
  description: z.string().trim().max(512).optional(),
  variantId: z.union([z.string().cuid(), z.literal("-")]),
});

export const updateEventPosition = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    await authenticateAction("updateEventPosition");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      positionId: formData.get("positionId"),
      name: formData.get("name"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
      variantId: formData.get("variantId"),
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
    if (!isEventUpdatable(position.event))
      return { error: "Das Event ist bereits vorbei." };
    if (!(await isAllowedToManagePositions(position.event)))
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Update position
     */
    await prisma.eventPosition.update({
      where: {
        id: result.data.positionId,
      },
      data: {
        name: result.data.name,
        description: result.data.description,
        requiredVariant:
          result.data.variantId === "-"
            ? {
                disconnect: true,
              }
            : {
                connect: {
                  id: result.data.variantId,
                },
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
