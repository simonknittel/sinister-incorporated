"use server";

import { authenticateAction } from "@/auth/server";
import { serverActionErrorHandler } from "@/common/actions/serverActionErrorHandler";
import { type ServerAction } from "@/common/actions/types";
import { prisma } from "@/db";
import { VariantStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1).optional(),
  status: z
    .enum([VariantStatus.FLIGHT_READY, VariantStatus.NOT_FLIGHT_READY])
    .optional(),
});

export const updateVariant: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateVariant");
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
      status: formData.get("status"),
    });

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.variant.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.variant.update({
      where: {
        id,
      },
      data,
      include: {
        series: true,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(
      `/app/fleet/settings/manufacturers/${updatedItem.series.manufacturerId}`,
    );
    revalidatePath(
      `/app/fleet/settings/manufacturers/${updatedItem.series.manufacturerId}/series/${updatedItem.seriesId}`,
    );

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
          "Beim Speichern ist ein Fehler aufgetreten. Die Variante konnte nicht gefunden werden.",
        "409": "Konflikt. Bitte aktualisiere die Seite und probiere es erneut.",
        "500": "Beim Speichern ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};

const deleteSchema = z.object({
  id: z.string().cuid(),
});

export const deleteVariantAction: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteVariant");
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
    const existingItem = await prisma.variant.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Delete
     */
    const deletedItem = await prisma.variant.delete({
      where: {
        id,
      },
      include: {
        series: true,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(
      `/app/fleet/settings/manufacturers/${deletedItem.series.manufacturerId}`,
    );
    revalidatePath(
      `/app/fleet/settings/manufacturers/${deletedItem.series.manufacturerId}/series/${deletedItem.seriesId}`,
    );

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
          "Beim Löschen ist ein Fehler aufgetreten. Die Variante konnte nicht gefunden werden.",
        "500": "Beim Löschen ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};
