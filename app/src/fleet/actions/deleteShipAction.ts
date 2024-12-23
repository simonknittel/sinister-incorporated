"use server";

import { authenticateAction } from "@/auth/server";
import { serverActionErrorHandler } from "@/common/actions/serverActionErrorHandler";
import { type ServerAction } from "@/common/actions/types";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  id: zfd.text(z.string().cuid()),
});

export const deleteShipAction: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteShipAction");
    authentication.authorizeAction("ship", "manage");

    /**
     * Validate the request
     */
    const { id } = schema.parse(formData);

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
