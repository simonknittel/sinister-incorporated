"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.string().cuid(),
});

export const deletePenaltyEntry = createAuthenticatedAction(
  "deletePenaltyEntry",
  schema,
  async (formData: FormData, authentication, data) => {
    if (!(await authentication.authorize("penaltyEntry", "delete")))
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };
    if (!authentication.session.entity)
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };

    /**
     * (Soft-)delete entry
     */
    const deletedEntry = await prisma.penaltyEntry.update({
      where: {
        id: data.id,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: {
          connect: {
            id: authentication.session.entity.id,
          },
        },
      },
    });

    /**
     * Revalidate cache(s)
     */
    revalidatePath(
      `/app/spynet/citizen/${deletedEntry.citizenId}/penalty-points`,
    );
    revalidatePath("/app/penalty-points");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gelöscht.",
    };
  },
);
