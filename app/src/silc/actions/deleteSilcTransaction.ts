"use server";

import { createAuthenticatedAction } from "@/common/actions/createAction";
import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateCitizensSilcBalances } from "../utils/updateCitizensSilcBalances";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteSilcTransaction = createAuthenticatedAction(
  "deleteSilcTransaction",
  schema,
  async (formData: FormData, authentication, data) => {
    if (
      !(await authentication.authorize(
        "silcTransactionOfOtherCitizen",
        "delete",
      ))
    )
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };
    if (!authentication.session.entityId)
      return {
        error: "Du bist nicht berechtigt, diese Aktion durchzuführen.",
        requestPayload: formData,
      };

    /**
     * (Soft-)delete transaction
     */
    const deletedEntry = await prisma.silcTransaction.update({
      where: {
        id: data.id,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: {
          connect: {
            id: authentication.session.entityId,
          },
        },
      },
    });

    /**
     * Update citizens' balances
     */
    await updateCitizensSilcBalances([deletedEntry.receiverId]);

    /**
     * Revalidate cache(s)
     */
    revalidatePath(`/app/silc`);
    revalidatePath("/app/silc/transactions");
    revalidatePath("/app/dashboard");

    /**
     * Respond with the result
     */
    return {
      success: "Erfolgreich gelöscht.",
    };
  },
);
