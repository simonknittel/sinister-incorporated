"use server";

import { authenticateAction } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";
import { updateCitizensSilcBalances } from "../utils/updateCitizensSilcBalances";

const schema = z.object({
  id: z.string().cuid(),
});

export const deleteSilcTransaction = async (formData: FormData) => {
  try {
    /**
     * Authenticate and authorize the request
     */
    const authentication = await authenticateAction("deleteSilcTransaction");
    await authentication.authorizeAction(
      "silcTransactionOfOtherCitizen",
      "delete",
    );
    if (!authentication.session.entityId)
      return { error: "Du bist nicht berechtigt, diese Aktion durchzuführen." };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id"),
    });
    if (!result.success)
      return {
        error: "Ungültige Anfrage",
      };

    /**
     * (Soft-)delete transaction
     */
    const deletedEntry = await prisma.silcTransaction.update({
      where: {
        id: result.data.id,
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
  } catch (error) {
    unstable_rethrow(error);
    void log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error:
        "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
    };
  }
};
