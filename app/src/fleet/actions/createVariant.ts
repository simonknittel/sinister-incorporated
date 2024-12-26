"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { VariantStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  seriesId: z.string(),
  name: z.string().trim().min(1),
  status: z
    .enum([VariantStatus.FLIGHT_READY, VariantStatus.NOT_FLIGHT_READY])
    .optional(),
});

export const createVariant = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("createVariant");
    await authentication.authorizeAction(
      "manufacturersSeriesAndVariants",
      "manage",
    );

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      seriesId: formData.get("seriesId"),
      name: formData.get("name"),
      status: formData.has("status") ? formData.get("status") : undefined,
    });
    if (!result.success) {
      return {
        error: "Ungültige Anfrage",
      };
    }

    /**
     * Assign the ship to the user
     */
    const createdItem = await prisma.variant.create({
      data: result.data,
      include: {
        series: true,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(
      `/app/fleet/settings/manufacturers/${createdItem.series.manufacturerId}`,
    );
    revalidatePath(
      `/app/fleet/settings/manufacturers/${createdItem.series.manufacturerId}/series/${createdItem.seriesId}`,
    );

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gespeichert.",
    };
  } catch (error) {
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error:
        "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
};
