"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteVariant = createAuthenticatedAction(
  "deleteVariant",
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
    const deletedItem = await prisma.variant.delete({
      where: {
        id: data.id,
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
    revalidatePath("/app/fleet");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gelöscht",
    };
  },
);
