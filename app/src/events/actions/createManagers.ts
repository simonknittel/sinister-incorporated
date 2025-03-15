"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { isAllowedToManageEvent } from "../utils/isAllowedToManageEvent";
import { isEventUpdatable } from "../utils/isEventUpdatable";

const schema = z.object({
  eventId: z.string().cuid(),
  managerIds: z.array(z.string().trim().cuid()),
});

export const createManagers = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    await authenticateAction("createManagers");

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      eventId: formData.get("eventId"),
      managerIds: formData.getAll("managerId[]"),
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
      include: {
        managers: true,
      },
    });
    if (!event) return { error: "Event nicht gefunden" };
    if (!isEventUpdatable(event))
      return { error: "Das Event ist bereits vorbei." };
    if (!(await isAllowedToManageEvent(event)))
      return { error: "Du bist nicht berechtigt, diese Aktion auszuführen." };

    /**
     * Create managers
     */
    await prisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        managers: {
          connect: result.data.managerIds.map((id) => ({
            id,
          })),
        },
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/events/${event.id}/participants`);

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
