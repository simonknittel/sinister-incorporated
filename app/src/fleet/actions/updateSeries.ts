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
    const { id, ...data } = schema.parse({
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
    revalidatePath(`/app/fleet/settings`);
    revalidatePath(
      `/app/fleet/settings/manufacturers/${updatedItem.manufacturerId}`,
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
          "Beim Speichern ist ein Fehler aufgetreten. Die Series konnte nicht gefunden werden.",
        "409": "Konflikt. Bitte aktualisiere die Seite und probiere es erneut.",
        "500": "Beim Speichern ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};
