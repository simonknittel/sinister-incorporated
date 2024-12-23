"use server";

import { authenticateAction } from "@/auth/server";
import { serverActionErrorHandler } from "@/common/actions/serverActionErrorHandler";
import { type ServerAction } from "@/common/actions/types";
import { prisma } from "@/db";
import { VariantStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

/**
 * Make sure this file matches `/src/app/api/variant/[id]`.
 */

const updateSchema = zfd.formData({
  id: zfd.text(z.string().cuid()),
  name: zfd.text(z.string().trim().min(1).optional()),
  status: zfd.text(
    z
      .enum([VariantStatus.FLIGHT_READY, VariantStatus.NOT_FLIGHT_READY])
      .optional(),
  ),
});

export const updateVariant: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateVariant");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id, ...data } = updateSchema.parse(formData);

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
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("variant");
    revalidateTag(`variant:${updatedItem.id}`);
    revalidateTag(`series:${updatedItem.seriesId}`);

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

const deleteSchema = zfd.formData({
  id: zfd.text(z.string().cuid()),
});

export const deleteVariant: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteVariant");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id } = deleteSchema.parse(formData);

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
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("variant");
    revalidateTag(`variant:${deletedItem.id}`);
    revalidateTag(`series:${deletedItem.seriesId}`);
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
          "Beim Löschen ist ein Fehler aufgetreten. Die Variante konnte nicht gefunden werden.",
        "500": "Beim Löschen ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};
