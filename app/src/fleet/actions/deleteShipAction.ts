"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.cuid(),
});

export const deleteShipAction = createAuthenticatedAction(
  "deleteShip",
  schema,
  async (formData, authentication, data, t) => {
    if (!(await authentication.authorize("ship", "manage")))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Delete
     */
    await prisma.ship.delete({
      where: {
        id: data.id,
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
      success: t("Common.successfullyDeleted"),
    };
  },
);
