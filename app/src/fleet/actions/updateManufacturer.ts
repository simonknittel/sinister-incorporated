"use server";

import { authenticateAction } from "@/auth/server";
import { serverActionErrorHandler } from "@/common/actions/serverActionErrorHandler";
import type { ServerAction } from "@/common/actions/types";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1).optional(),
  imageId: z.string().trim().min(1).max(255).optional(),
});

export const updateManufacturerAction: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("updateManufacturerAction");
    await authentication.authorizeAction(
      "manufacturersSeriesAndVariants",
      "manage",
    );

    /**
     * Validate the request
     */
    const { id, ...data } = schema.parse({
      id: formData.get("id"),
      name: formData.has("name") ? formData.get("name") : undefined,
      imageId: formData.has("imageId") ? formData.get("imageId") : undefined,
    });

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
    await prisma.manufacturer.update({
      where: {
        id,
      },
      data,
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/fleet/settings`);
    revalidatePath("/app/fleet");

    /**
     * Respond with the result
     */
    return {
      status: 200,
    };
  } catch (error) {
    console.log(error);
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
