"use server";

import { authenticateAction } from "@/auth/server";
import { serverActionErrorHandler } from "@/common/actions/serverActionErrorHandler";
import { type ServerAction } from "@/common/actions/types";
import { prisma } from "@/db";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1).optional(),
});

export const updateSeries: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateSeries");
    await authentication.authorizeAction(
      "manufacturersSeriesAndVariants",
      "manage",
    );

    /**
     * Validate the request
     */
    const { id, ...data } = updateSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
    });

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
    revalidateTag(`manufacturer`);

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

const deleteSchema = z.object({
  id: z.string().cuid(),
});

export const deleteSeriesAction: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteSeries");
    await authentication.authorizeAction(
      "manufacturersSeriesAndVariants",
      "manage",
    );

    /**
     * Validate the request
     */
    const { id } = deleteSchema.parse({
      id: formData.get("id"),
    });

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
    revalidateTag(`manufacturer`);

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
