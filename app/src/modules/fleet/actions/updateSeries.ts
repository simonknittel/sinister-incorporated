"use server";

import { prisma } from "@/db";
import { requireAuthenticationAction } from "@/modules/auth/server";
import { serverActionErrorHandler } from "@/modules/common/actions/serverActionErrorHandler";
import type { ServerAction } from "@/modules/common/actions/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.cuid(),
  name: z.string().trim().min(1).optional(),
});

export const updateSeries: ServerAction = async (formData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await requireAuthenticationAction("updateSeries");
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
    revalidatePath("/app/fleet/org");
    revalidatePath("/app/fleet/my-ships");

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
