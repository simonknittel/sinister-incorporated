"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { serverActionErrorHandler } from "./serverActionErrorHandler";
import { type ServerAction } from "./types";

/**
 * Make sure this file matches `/src/app/api/manufacturer/[id]`.
 */

const updateSchema = zfd.formData({
  id: zfd.text(z.string().cuid()),
  name: zfd.text(z.string().trim().min(1).optional()),
  imageId: zfd.text(z.string().trim().min(1).max(255).optional()),
});

export const updateManufacturer: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateManufacturer");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id, ...data } = updateSchema.parse(formData);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.manufacturer.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Update
     */
    const updatedItem = await prisma.manufacturer.update({
      where: {
        id,
      },
      data,
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("manufacturer");
    revalidateTag(`manufacturer:${updatedItem.id}`);

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
          "Beim Speichern ist ein Fehler aufgetreten. Der Hersteller konnte nicht gefunden werden.",
        "409": "Konflikt. Bitte aktualisiere die Seite und probiere es erneut.",
        "500": "Beim Speichern ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};

const deleteSchema = zfd.formData({
  id: zfd.text(z.string().cuid()),
});

export const deleteManufacturer: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteManufacturer");
    authentication.authorizeAction("manufacturersSeriesAndVariants", "manage");

    /**
     * Validate the request
     */
    const { id } = deleteSchema.parse(formData);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.manufacturer.findUnique({
      where: {
        id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Delete
     */
    await prisma.manufacturer.delete({
      where: {
        id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidateTag("manufacturer");
    revalidateTag(`manufacturer:${id}`);

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
          "Beim Löschen ist ein Fehler aufgetreten. Der Hersteller konnte nicht gefunden werden.",
        "500": "Beim Löschen ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};
