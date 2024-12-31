"use server";

import { authenticateAction } from "@/auth/server";
import { serverActionErrorHandler } from "@/common/actions/serverActionErrorHandler";
import { type ServerAction } from "@/common/actions/types";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteVariant: ServerAction = async (formData) => {
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
    const { id } = schema.parse({
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
