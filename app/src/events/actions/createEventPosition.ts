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
  name: z.string().trim().max(256),
  description: z.string().trim().max(512).optional(),
  variantId: z.union([z.string().cuid(), z.literal("-")]),
  parentPositionId: z.string().cuid().optional(),
});

export const createEventPosition = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    await authenticateAction("createEventPosition");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      eventId: formData.get("eventId"),
      name: formData.get("name"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
      variantId: formData.get("variantId"),
      parentPositionId: formData.has("parentPositionId")
        ? formData.get("parentPositionId")
        : undefined,
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
    if (!isEventUpdatable(event))
      return { error: "Das Event ist bereits vorbei." };
    if (!(await isAllowedToManagePositions(event)))
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Create entry
     */
    await prisma.eventPosition.create({
      data: {
        event: {
          connect: {
            id: result.data.eventId,
          },
        },
        name: result.data.name,
        description: result.data.description,
        requiredVariant:
          result.data.variantId !== "-"
            ? {
                connect: {
                  id: result.data.variantId,
                },
              }
            : {},
        ...(result.data.parentPositionId
          ? {
              parentPosition: {
                connect: {
                  id: result.data.parentPositionId,
                },
              },
            }
          : {}),
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
