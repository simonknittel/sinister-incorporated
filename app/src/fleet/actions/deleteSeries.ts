"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteSeries = createAuthenticatedAction(
  "deleteSeries",
  schema,
  async (formData, authentication, data) => {
    if (
      !(await authentication.authorize(
        "manufacturersSeriesAndVariants",
        "manage",
      ))
    )
      return {
        error: "Du bist nicht berechtigt, diese Aktion auszuführen",
        requestPayload: formData,
      };

    /**
     * Delete
     */
    const deletedSeries = await prisma.series.delete({
      where: {
        id: data.id,
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/fleet/settings");
    revalidatePath(
      `/app/fleet/settings/manufacturers/${deletedSeries.manufacturerId}`,
    );
    revalidatePath("/app/fleet");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gelöscht",
    };
  },
);
