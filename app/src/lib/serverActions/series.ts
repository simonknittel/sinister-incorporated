"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "../../server/db";
import { authenticateAction } from "../auth/server";
import { serverActionErrorHandler } from "./serverActionErrorHandler";
import { type ServerAction } from "./types";

const updatePayloadSchema = z.object({
  id: z.string().cuid2(),
  name: z.string().trim().min(1).optional(),
});

export const updateSeries: ServerAction<
  z.infer<typeof updatePayloadSchema>
> = async (payload) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateSeries");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id, ...data } = updatePayloadSchema.parse(payload);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.series.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.series.update({
      where: {
        id,
      },
      data,
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("series");
    revalidateTag(`series:${updatedItem.id}`);
    revalidateTag(`manufacturer:${updatedItem.manufacturerId}`);

    /**
     * Respond with the result
     */
    return {
      status: 200,
    };
  } catch (error) {
    return serverActionErrorHandler(error, {
      errorMessages: {
        "400": "Ungültige Anfrage",
        "401": "Du musst angemeldet sein, um diese Aktion auszuführen",
        "403": "Du bist nicht berechtigt, diese Aktion auszuführen",
        "404":
          "Beim Speichern ist ein Fehler aufgetreten. Die Series konnte nicht gefunden werden.",
        "409": "Konflikt. Bitte aktualisiere die Seite und probiere es erneut.",
        "500": "Beim Speichern ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};

const deletePayloadSchema = z.object({
  id: z.string().cuid2(),
});

export const deleteSeries: ServerAction<
  z.infer<typeof deletePayloadSchema>
> = async (payload) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteSeries");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id } = deletePayloadSchema.parse(payload);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.series.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Delete
     */
    const deletedItem = await prisma.series.delete({
      where: {
        id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("series");
    revalidateTag(`series:${deletedItem.id}`);
    revalidateTag(`manufacturer:${deletedItem.manufacturerId}`);

    /**
     * Respond with the result
     */
    return {
      status: 200,
    };
  } catch (error) {
    return serverActionErrorHandler(error, {
      errorMessages: {
        "400": "Ungültige Anfrage",
        "401": "Du musst angemeldet sein, um diese Aktion auszuführen",
        "403": "Du bist nicht berechtigt, diese Aktion auszuführen",
        "404":
          "Beim Löschen ist ein Fehler aufgetreten. Die Series konnte nicht gefunden werden.",
        "500": "Beim Löschen ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};
