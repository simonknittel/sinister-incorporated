"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { serverActionErrorHandler } from "./serverActionErrorHandler";
import { type ServerAction } from "./types";

const updateSchema = zfd.formData({
  id: zfd.text(z.string().cuid2()),
  name: zfd.text(z.string().trim().optional()),
});

export const updateShip: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateShip");
    authentication.authorizeAction("ship", "manage");

    /**
     * Validate the request
     */
    const { id, ...data } = updateSchema.parse(formData);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.ship.findUnique({
      where: {
        id,
        ownerId: authentication.session.user.id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Update
     */
    await prisma.ship.update({
      where: {
        id,
        ownerId: authentication.session.user.id,
      },
      data,
    });

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
          "Beim Speichern ist ein Fehler aufgetreten. Das Schiff konnte nicht gefunden werden.",
        "409": "Konflikt. Bitte aktualisiere die Seite und probiere es erneut.",
        "500": "Beim Speichern ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};

const deleteSchema = zfd.formData({
  id: zfd.text(z.string().cuid2()),
});

export const deleteShip: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteShip");
    authentication.authorizeAction("ship", "manage");

    /**
     * Validate the request
     */
    const { id } = deleteSchema.parse(formData);

    /**
     * Make sure the item exists
     */
    const existingItem = await prisma.ship.findUnique({
      where: {
        id,
        ownerId: authentication.session.user.id,
      },
    });
    if (!existingItem) throw new Error("Not found");

    /**
     * Delete
     */
    await prisma.ship.delete({
      where: {
        id,
        ownerId: authentication.session.user.id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/fleet");

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
          "Beim Löschen ist ein Fehler aufgetreten. Das Schiff konnte nicht gefunden werden.",
        "500": "Beim Löschen ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};
