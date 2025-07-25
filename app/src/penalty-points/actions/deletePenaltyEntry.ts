"use server";

import { createAuthenticatedAction } from "@/actions/utils/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id: z.cuid(),
});

export const deletePenaltyEntry = createAuthenticatedAction(
  "deletePenaltyEntry",
  schema,
  async (formData, authentication, data, t) => {
    if (!(await authentication.authorize("penaltyEntry", "delete")))
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };
    if (!authentication.session.entity)
      return {
        error: t("Common.forbidden"),
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
      success: t("Common.successfullyDeleted"),
    };
  },
);
