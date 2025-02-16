"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteEventPosition = async (formData: FormData) => {
  try {
    /**
     * Authenticate
     */
    const authentication = await authenticateAction("createEventPosition");

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
    const eventPosition = await prisma.eventPosition.findUnique({
      where: {
        id: result.data.id,
      },
      include: {
        event: true,
      },
    });
    if (
      authentication.session.discordId !==
        eventPosition?.event?.discordCreatorId &&
      !(await authentication.authorize("othersEventPosition", "create"))
    )
      throw new Error("Forbidden");

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
    revalidatePath(`/app/events/${eventPosition?.event.discordId}/lineup`);

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
