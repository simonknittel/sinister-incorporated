"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  eventId: z.string().cuid(),
  name: z.string().trim().max(256),
  description: z.string().trim().max(512).optional(),
  variantId: z.union([z.string().cuid(), z.literal("-")]),
});

export const createEventPosition = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    const authentication = await authenticateAction("createEventPosition");

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
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
        errorDetails: result.error,
      };

    /**
     * Authorize the request
     */
    const event = await prisma.discordEvent.findUnique({
      where: {
        id: result.data.eventId,
      },
    });
    if (!event) return { error: "Event nicht gefunden" };
    if (
      authentication.session.discordId !== event.discordCreatorId &&
      !(await authentication.authorize("othersEventPosition", "create"))
    )
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
