"use server";

import { authenticateAction } from "@/auth/server";
import { serverActionErrorHandler } from "@/common/actions/serverActionErrorHandler";
import type { ServerAction } from "@/common/actions/types";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteManufacturerAction: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteManufacturerAction");
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
    revalidatePath(`/app/fleet/settings`);
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
          "Beim Löschen ist ein Fehler aufgetreten. Der Hersteller konnte nicht gefunden werden.",
        "500": "Beim Löschen ist ein unerwarteter Fehler aufgetreten",
      },
    });
  }
};
